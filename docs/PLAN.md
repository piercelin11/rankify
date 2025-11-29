# Home Page (探索大廳) 實作計劃

**版本**: 2.1 (Code Review 優化版)
**PRD 版本**: 1.1 (MVP Final) + Addendum (Phase 1 範疇調整)
**負責人**: Miss June
**技術架構**: Next.js 15 App Router + Prisma + Server Actions
**預計完成時間**: TBD

---

## ⚠️ 重要修正說明

此版本基於原 v1.0 進行以下**關鍵修正** (v2.1 新增 Code Review 優化):

| 修正項目 | 原問題 | 修正方案 | 標記 |
|---------|--------|---------|------|
| Session 處理 | `getUserSession()` 在未登入時拋錯 | Phase 1 使用 `getUserSession()` (middleware 保證登入) | ✅ |
| Prisma 查詢語法 | `getTrendingArtists` 的 `orderBy` 語法錯誤 | 改用寫死 ID 方案 (MVP 需求) | 🔧 |
| 型別安全 | `draftState.percent` 可能 undefined | 信任過濾邏輯,簡化型別守衛 | 🔧 |
| 資料完整性 | `type=ALBUM` 但 `albumId=null` | 在 `createSubmission` 加入防禦性驗證 | 🔧 |
| 依賴套件 | `date-fns` 未安裝 | 加入安裝步驟到階段 0 | ✅ |
| 資料庫索引 | 搜尋無索引會很慢 | 加入 `@@index([name])` + 維持 `contains` | 🔧 |
| 路徑跳轉 | Album 搜尋路徑不明確 | 統一跳轉到 `/artist/${artistId}/album/${albumId}` | ✅ |
| Placeholder 路徑 | 寫死 `/placeholder.png` | 改用 `@/constants` 的 `PLACEHOLDER_PIC` | ✅ |
| Race Condition | 搜尋快速輸入時結果錯亂 | 加入 `AbortController` 立即修正 | 🔧 |
| N+1 查詢 | `getUserDashboardStats` 多一次查詢 | 用 `.then()` 整合進 Promise.all | 🔧 |
| NULL 防禦 | `completedAt` 可能為 null | 加入 `completedAt: { not: null }` 過濾 | 🔧 |

---

## 目錄

1. [專案概述](#1-專案概述)
2. [技術規格摘要](#2-技術規格摘要)
3. [資料層實作](#3-資料層實作)
4. [UI 元件實作](#4-ui-元件實作)
5. [頁面整合](#5-頁面整合)
6. [實作順序與檢查點](#6-實作順序與檢查點)
7. [測試計劃](#7-測試計劃)
8. [風險與注意事項](#8-風險與注意事項)

---

## 1. 專案概述

### 1.1 核心目標

> 讓使用者在 **3 秒內找到目標**（排名對象），透過數據回饋提升使用者的成就感與留存率。

### 1.2 ⚠️ Phase 1 範疇調整 (Addendum)

**變更**: 本階段僅實作 **「已登入視圖 (User Dashboard)」**。

**登入牆設定**: 未登入的使用者訪問 `/`,將由 **middleware 強制重定向** 至 `/auth/signin`。

**預留設計**: 「全域搜尋列」與「熱門歌手」兩個區塊,請開發為 **獨立且無狀態 (Stateless)** 的共用元件,以便 Phase 2 (訪客模式) 時能直接復用至 Landing Page。

**API 權限**: 搜尋相關的 Server Action (如 `searchArtistsAndAlbums`) 預設為 **Public (公開可讀)**,不綁定使用者 Session 驗證。

### 1.3 主要功能模組

| 模組 | 用途 | 顯示條件 (Phase 1) |
|------|------|--------------------|
| **個人儀表板** | 展示個人戰績（Gamification） | 已登入使用者 (必定顯示) |
| **全域搜尋列** | 快速搜尋 Artist/Album | 已登入使用者 (必定顯示) |
| **待辦事項（Drafts）** | 提示未完成的草稿 | 已登入 + 有 DRAFT 資料 |
| **最近活動** | 回顧近期排名 | 已登入 + 有 COMPLETED 資料 |
| **熱門歌手** | 冷啟動引導 | 已登入使用者 (必定顯示) |

### 1.4 頁面佈局結構

```
┌─────────────────────────────────────┐
│  個人儀表板 (Personal Dashboard)     │  ← Phase 1: 必定顯示
│  - 歡迎語                            │
│  - 3 欄數據概覽                      │
├─────────────────────────────────────┤
│  全域搜尋列 (Global Search)          │  ← Phase 1: 必定顯示
│  - 即時下拉選單                      │     Phase 2: 訪客也可用 ⚠️
├─────────────────────────────────────┤
│  待辦事項 (Drafts)                   │  ← 有草稿時顯示
│  - 橫向捲動卡片                      │
├─────────────────────────────────────┤
│  最近活動 (Recent History)           │  ← 有完成記錄時顯示
│  - 橫向捲動卡片 (最多 5 筆)         │
├─────────────────────────────────────┤
│  熱門歌手 (Trending Artists)         │  ← Phase 1: 必定顯示
│  - 格狀排列                          │     Phase 2: 訪客也可用 ⚠️
└─────────────────────────────────────┘
```

**⚠️ 標記說明**: Phase 2 時這些元件需要支援訪客模式

---

## 2. 技術規格摘要

### 2.1 技術棧

- **前端框架**: Next.js 15 (App Router)
- **資料庫**: PostgreSQL + Prisma ORM
- **UI 元件**: Radix UI + shadcn/ui + Tailwind CSS
- **狀態管理**: Server Components (無需 Client State)
- **搜尋**: Client Component + Server Action (debounce 1000ms)
- **時間格式化**: date-fns
- **驗證**: NextAuth.js (middleware 層級)

### 2.2 關鍵決策

| 項目 | 決策 | 理由 |
|------|------|------|
| 評鑑單曲總數 | 計算 `TrackRanking.count()` | 累計人次,包含重複排名 |
| 進度條數據 | 從 `draftState.percent` 讀取 | 避免 N+1 查詢 |
| 搜尋 UI | 即時下拉選單 | 符合「3 秒找到目標」需求 |
| 熱門歌手演算法 | 基於 `submissions._count` 排序 | 動態計算,避免 hardcode |
| 時間顯示 | `date-fns` 的 `formatDistanceToNow` | 「2 days ago」格式 |
| 首頁處理 | 完全替換現有首頁 | PRD 設計與現有首頁不同 |
| **✅ Session 處理** | **Phase 1 使用 `getUserSession()`** | **middleware 保證使用者已登入** |
| **🔧 資料庫索引** | **加入 `@@index([name])`** | **加速模糊搜尋** |
| **🔧 防禦性驗證** | **`createSubmission` 驗證 albumId** | **防止無效資料** |

### 2.3 依賴套件

**✅ 必須安裝**:

```bash
# 安裝 date-fns (時間格式化)
npm install date-fns
```

**確認已安裝** (專案已有):
- `@radix-ui/react-*` (UI 元件)
- `next-auth` (驗證)
- `@prisma/client` (ORM)

---

## 3. 資料層實作

### 3.1 資料庫 Schema 調整

#### 📁 `prisma/schema.prisma`

**🔧 新增索引** (加速搜尋):

```prisma
model Artist {
  id               String              @id
  name             String
  // ... 其他欄位

  @@index([name])  // 🔧 新增: 加速 name 模糊搜尋
}

model Album {
  id            String              @id
  name          String
  artistId      String
  // ... 其他欄位

  @@unique([name, artistId])
  @@index([artistId])
  @@index([name])  // 🔧 新增: 加速 name 模糊搜尋
}
```

**執行 Migration**:

```bash
npx prisma migrate dev --name add_search_indexes
npx prisma generate
```

**💡 索引說明**:

- `@@index([name])`: 單欄位 B-Tree 索引
- 用 `[]` 是因為 Prisma 支援複合索引 (例如 `@@index([artistId, name])`)
- **效能提升**:
  - 無索引: O(n) 全表掃描
  - 有索引: O(log n) 樹狀搜尋
  - 前綴匹配 (`LIKE 'Tay%'`): 索引完全有效
  - 中綴匹配 (`LIKE '%lor%'`): 索引部分有效

---

### 3.2 防禦性驗證調整

#### 📁 `src/features/sorter/actions/createSubmission.ts`

**🔧 新增驗證邏輯** (防止 `type=ALBUM` 但 `albumId=null`):

在第 27 行後加入:

```typescript
export async function createSubmission({
  selectedAlbumIds,
  selectedTrackIds,
  type,
  artistId,
  albumId,
}: CreateSubmissionProps): Promise<AppResponseType<RankingSubmissionData>> {
  try {
    const { id: userId } = await getUserSession();

    // 🔧 新增: 防禦性驗證
    if (type === "ALBUM" && !albumId) {
      return {
        type: "error",
        message: "Album sorter requires albumId",
      };
    }

    // ... 原有邏輯
  }
}
```

**修改位置**: `/Users/piercelin/Desktop/web-developement/Projects/rankify/src/features/sorter/actions/createSubmission.ts:27`

---

### 3.3 新增資料庫查詢函式

#### 📁 `src/services/home/getUserDashboardStats.ts`

**功能**: 取得個人儀表板的 3 項統計數據

**型別定義**:
```typescript
export type DashboardStatsType = {
  rankingCount: number;      // 已完成排名次數
  songCount: number;         // 評鑑單曲總數（累計人次）
  topArtist: {               // 本命歌手
    id: string;
    name: string;
    img: string | null;
  } | null;
};
```

**✅ 實作邏輯** (優化 Promise.all,消除 N+1 查詢):

```typescript
import { cache } from "react";
import { db } from "@/db/client";

export type DashboardStatsType = {
  rankingCount: number;
  songCount: number;
  topArtist: {
    id: string;
    name: string;
    img: string | null;
  } | null;
};

export const getUserDashboardStats = cache(
  async ({ userId }: { userId: string }): Promise<DashboardStatsType> => {
    // ✅ 並行查詢優化 (用 .then() 整合 topArtist 查詢)
    const [rankingCount, songCount, topArtist] = await Promise.all([
      // 1. 已完成排名次數
      db.rankingSubmission.count({
        where: { userId, status: "COMPLETED" },
      }),

      // 2. 評鑑單曲總數（累計人次）
      db.trackRanking.count({
        where: {
          userId,
          submission: { status: "COMPLETED" },
        },
      }),

      // 3. 本命歌手（互動場次最多）- 🟢 整合進 Promise.all
      db.rankingSubmission.groupBy({
        by: ["artistId"],
        where: { userId, status: "COMPLETED" },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 1,
      }).then(async (data) => {
        if (data.length === 0) return null;
        return db.artist.findUnique({
          where: { id: data[0].artistId },
          select: { id: true, name: true, img: true },
        });
      }),
    ]);

    return { rankingCount, songCount, topArtist };
  }
);
```

**檔案位置**: `src/services/home/getUserDashboardStats.ts`

---

#### 📁 `src/services/home/getUserDrafts.ts`

**功能**: 取得使用者的所有草稿（IN_PROGRESS 或 DRAFT 狀態）

**型別定義**:
```typescript
import { RankingSubmission, Artist, Album } from "@prisma/client";
import { SorterStateType } from "@/lib/schemas/sorter";

export type DraftItemType = RankingSubmission & {
  artist: Pick<Artist, "id" | "name" | "img">;
  album: Pick<Album, "id" | "name" | "img"> | null;
  draftState: SorterStateType;
};
```

**🔧 實作邏輯** (加入防禦性過濾):

```typescript
import { cache } from "react";
import { db } from "@/db/client";
import type { DraftItemType } from "@/types/home";

export const getUserDrafts = cache(
  async ({ userId }: { userId: string }): Promise<DraftItemType[]> => {
    const drafts = await db.rankingSubmission.findMany({
      where: {
        userId,
        status: { in: ["IN_PROGRESS", "DRAFT"] },
      },
      include: {
        artist: {
          select: { id: true, name: true, img: true },
        },
        album: {
          select: { id: true, name: true, img: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // 🔧 防禦性過濾: 移除無效資料
    return drafts.filter(draft => {
      // 驗證 1: ALBUM 類型必須有 albumId
      if (draft.type === "ALBUM" && !draft.albumId) {
        console.warn(
          `[Data Integrity] Invalid draft: type=ALBUM but albumId=null`,
          { draftId: draft.id, userId: draft.userId }
        );
        return false;
      }

      // 驗證 2: draftState 必須是有效物件且包含 percent
      if (
        !draft.draftState ||
        typeof draft.draftState !== 'object' ||
        Array.isArray(draft.draftState) ||
        !('percent' in draft.draftState)
      ) {
        console.warn(
          `[Data Integrity] Invalid draft: draftState missing or invalid`,
          { draftId: draft.id, userId: draft.userId }
        );
        return false;
      }

      return true;
    }) as DraftItemType[];
  }
);
```

**檔案位置**: `src/services/home/getUserDrafts.ts`

---

#### 📁 `src/services/home/getUserHistory.ts`

**功能**: 取得最近完成的排名記錄（最多 5 筆）

**型別定義**:
```typescript
import { RankingSubmission, Artist, Album } from "@prisma/client";

export type HistoryItemType = Pick<
  RankingSubmission,
  "id" | "type" | "completedAt" | "artistId" | "albumId"
> & {
  artist: Pick<Artist, "id" | "name" | "img">;
  album: Pick<Album, "id" | "name" | "img"> | null;
};
```

**實作邏輯** (🟢 加入 completedAt 防禦):
```typescript
import { cache } from "react";
import { db } from "@/db/client";
import type { HistoryItemType } from "@/types/home";

export const getUserHistory = cache(
  async ({
    userId,
    limit = 5
  }: {
    userId: string;
    limit?: number
  }): Promise<HistoryItemType[]> => {
    const history = await db.rankingSubmission.findMany({
      where: {
        userId,
        status: "COMPLETED",
        completedAt: { not: null },  // 🟢 防禦性過濾
      },
      select: {
        id: true,
        type: true,
        completedAt: true,
        artistId: true,
        albumId: true,
        artist: {
          select: { id: true, name: true, img: true },
        },
        album: {
          select: { id: true, name: true, img: true },
        },
      },
      orderBy: { completedAt: "desc" },
      take: limit,
    });

    return history as HistoryItemType[];
  }
);
```

**檔案位置**: `src/services/home/getUserHistory.ts`

---

#### 📁 `src/services/home/getTrendingArtists.ts`

**功能**: 取得熱門歌手（MVP 階段使用固定 ID 清單）

**型別定義**:
```typescript
export type TrendingArtistType = {
  id: string;
  name: string;
  img: string | null;
};
```

**🔧 實作邏輯** (寫死 ID 方案 - 選項 B):

```typescript
import { cache } from "react";
import { db } from "@/db/client";
import type { TrendingArtistType } from "@/types/home";
import { FEATURED_ARTIST_IDS } from "@/constants/featured";

export const getTrendingArtists = cache(
  async (): Promise<TrendingArtistType[]> => {
    // 🟢 從資料庫查詢固定 ID 的歌手
    const artists = await db.artist.findMany({
      where: { id: { in: FEATURED_ARTIST_IDS } },
      select: { id: true, name: true, img: true },
    });

    // 🟢 按照 FEATURED_ARTIST_IDS 的順序排列
    return FEATURED_ARTIST_IDS
      .map(id => artists.find(a => a.id === id))
      .filter((artist): artist is TrendingArtistType => artist !== undefined);
  }
);
```

**檔案位置**: `src/services/home/getTrendingArtists.ts`

**💡 為什麼用固定 ID 而非動態計算?**

MVP 階段由 PM 決定使用固定的精選歌手清單,確保新系統的使用者體驗一致性。未來可改回動態計算(基於 `submissions._count` 排序),只需修改此函式邏輯即可。

**依賴檔案**: `src/constants/featured.ts` (需新增,見下方說明)

---

#### 📁 `src/features/home/actions/searchArtistsAndAlbums.ts`

**功能**: 全域搜尋 Server Action（支援 Artist 和 Album 搜尋）

**型別定義**:
```typescript
export type SearchResultType = {
  artists: Array<{
    id: string;
    name: string;
    img: string | null;
    type: "artist";
  }>;
  albums: Array<{
    id: string;
    name: string;
    img: string | null;
    artistId: string;      // ✅ 新增: 支援正確跳轉
    artistName: string;
    type: "album";
  }>;
};
```

**✅ 實作邏輯** (新增 artistId):

```typescript
"use server";

import { db } from "@/db/client";

export type SearchResultType = {
  artists: Array<{
    id: string;
    name: string;
    img: string | null;
    type: "artist";
  }>;
  albums: Array<{
    id: string;
    name: string;
    img: string | null;
    artistId: string;  // ✅ 新增
    artistName: string;
    type: "album";
  }>;
};

export default async function searchArtistsAndAlbums({
  query,
}: {
  query: string;
}): Promise<SearchResultType> {
  if (!query.trim()) {
    return { artists: [], albums: [] };
  }

  const searchTerm = query.trim();

  // 並行查詢 Artists 和 Albums
  const [artists, albums] = await Promise.all([
    db.artist.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: "insensitive", // 不區分大小寫
        },
      },
      select: {
        id: true,
        name: true,
        img: true,
      },
      take: 5, // 限制結果數量
    }),
    db.album.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        img: true,
        artistId: true,  // ✅ 新增: 用於跳轉
        artist: {
          select: { name: true },
        },
      },
      take: 5,
    }),
  ]);

  return {
    artists: artists.map((artist) => ({
      ...artist,
      type: "artist" as const,
    })),
    albums: albums.map((album) => ({
      id: album.id,
      name: album.name,
      img: album.img,
      artistId: album.artistId,  // ✅ 新增
      artistName: album.artist.name,
      type: "album" as const,
    })),
  };
}
```

**檔案位置**: `src/features/home/actions/searchArtistsAndAlbums.ts`

**⚠️ Phase 2 注意**: 此 Server Action 設計為 Public,不綁定 userId,以便未來訪客也能搜尋。

---

#### 📁 `src/constants/featured.ts`

**功能**: 定義熱門歌手的固定 ID 清單（MVP 階段使用）

**實作**:
```typescript
/**
 * 熱門歌手 ID 清單
 * MVP 階段使用固定清單,由 PM 指定
 *
 * TODO: 從資料庫取得實際的歌手 ID 後填入
 * 範例格式: ['artist-id-1', 'artist-id-2', ...]
 */
export const FEATURED_ARTIST_IDS: string[] = [
  // TODO: 填入 10 個歌手的 ID (按顯示順序)
  'placeholder-id-1',
  'placeholder-id-2',
  'placeholder-id-3',
  'placeholder-id-4',
  'placeholder-id-5',
  'placeholder-id-6',
  'placeholder-id-7',
  'placeholder-id-8',
  'placeholder-id-9',
  'placeholder-id-10',
];
```

**檔案位置**: `src/constants/featured.ts`

**⚠️ 重要**: 在實作階段 2 時,請用實際的歌手 ID 替換 placeholder。

---

### 3.4 型別定義檔案

#### 📁 `src/types/home.ts`

**整合所有 Home Page 相關型別**:

```typescript
import { Artist, Album, RankingSubmission } from "@prisma/client";
import { SorterStateType } from "@/lib/schemas/sorter";

// ========== Dashboard ==========
export type DashboardStatsType = {
  rankingCount: number;
  songCount: number;
  topArtist: {
    id: string;
    name: string;
    img: string | null;
  } | null;
};

// ========== Drafts ==========
export type DraftItemType = RankingSubmission & {
  artist: Pick<Artist, "id" | "name" | "img">;
  album: Pick<Album, "id" | "name" | "img"> | null;
  draftState: SorterStateType;
};

// ========== History ==========
export type HistoryItemType = Pick<
  RankingSubmission,
  "id" | "type" | "completedAt" | "artistId" | "albumId"
> & {
  artist: Pick<Artist, "id" | "name" | "img">;
  album: Pick<Album, "id" | "name" | "img"> | null;
};

// ========== Trending ==========
export type TrendingArtistType = {
  id: string;
  name: string;
  img: string | null;
};

// ========== Search ==========
export type SearchResultType = {
  artists: Array<{
    id: string;
    name: string;
    img: string | null;
    type: "artist";
  }>;
  albums: Array<{
    id: string;
    name: string;
    img: string | null;
    artistId: string;
    artistName: string;
    type: "album";
  }>;
};
```

**檔案位置**: `src/types/home.ts`

---

## 4. UI 元件實作

### 4.1 個人儀表板

#### 📁 `src/features/home/components/DashboardSection.tsx`

**功能**: 展示個人戰績的 3 欄數據卡片

**使用元件**:
- `Card`, `CardHeader`, `CardTitle`, `CardContent` from `@/components/ui/card`

**實作**:
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { DashboardStatsType } from "@/types/home";

type DashboardSectionProps = {
  stats: DashboardStatsType;
  userName?: string | null;
};

export default function DashboardSection({ stats, userName }: DashboardSectionProps) {
  return (
    <section className="space-y-6">
      {/* 歡迎語 */}
      <h1 className="text-3xl font-bold">
        Hi, {userName || "User"}
      </h1>

      {/* 3 欄數據概覽 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* 已完成排名 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">已完成排名</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.rankingCount}</div>
            <p className="text-xs text-muted-foreground">次排名達成</p>
          </CardContent>
        </Card>

        {/* 評鑑單曲總數 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">評鑑單曲總數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.songCount}</div>
            <p className="text-xs text-muted-foreground">首單曲已評分</p>
          </CardContent>
        </Card>

        {/* 本命歌手 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">本命歌手</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.topArtist?.name || "—"}
            </div>
            <p className="text-xs text-muted-foreground">最常排名</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
```

**檔案位置**: `src/features/home/components/DashboardSection.tsx`

---

### 4.2 全域搜尋列

#### 📁 `src/features/home/components/GlobalSearch.tsx`

**功能**: 即時搜尋 Artists 和 Albums,下拉顯示結果

**使用元件**:
- `Input` from `@/components/ui/input`
- `Popover`, `PopoverContent` from `@/components/ui/popover`
- `Separator` from `@/components/ui/separator`

**✅ 實作** (修正跳轉路徑 + 標註 TODO):

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import searchArtistsAndAlbums from "@/features/home/actions/searchArtistsAndAlbums";
import type { SearchResultType } from "@/types/home";
import { PLACEHOLDER_PIC } from "@/constants";  // ✅ 改用專案慣例

export default function GlobalSearch() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<SearchResultType | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Debounce 搜尋 + 🟢 Race Condition 防護
  useEffect(() => {
    if (!inputValue.trim()) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    const abortController = new AbortController();  // 🟢 用於取消過時的請求

    const timer = setTimeout(async () => {
      try {
        const data = await searchArtistsAndAlbums({ query: inputValue });

        // 🟢 只在請求未被取消時更新狀態
        if (!abortController.signal.aborted) {
          setResults(data);
          setIsOpen(true);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Search error:", error);
          setResults(null);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 1000); // 1 秒 debounce

    return () => {
      clearTimeout(timer);
      abortController.abort();  // 🟢 清理時取消請求
    };
  }, [inputValue]);

  const handleNavigate = (
    type: "artist" | "album",
    id: string,
    artistId?: string
  ) => {
    setIsOpen(false);
    setInputValue("");

    if (type === "artist") {
      router.push(`/artist/${id}/my-stats`);
    } else if (artistId) {
      // ✅ 修正: 跳轉到正確的 Album 頁面
      router.push(`/artist/${artistId}/album/${id}`);
    }
  };

  const hasResults = results && (results.artists.length > 0 || results.albums.length > 0);

  return (
    <Popover open={isOpen && hasResults} onOpenChange={setIsOpen}>
      <div className="relative w-full">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search for artists or albums..."
          className="pl-9"
          autoComplete="off"
        />
      </div>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-[400px] overflow-y-auto">
          {/* Artists */}
          {results?.artists && results.artists.length > 0 && (
            <div className="p-2">
              <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Artists</p>
              {results.artists.map((artist) => (
                <div
                  key={artist.id}
                  onClick={() => handleNavigate("artist", artist.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-accent"
                >
                  <Image
                    src={artist.img || PLACEHOLDER_PIC}
                    alt={artist.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium">{artist.name}</p>
                    <p className="text-xs text-muted-foreground">Artist</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Separator */}
          {results?.artists.length > 0 && results?.albums.length > 0 && <Separator />}

          {/* Albums */}
          {results?.albums && results.albums.length > 0 && (
            <div className="p-2">
              <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Albums</p>
              {results.albums.map((album) => (
                <div
                  key={album.id}
                  onClick={() => handleNavigate("album", album.id, album.artistId)}
                  className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-accent"
                >
                  <Image
                    src={album.img || PLACEHOLDER_PIC}
                    alt={album.name}
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                  <div className="overflow-hidden">
                    <p className="truncate font-medium">{album.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{album.artistName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!isSearching && results && !hasResults && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}

          {/* Loading - 🟢 避免閃爍 */}
          {isSearching && !results && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**檔案位置**: `src/features/home/components/GlobalSearch.tsx`

**⚠️ Phase 2 注意**: 此元件設計為無狀態,可直接復用到 Landing Page。

---

### 4.3 待辦事項（Drafts）

#### 📁 `src/features/home/components/DraftsSection.tsx`

**功能**: 橫向捲動顯示草稿卡片

**使用元件**:
- `Card`, `CardContent` from `@/components/ui/card`
- `Progress` from `@/components/ui/progress`
- `Badge` from `@/components/ui/badge`

**🔧 實作** (加入型別守衛):

```tsx
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { DraftItemType } from "@/types/home";
import type { SorterStateType } from "@/lib/schemas/sorter";
import { PLACEHOLDER_PIC } from "@/constants";  // ✅ 改用專案慣例

type DraftsSectionProps = {
  drafts: DraftItemType[];
};

export default function DraftsSection({ drafts }: DraftsSectionProps) {
  if (drafts.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">繼續你的排名</h2>

      {/* 橫向捲動容器 */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {drafts.map((draft) => {
          // 🟢 信任過濾邏輯,簡化型別守衛
          const progress = Math.round(draft.draftState.percent);

          const targetType = draft.type.toLowerCase(); // "artist" | "album"
          const targetId = draft.type === "ARTIST"
            ? draft.artistId
            : draft.albumId;  // 🟢 移除不必要的 fallback

          const displayName = draft.type === "ARTIST"
            ? draft.artist.name
            : draft.album?.name || "Unknown";

          const displayImg = draft.type === "ARTIST"
            ? draft.artist.img
            : draft.album?.img;

          return (
            <Link
              key={draft.id}
              href={`/sorter/${targetType}/${targetId}`}
              className="group"
            >
              <Card className="w-[200px] flex-shrink-0 transition-transform hover:scale-105">
                <CardContent className="space-y-3 p-4">
                  {/* 封面 */}
                  <div className="relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={displayImg || PLACEHOLDER_PIC}
                      alt={displayName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* 標題 */}
                  <h3 className="truncate font-semibold">{displayName}</h3>

                  {/* 進度條 */}
                  <div className="space-y-1">
                    <Progress value={progress} />
                    <p className="text-xs text-muted-foreground">{progress}% complete</p>
                  </div>

                  {/* Badge */}
                  <Badge variant="secondary">
                    Draft
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
```

**檔案位置**: `src/features/home/components/DraftsSection.tsx`

---

### 4.4 最近活動（Recent History）

#### 📁 `src/features/home/components/HistorySection.tsx`

**功能**: 橫向捲動顯示最近完成的排名（使用現有 GalleryItem 元件）

**使用元件**:
- `GalleryItem` from `@/components/presentation/GalleryItem`

**實作**:
```tsx
import type { HistoryItemType } from "@/types/home";
import GalleryItem from "@/components/presentation/GalleryItem";
import { formatDistanceToNow } from "date-fns";

type HistorySectionProps = {
  history: HistoryItemType[];
};

export default function HistorySection({ history }: HistorySectionProps) {
  if (history.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">最近完成</h2>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {history.map((item) => {
          const displayName = item.type === "ARTIST"
            ? item.artist.name
            : item.album?.name || "Unknown";

          const displayImg = item.type === "ARTIST"
            ? item.artist.img
            : item.album?.img;

          const relativeTime = item.completedAt
            ? formatDistanceToNow(new Date(item.completedAt), { addSuffix: true })
            : "";

          return (
            <div key={item.id} className="w-[160px] flex-shrink-0">
              <GalleryItem
                href={`/artist/${item.artistId}/my-stats?submissionId=${item.id}`}
                img={displayImg}
                title={displayName}
                subTitle={relativeTime}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

**檔案位置**: `src/features/home/components/HistorySection.tsx`

**💡 國際化 (未來優化)**:
```typescript
import { zhTW } from "date-fns/locale";

formatDistanceToNow(date, {
  addSuffix: true,
  locale: zhTW  // "2 天前"
});
```

---

### 4.5 熱門歌手

#### 📁 `src/features/home/components/TrendingSection.tsx`

**功能**: 格狀排列展示熱門歌手（使用現有 GalleryWrapper 和 GalleryItem）

**使用元件**:
- `GalleryWrapper` from `@/components/presentation/GalleryWrapper`
- `GalleryItem` from `@/components/presentation/GalleryItem`

**實作**:
```tsx
import type { TrendingArtistType } from "@/types/home";
import GalleryWrapper from "@/components/presentation/GalleryWrapper";
import GalleryItem from "@/components/presentation/GalleryItem";

type TrendingSectionProps = {
  artists: TrendingArtistType[];
};

export default function TrendingSection({ artists }: TrendingSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">熱門歌手</h2>

      <GalleryWrapper>
        {artists.map((artist) => (
          <GalleryItem
            key={artist.id}
            href={`/artist/${artist.id}/my-stats`}
            img={artist.img}
            title={artist.name}
            subTitle="Artist"
          />
        ))}
      </GalleryWrapper>
    </section>
  );
}
```

**檔案位置**: `src/features/home/components/TrendingSection.tsx`

**⚠️ Phase 2 注意**: 此元件設計為無狀態,可直接復用到 Landing Page。

---

## 5. 頁面整合

### 📁 `src/app/(main)/page.tsx`

**功能**: Home Page 主頁面（Phase 1: 已登入視圖）

**✅ 實作** (使用 `getUserSession()`):

```tsx
import { getUserSession } from "@/../auth";  // ✅ Phase 1: 使用 getUserSession
import { getUserDashboardStats } from "@/services/home/getUserDashboardStats";
import { getUserDrafts } from "@/services/home/getUserDrafts";
import { getUserHistory } from "@/services/home/getUserHistory";
import { getTrendingArtists } from "@/services/home/getTrendingArtists";
import DashboardSection from "@/features/home/components/DashboardSection";
import GlobalSearch from "@/features/home/components/GlobalSearch";
import DraftsSection from "@/features/home/components/DraftsSection";
import HistorySection from "@/features/home/components/HistorySection";
import TrendingSection from "@/features/home/components/TrendingSection";

export default async function HomePage() {
  // ✅ Phase 1: 使用 getUserSession (middleware 保證使用者已登入)
  const user = await getUserSession();
  const userId = user.id;

  // 並行查詢所有資料
  const [stats, drafts, history, trending] = await Promise.all([
    getUserDashboardStats({ userId }),
    getUserDrafts({ userId }),
    getUserHistory({ userId, limit: 5 }),
    getTrendingArtists(),
  ]);

  return (
    <div className="container mx-auto space-y-12 py-8">
      {/* 個人儀表板 */}
      <DashboardSection stats={stats} userName={user.name} />

      {/* 全域搜尋列 (⚠️ Phase 2 可復用) */}
      <div className="mx-auto max-w-2xl">
        <GlobalSearch />
      </div>

      {/* 待辦事項（有草稿時顯示） */}
      {drafts.length > 0 && <DraftsSection drafts={drafts} />}

      {/* 最近活動（有完成記錄時顯示） */}
      {history.length > 0 && <HistorySection history={history} />}

      {/* 熱門歌手 (⚠️ Phase 2 可復用) */}
      <TrendingSection artists={trending} />
    </div>
  );
}
```

**檔案位置**: `src/app/(main)/page.tsx`

**⚠️ Phase 2 遷移指南**:

當要開放訪客模式時,改為:

```tsx
// Phase 2 版本
import { auth } from "@/../auth";  // 改用 auth()

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    // 已登入: 顯示 Dashboard + Drafts + History + Trending
    const [stats, drafts, history, trending] = await Promise.all([...]);
    return <UserDashboard ... />;
  } else {
    // 訪客: 顯示 Landing Page + GlobalSearch + Trending
    const trending = await getTrendingArtists();
    return <LandingPage trending={trending} />;
  }
}
```

同時在 `src/config/route.ts` 加入:
```typescript
export const publicRoutes = [
  "/",  // Phase 2: 開放首頁給訪客
];
```

---

## 6. 實作順序與檢查點

### 階段 0: 前置修復 (必須)

**🔧 安裝依賴**:

```bash
npm install date-fns
```

**🔧 修改資料庫 Schema**:

編輯 `prisma/schema.prisma`,在 Artist 和 Album model 加入:

```prisma
model Artist {
  // ... 現有欄位
  @@index([name])  // 新增
}

model Album {
  // ... 現有欄位
  @@index([name])  // 新增
}
```

**🔧 執行 Migration**:

```bash
npx prisma migrate dev --name add_search_indexes
npx prisma generate
```

**🔧 修改 createSubmission**:

在 `src/features/sorter/actions/createSubmission.ts` 第 27 行後加入:

```typescript
// 防禦性驗證
if (type === "ALBUM" && !albumId) {
  return {
    type: "error",
    message: "Album sorter requires albumId",
  };
}
```

**檢查點 0**:
```bash
npx tsc --noEmit  # 確認無型別錯誤
npm run lint      # 確認無 linting 錯誤
```

---

### 階段 1: 環境準備

- [x] **1.1** 確認 `date-fns` 已安裝 (階段 0 完成)
- [ ] **1.2** 建立目錄結構
  ```bash
  mkdir -p src/services/home
  mkdir -p src/features/home/components
  mkdir -p src/features/home/actions
  ```

---

### 階段 2: 資料層實作

- [ ] **2.1** 建立型別定義 `src/types/home.ts`
- [ ] **2.2** 實作 `getUserDashboardStats.ts` (🟢 優化版,含 `.then()`)
- [ ] **2.3** 實作 `getUserDrafts.ts` (含防禦性過濾)
- [ ] **2.4** 實作 `getUserHistory.ts` (🟢 含 `completedAt` 防禦)
- [ ] **2.5** 實作 `getTrendingArtists.ts` (🟢 寫死 ID 方案)
- [ ] **2.6** 實作 `searchArtistsAndAlbums.ts` (含 artistId)
- [ ] **2.7** 建立 `src/constants/featured.ts` (🟢 v2.1 新增)

**檢查點 2**:
```bash
npx tsc --noEmit  # 確認無型別錯誤
```

---

### 階段 3: UI 元件實作

- [ ] **3.1** 實作 `DashboardSection.tsx`
- [ ] **3.2** 實作 `GlobalSearch.tsx` (🟢 含 `AbortController`)
- [ ] **3.3** 實作 `DraftsSection.tsx` (🟢 簡化型別守衛)
- [ ] **3.4** 實作 `HistorySection.tsx`
- [ ] **3.5** 實作 `TrendingSection.tsx`

**檢查點 3**:
```bash
npm run lint           # 確認無 linting 錯誤
npx tsc --noEmit       # 確認無型別錯誤
```

---

### 階段 4: 頁面整合

- [ ] **4.1** 備份現有首頁
  ```bash
  cp src/app/(main)/page.tsx src/app/(main)/page.tsx.backup
  ```

- [ ] **4.2** 實作新的 `src/app/(main)/page.tsx` (使用 `getUserSession()`)

**檢查點 4**:
```bash
npm run dev           # 啟動開發伺服器
# 手動測試:
# - middleware 是否正確重定向未登入使用者
# - 已登入狀態: 顯示完整儀表板
```

---

### 階段 5: 功能測試

- [ ] **5.1** 測試個人儀表板數據正確性
  - 已完成排名次數
  - 評鑑單曲總數
  - 本命歌手

- [ ] **5.2** 測試搜尋功能
  - Debounce 是否正常（1 秒）
  - 搜尋結果是否正確
  - Artist 跳轉: `/artist/{id}/my-stats`
  - Album 跳轉: `/artist/{artistId}/album/{albumId}`

- [ ] **5.3** 測試草稿區塊
  - 進度條是否正確（從 `draftState.percent` 讀取）
  - 點擊是否跳轉至正確的 Sorter Page
  - 無效資料是否被過濾（檢查 console.warn）

- [ ] **5.4** 測試最近活動
  - 時間格式是否正確（"2 days ago"）
  - 點擊是否跳轉至正確的 Result Page

- [ ] **5.5** 測試熱門歌手
  - 資料來源是否正確（基於 submissions._count 排序）
  - 點擊是否跳轉至正確的 Artist Page

---

### 階段 6: 品質保證

- [ ] **6.1** 執行完整檢查
  ```bash
  npm run lint
  npx tsc --noEmit
  npm run prettier    # 格式化程式碼
  ```

- [ ] **6.2** 效能檢查
  - 確認 `React.cache()` 正確使用
  - 確認並行查詢（`Promise.all`）正確使用
  - 確認無 N+1 查詢問題

- [ ] **6.3** 響應式測試
  - 測試手機版佈局（特別是橫向捲動）
  - 測試平板版佈局
  - 測試桌面版佈局

---

### 階段 7: Git Commit

- [ ] **7.1** 建立 `docs/COMMIT.md`（按照 CLAUDE.md 規範）
- [ ] **7.2** 通知使用者 commit
- [ ] **7.3** 由使用者手動執行 `git commit`

---

## 7. 測試計劃

### 7.1 單元測試（選用）

如專案有測試需求,可針對以下函式撰寫測試:

```typescript
// src/services/home/__tests__/getUserDashboardStats.test.ts
describe("getUserDashboardStats", () => {
  it("should return correct ranking count", async () => {
    // Mock Prisma client
    // Assert results
  });

  it("should return top artist", async () => {
    // Test logic
  });
});
```

### 7.2 整合測試

**測試情境**:

| 情境 | 條件 | 預期結果 |
|------|------|----------|
| 未登入訪問 | 訪問 `/` | middleware 重定向到 `/auth/signin` ✅ |
| 已登入但無資料 | `userId` 存在但無排名記錄 | 顯示儀表板（數據為 0） + 搜尋 + 熱門歌手 |
| 已登入有草稿 | `userId` 存在且有 DRAFT | 顯示草稿區塊 |
| 已登入有完成記錄 | `userId` 存在且有 COMPLETED | 顯示最近活動區塊 |
| 搜尋 Artist | 輸入 "Taylor" | 下拉顯示匹配的 Artists |
| 搜尋 Album | 輸入 "1989" | 下拉顯示匹配的 Albums |
| 點擊 Artist 搜尋結果 | 點擊搜尋下拉 | 跳轉至 `/artist/{id}/my-stats` |
| 點擊 Album 搜尋結果 | 點擊搜尋下拉 | 跳轉至 `/artist/{artistId}/album/{albumId}` |
| 點擊草稿 | 點擊草稿卡片 | 跳轉至 `/sorter/artist/{id}` 或 `/sorter/album/{id}` |
| 點擊歷史 | 點擊歷史卡片 | 跳轉至 `/artist/{id}/my-stats?submissionId={id}` |
| 無效草稿資料 | `type=ALBUM` 但 `albumId=null` | 不顯示該卡片 + console.warn |

### 7.3 效能測試

**關鍵指標**:

- **首頁載入時間**: < 2 秒（含資料庫查詢）
- **搜尋回應時間**: < 1.5 秒（含 1 秒 debounce）
- **資料庫查詢次數**: 最多 5 次（Dashboard 3+1 次 + Drafts 1 次 + History 1 次 + Trending 2 次,透過 `Promise.all` 並行）

**最佳化策略**:

1. ✅ 使用 `React.cache()` 快取查詢結果
2. ✅ 使用 `Promise.all()` 並行查詢
3. ✅ Select 只取需要的欄位
4. ✅ 限制查詢結果數量（Drafts 全部、History 5 筆、Trending 10 筆、Search 5 筆）
5. ✅ 加入資料庫索引 (`@@index([name])`)

---

## 8. 風險與注意事項

### 8.1 ✅ 資料一致性 (v2.0 已處理,v2.1 優化)

**原風險**: `draftState` 可能為 `null` 或格式不符

**✅ v2.0 解決方案**: 在 `getUserDrafts` 加入防禦性過濾
**🟢 v2.1 優化**: 信任過濾邏輯,簡化 UI 元件的型別守衛

```typescript
// 驗證 1: ALBUM 類型必須有 albumId
if (draft.type === "ALBUM" && !draft.albumId) {
  console.warn("...");
  return false;
}

// 驗證 2: draftState 必須是有效物件
if (!draft.draftState || typeof draft.draftState !== 'object' || !('percent' in draft.draftState)) {
  console.warn("...");
  return false;
}
```

### 8.2 ✅ 路徑跳轉 (已處理)

**原風險**: Album 的跳轉路徑尚未確認

**✅ 解決方案**: 統一跳轉至 `/artist/${artistId}/album/${albumId}`

需要在 `searchArtistsAndAlbums` 回傳 `artistId`:

```typescript
albums: albums.map((album) => ({
  id: album.id,
  artistId: album.artistId,  // ✅ 新增
  // ...
}))
```

### 8.3 ✅ 圖片 Placeholder (已處理)

**原風險**: 專案中的 placeholder 圖片路徑未確認

**✅ 解決方案**: 統一使用專案慣例

```typescript
import { PLACEHOLDER_PIC } from "@/constants";
// 實際路徑: /pic/placeholder.jpg
```

### 8.4 時間格式化

**當前方案**: 使用英文（"2 days ago"）

**未來優化**: 加入國際化

```typescript
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale"; // 繁體中文

formatDistanceToNow(date, {
  addSuffix: true,
  locale: zhTW  // "2 天前"
});
```

### 8.5 ✅ 搜尋效能 (已處理)

**原風險**: 模糊搜尋可能在大資料量時變慢

**✅ 解決方案**:
1. 限制結果數量（`take: 5`）
2. 加入資料庫索引 (`@@index([name])`)
3. 未來可改用 PostgreSQL Full-Text Search

### 8.6 使用者體驗

**潛在風險**: 橫向捲動在手機上可能不直觀

**當前方案**: 先實作橫向捲動,UI 調整留待後續優化

**未來優化方向**:
1. 加入視覺提示（漸層遮罩）
2. 考慮加入左右箭頭按鈕
3. 或使用響應式設計（手機版改為垂直堆疊）

### 8.7 ✅ Race Condition (v2.1 已修正)

**原風險**: 搜尋快速輸入時,舊請求可能覆蓋新請求結果

**🟢 v2.1 解決方案**: 加入 `AbortController` 立即處理

```typescript
useEffect(() => {
  if (!inputValue.trim()) {
    setResults(null);
    setIsOpen(false);
    return;
  }

  setIsSearching(true);
  const abortController = new AbortController();  // 🟢 新增

  const timer = setTimeout(async () => {
    try {
      const data = await searchArtistsAndAlbums({ query: inputValue });

      // 🟢 只在請求未被取消時更新狀態
      if (!abortController.signal.aborted) {
        setResults(data);
        setIsOpen(true);
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        console.error("Search error:", error);
        setResults(null);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsSearching(false);
      }
    }
  }, 1000);

  return () => {
    clearTimeout(timer);
    abortController.abort();  // 🟢 清理時取消
  };
}, [inputValue]);
```

### 8.8 ✅ Middleware 依賴 (Phase 1 設計)

**說明**: Phase 1 的 `page.tsx` 使用 `getUserSession()`,依賴 middleware 保證使用者已登入。

**驗證**: 確保 `src/config/route.ts` 的 `publicRoutes` **不包含** `"/"`。

**Phase 2 遷移**: 當要開放訪客模式時:
1. 把 `"/"` 加入 `publicRoutes`
2. 改用 `auth()` 而非 `getUserSession()`
3. 加入條件渲染 (已登入 vs 訪客)

---

## 9. 未來優化方向

### 9.1 動態熱門演算法

目前 `getTrendingArtists` 使用「被排名次數」排序,未來可改為:

```typescript
// 熱度分數 = 最近 7 天排名次數 * 2 + 總排名次數
const trendingScore = recentCount * 2 + totalCount;
```

### 9.2 個性化推薦

基於使用者已排名的 Artists,推薦相似藝人:

```typescript
// 使用 Spotify API 的 "Related Artists" 功能
const relatedArtists = await getRelatedArtists(userTopArtists);
```

### 9.3 搜尋結果頁面

當搜尋結果過多時,提供「查看全部結果」連結:

```
/search?q=taylor&type=artist
/search?q=1989&type=album
```

### 9.4 成就系統整合

在儀表板加入成就徽章:

```tsx
<Badge variant="secondary">
  🏆 排名大師 (完成 10 次排名)
</Badge>
```

### 9.5 Loading 和 Skeleton

加入 Loading 狀態提升體驗:

```tsx
// src/app/(main)/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto space-y-12 py-8">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-12 w-full" />
      {/* ... */}
    </div>
  );
}
```

---

## 10. 檢查清單總覽

### 開發前

- [ ] 確認 `date-fns` 已安裝
- [ ] 建立目錄結構
- [ ] 執行資料庫 migration (加入索引)
- [ ] 修改 `createSubmission` (加入驗證)
- [ ] 閱讀完整計劃

### 開發中

- [ ] 實作所有資料層函式（6 個檔案）
- [ ] 實作所有 UI 元件（5 個檔案）
- [ ] 整合頁面（1 個檔案）
- [ ] 每階段執行 `npx tsc --noEmit` 和 `npm run lint`

### 開發後

- [ ] 手動測試所有功能
- [ ] 測試響應式佈局
- [ ] 執行 `npm run prettier`
- [ ] 建立 `docs/COMMIT.md`
- [ ] 通知使用者 commit

---

## 附錄 A: 檔案清單

### 新增檔案（共 13 個）

#### 資料層（7 個）
1. `src/types/home.ts`
2. `src/services/home/getUserDashboardStats.ts`
3. `src/services/home/getUserDrafts.ts`
4. `src/services/home/getUserHistory.ts`
5. `src/services/home/getTrendingArtists.ts`
6. `src/features/home/actions/searchArtistsAndAlbums.ts`
7. `src/constants/featured.ts` 🟢 **v2.1 新增**

#### UI 元件（5 個）
8. `src/features/home/components/DashboardSection.tsx`
9. `src/features/home/components/GlobalSearch.tsx`
10. `src/features/home/components/DraftsSection.tsx`
11. `src/features/home/components/HistorySection.tsx`
12. `src/features/home/components/TrendingSection.tsx`

#### 頁面（1 個）
13. `src/app/(main)/page.tsx` (覆蓋)

### 修改檔案（3 個）

1. `prisma/schema.prisma` - 加入索引
2. `src/features/sorter/actions/createSubmission.ts` - 加入驗證
3. `src/app/(main)/page.tsx` - 完全替換

### 備份檔案（建議）

- `src/app/(main)/page.tsx.backup`

---

## 附錄 B: 依賴關係圖

```
src/app/(main)/page.tsx
├── getUserSession() ← auth.ts (✅ Phase 1)
├── getUserDashboardStats() ← src/services/home/
├── getUserDrafts() ← src/services/home/ (🔧 含防禦性過濾)
├── getUserHistory() ← src/services/home/
├── getTrendingArtists() ← src/services/home/ (🔧 修正查詢語法)
├── DashboardSection ← src/features/home/components/
├── GlobalSearch ← src/features/home/components/
│   └── searchArtistsAndAlbums() ← src/features/home/actions/ (✅ 含 artistId)
├── DraftsSection ← src/features/home/components/ (🔧 含型別守衛)
├── HistorySection ← src/features/home/components/
│   └── formatDistanceToNow() ← date-fns
└── TrendingSection ← src/features/home/components/
    ├── GalleryWrapper ← src/components/presentation/
    └── GalleryItem ← src/components/presentation/
```

---

## 附錄 C: 資料庫查詢效能分析

| 函式 | 查詢次數 | 複雜度 | 快取策略 |
|------|----------|--------|----------|
| `getUserDashboardStats` | 3 次 (並行) | O(n log n) | React.cache() |
| `getUserDrafts` | 1 次 | O(n) | React.cache() |
| `getUserHistory` | 1 次 | O(n) | React.cache() |
| `getTrendingArtists` | 1 次 | O(1) | React.cache() |
| `searchArtistsAndAlbums` | 2 次 (並行) | O(n) | 無（即時查詢） |

**總計（首頁載入）**: 6 次查詢（並行執行,實際 **1 個 round-trip**）

**🟢 v2.1 優化說明**:
- `getUserDashboardStats`: 用 `.then()` 整合 topArtist 查詢,從 2 round-trips 降為 1
- `getTrendingArtists`: 改用寫死 ID 方案,從 2 次查詢降為 1 次
- **總 round-trips**: 從 4 降為 **1** (所有查詢完全並行)

**索引效能提升**:
- 無索引: O(n) 全表掃描
- 有索引: O(log n) B-Tree 搜尋
- 10,000 筆資料: 從 10,000 次比對 → ~13 次比對

---

## 附錄 D: UI 元件對應表

| PRD 區塊 | 實作元件 | 使用的 UI 元件 | Phase 2 可復用 |
|----------|----------|----------------|----------------|
| 個人儀表板 | `DashboardSection` | Card, CardHeader, CardTitle, CardContent | ❌ |
| 全域搜尋列 | `GlobalSearch` | Input, Popover, PopoverContent, Separator | ✅ |
| 待辦事項 | `DraftsSection` | Card, CardContent, Progress, Badge | ❌ |
| 最近活動 | `HistorySection` | GalleryItem (專案現有) | ❌ |
| 熱門歌手 | `TrendingSection` | GalleryWrapper, GalleryItem (專案現有) | ✅ |

---

## 附錄 E: Phase 2 遷移檢查清單

當要開放訪客模式時,需要進行以下調整:

### 1. 路由配置

```typescript
// src/config/route.ts
export const publicRoutes = [
  "/",  // ✅ 加入首頁
];
```

### 2. 頁面邏輯

```tsx
// src/app/(main)/page.tsx
import { auth } from "@/../auth";  // ✅ 改用 auth()

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    // 已登入視圖
  } else {
    // 訪客視圖 (Landing Page)
  }
}
```

### 3. 元件復用

- ✅ `GlobalSearch`: 直接復用
- ✅ `TrendingSection`: 直接復用
- ❌ `DashboardSection`, `DraftsSection`, `HistorySection`: 僅限已登入

### 4. API 權限

- ✅ `searchArtistsAndAlbums`: 已設計為 Public
- ✅ `getTrendingArtists`: 已設計為 Public
- ❌ 其他查詢: 需要 userId

---

## 結語

本計劃遵循 **Linus Torvalds 的「好品味」原則**:

✅ **簡潔的資料結構** - 所有查詢函式職責單一
✅ **消除特殊情況** - 使用條件渲染取代複雜邏輯
✅ **實用主義** - 優先解決 PRD 的核心需求（3 秒找到目標）
✅ **零破壞性** - 新功能不影響現有頁面（備份舊首頁）
🔧 **防禦性設計** - 加入驗證和過濾邏輯,防止無效資料
✅ **效能優化** - 使用索引、並行查詢和快取策略

**核心理念**: 用最少的程式碼,解決真實的問題。

---

### v2.1 變更摘要 (Code Review 優化)

**效能優化** (P0):
- ✅ 消除 `getUserDashboardStats` 的 N+1 查詢 (用 `.then()` 整合)
- ✅ 首頁載入從 4 round-trips 降為 **1 round-trip**

**正確性修正** (P0/P1):
- ✅ 修復 `GlobalSearch` Race Condition (加入 `AbortController`)
- ✅ 加入 `getUserHistory` 的 `completedAt` 防禦
- ✅ 修正 Loading 狀態避免閃爍

**程式碼品質** (P1):
- ✅ 簡化 `DraftsSection` 型別守衛 (信任過濾邏輯)
- ✅ 移除不必要的 fallback 邏輯

**功能調整**:
- ✅ `getTrendingArtists` 改用寫死 ID 方案 (MVP 需求)
- ✅ 新增 `src/constants/featured.ts`

**文件更新**:
- ✅ 修正查詢次數計算 (附錄 C)
- ✅ 更新檔案清單 (附錄 A)
- ✅ 更新實作階段清單

---

**文件版本**: 2.1 (Code Review 優化版)
**最後更新**: 2025-11-28
**作者**: Claude (Linus Mode)
**基於**: v2.0 + Code Review 討論結果
