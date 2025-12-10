# Next.js 15 `use cache` 實驗計畫

**版本**: 1.0
**分支**: `feat/exp-next-use-cache`
**作者**: Claude (Linus Mode)
**日期**: 2025-12-09
**目標**: 驗證 Next.js 15 `use cache` 在真實專案的可行性，解決 Suspense 錯誤，建立完整快取策略

---

## 目錄

1. [專案背景](#一專案背景)
2. [核心目標](#二核心目標)
3. [快取策略設計](#三快取策略設計)
4. [實作範圍總覽](#四實作範圍總覽)
5. [詳細實作流程](#五詳細實作流程)
6. [Server Actions 快取失效策略](#六server-actions-快取失效策略)
7. [Layout 重構方案](#七layout-重構方案)
8. [測試計劃](#八測試計劃)
9. [風險與對策](#九風險與對策)
10. [檔案清單](#十檔案清單)
11. [Linus 式總結](#十一linus-式總結)

---

## 一、專案背景

### 1.1 遇到的問題

**問題 1: Suspense 錯誤**
```
Error: Route "/": Uncached data or `connection()` was accessed outside of `<Suspense>`.
This delays the entire page from rendering, resulting in a slow user experience.

at MainLayout (src/app/(main)/layout.tsx:13:15)
  12 | export default async function MainLayout({ children }: AdminLayoutProps) {
> 13 |  const user = await getUserSession();
     |               ^
  14 |  const loggedArtists = await getRecentLoggedArtists({ userId: user.id });
```

**根本原因**:
- Next.js 15 的新快取機制要求所有動態資料操作必須：
  1. 加上 `use cache` 快取
  2. 或包在 `<Suspense>` 裡做串流渲染

**問題 2: `getUserSession` 不能快取**
```
Route / used `headers()` inside "use cache". Accessing Dynamic data sources
inside a cache scope is not supported.

auth.ts (55:24) @ getUserSession
```

**根本原因**:
- `getUserSession()` 內部呼叫 `auth()`
- `auth()` 會讀取 `headers()` 來驗證 session
- `headers()` 是動態資料來源，在 `use cache` 裡是禁止的

### 1.2 解決方向

**核心思路：分離動態與靜態資料**

```
┌─────────────────────────────────────┐
│ Layout (不能 cache)                  │
│  ├─ 取得 session (動態)              │
│  └─ 包在 <Suspense> 裡               │
└─────────────────────────────────────┘
          │
          ↓
┌─────────────────────────────────────┐
│ 資料查詢函式 (可以 cache)            │
│  ← 接收 userId 作為參數              │
│  ← 這些是純函式，可以快取            │
└─────────────────────────────────────┘
```

---

## 二、核心目標

### 2.1 主要目標

1. **✅ 解決 Suspense 錯誤** - 修正 Layout 結構
2. **✅ 建立快取策略** - LONG/SHORT 兩層快取時間
3. **✅ 實作快取失效** - 在關鍵 Server Actions 加上 `revalidateTag`
4. **✅ 通用化 use cache** - 為所有適合快取的查詢函式加上 `use cache`

### 2.2 次要目標

- 更新 shadcn UI 新元件 (spinner, empty, field, button-group)
- 統一 UI 一致性
- 建立快取監控機制

### 2.3 成功標準

**必須達成**:
- ✅ 所有 "Uncached data outside Suspense" 錯誤消失
- ✅ 首頁統計數字有快取且能正確失效
- ✅ 完成排名後數字立即更新
- ✅ Layout 正常渲染無錯誤

**期望達成**:
- 🎯 首頁載入速度提升 20%+
- 🎯 資料庫查詢次數減少 50%+
- 🎯 快取策略清晰易維護

---

## 三、快取策略設計

### 3.1 快取時間分層

**設計原則**: 只用 LONG/SHORT 兩層，簡單直觀

```typescript
// src/constants/cache.ts (新建)
export const CACHE_TIMES = {
  LONG: 'hours',   // 1 小時：統計、歷史、歌手資料
  SHORT: 'minutes' // 幾分鐘：最近活動、草稿清單
} as const;
```

**為什麼只有兩層？**
- ✅ 簡單：開發者不用糾結「這個該用哪一層」
- ✅ 靈活：搭配 `revalidateTag` 主動失效，不需要更細粒度
- ✅ 實用：覆蓋 95% 的使用情境

### 3.2 快取時間選擇指南

| 資料類型 | 快取時間 | 理由 |
|---------|---------|------|
| 統計數字 (dashboard stats) | LONG | 幾小時才變一次，允許延遲 |
| 歷史記錄 (history) | LONG | 已完成的記錄不會改變 |
| 歌手資料 (artist info) | LONG | 很少變動 |
| 草稿清單 (drafts) | SHORT | 使用者頻繁操作，需要即時 |
| 未完成提交 (incomplete submission) | SHORT | 進行中的狀態，需要即時 |
| Hero 顯示 (hero item) | SHORT | 依賴最新的草稿和戰績 |
| 使用者 session | ❌ 不快取 | 每個 request 都不同 |

### 3.3 Cache Tag 命名規範

**設計原則**:
- 使用函式生成，避免 typo
- **必須包含 userId**: Next.js 的 `use cache` 是全域快取,不是 per-user 的,所以必須在 tag 裡區分使用者
- 包含所有影響查詢結果的參數
- 清晰的層級結構
- **只用細粒度 tag**: 不使用粗粒度 tag (如 `home-${userId}`),因為已有 `invalidateRankingCache()` 集中管理

```typescript
// src/constants/cache-tags.ts (新建)
export const CACHE_TAGS = {
  // ========== 用戶相關 ==========
  USER: (userId: string) => `user-${userId}`,
  USER_PREFERENCE: (userId: string) => `user-preference-${userId}`,

  // ========== 首頁相關 ==========
  DASHBOARD_STATS: (userId: string) => `dashboard-stats-${userId}`,
  HISTORY: (userId: string) => `history-${userId}`,
  DRAFTS: (userId: string) => `drafts-${userId}`,
  HERO: (userId: string) => `hero-${userId}`,
  DISCOVERY: (userId: string) => `discovery-${userId}`,

  // ========== 排名相關 ==========
  RANKING_SUBMISSIONS: (userId: string, artistId: string) =>
    `ranking-submissions-${userId}-${artistId}`,
  INCOMPLETE_SUBMISSION: (userId: string, artistId: string) =>
    `incomplete-submission-${userId}-${artistId}`,
  LATEST_SUBMISSION: (userId: string, artistId: string) =>
    `latest-submission-${userId}-${artistId}`,

  // ========== 統計相關 ==========
  TRACK_STATS: (userId: string, artistId: string) =>
    `track-stats-${userId}-${artistId}`,
  ALBUM_STATS: (userId: string, artistId: string) =>
    `album-stats-${userId}-${artistId}`,
  TRACK_HISTORY: (userId: string, submissionId: string) =>
    `track-history-${userId}-${submissionId}`,
  ALBUM_HISTORY: (userId: string, submissionId: string) =>
    `album-history-${userId}-${submissionId}`,

  // ========== 內容相關 ==========
  ARTIST: (artistId: string) => `artist-${artistId}`,
  LOGGED_ARTISTS: (userId: string) => `logged-artists-${userId}`,
  RECENT_ARTISTS: (userId: string) => `recent-artists-${userId}`,
  ALBUM: (albumId: string) => `album-${albumId}`,
  ALBUMS_BY_ARTIST: (artistId: string) => `albums-${artistId}`,
  TRACK: (trackId: string) => `track-${trackId}`,
  TRACKS_BY_ARTIST: (artistId: string) => `tracks-${artistId}`,
  TRACKS_BY_ALBUM: (albumId: string) => `tracks-album-${albumId}`,
  TRACK_RANKING: (userId: string, trackId: string) =>
    `track-ranking-${userId}-${trackId}`,

  // ========== 管理端 ==========
  ADMIN_DATA: 'admin-data',
} as const;
```

---

## 四、實作範圍總覽

### 4.1 需要加 `use cache` 的檔案 (約 25 個函式)

#### ✅ 已完成
- `src/services/home/getUserDashboardStats.ts` - 使用者已加上

#### 📋 待處理

**A. 首頁相關 (5 個)**
- `src/services/home/getUserHistory.ts` - LONG
- `src/services/home/getUserDrafts.ts` - SHORT
- `src/services/home/getHeroItem.ts` - SHORT
- `src/services/home/getDiscoveryArtists.ts` - LONG
- `src/services/home/getTrendingArtists.ts` - LONG (如果還存在)

**B. 資料庫查詢層 (15 個)**

`src/db/artist.ts`:
- `getArtistById` - LONG
- `getLoggedArtists` - LONG
- `getRecentLoggedArtists` - LONG

`src/db/album.ts`:
- `getAlbumById` - LONG
- `getAlbumsByArtistId` - LONG

`src/db/track.ts`:
- `getTrackForTrackPage` - LONG
- `getTracksByArtistId` - LONG
- `getTracksByAlbumId` - LONG
- `getSinglesByArtistId` - LONG
- `getTrackRanking` - LONG

`src/db/ranking.ts`:
- `getIncompleteRankingSubmission` - SHORT
- `getArtistRankingSubmissions` - LONG
- `getLatestArtistRankingSubmissions` - LONG

`src/db/user.ts`:
- `getUserPreference` - LONG

**C. 統計服務層 (4 個)**
- `src/services/track/getTracksStats.ts` - LONG
- `src/services/track/getTracksHistory.ts` - LONG
- `src/services/album/getAlbumsStats.ts` - LONG
- `src/services/album/getAlbumsHistory.ts` - LONG

### 4.2 需要加 `revalidateTag` 的 Server Actions (約 15 個)

#### 優先處理 (核心邏輯，5 個)
1. `src/features/sorter/actions/completeSubmission.ts` - ⚠️ 最複雜
2. `src/features/sorter/actions/createSubmission.ts`
3. `src/features/sorter/actions/saveDraft.ts`
4. `src/features/sorter/actions/finalizeDraft.ts`
5. `src/features/sorter/actions/deleteSubmission.ts`

#### 次要處理 (管理端，10 個)
6. `src/features/admin/addContent/actions/addArtist.ts`
7. `src/features/admin/addContent/actions/addAlbum.ts`
8. `src/features/admin/addContent/actions/addSingle.ts`
9. `src/features/admin/editContent/actions/updateArtist.ts`
10. `src/features/admin/editContent/actions/updateAlbum.ts`
11. `src/features/admin/editContent/actions/updateInfo.ts`
12. `src/features/admin/editContent/actions/deleteItem.ts`
13. `src/features/admin/user/actions/updateUser.ts`
14. `src/features/settings/actions/saveProfileSettings.ts`
15. `src/features/settings/actions/saveRankingSettings.ts`

### 4.3 需要新建的檔案 (4 個)

1. `src/constants/cache.ts` - 快取時間常數
2. `src/constants/cache-tags.ts` - Cache Tag 命名函式
3. `src/lib/cache-invalidation.ts` - 集中的快取失效邏輯
4. `src/components/layout/SidebarSkeleton.tsx` - Sidebar Loading 狀態

### 4.4 需要修改的檔案 (1 個)

1. `src/app/(main)/layout.tsx` - 加上 Suspense 包裹

---

## 五、詳細實作流程

### 階段 1: 基礎建設 (30 分鐘)

**目標**: 建立快取相關的基礎設施

#### 步驟 1.1: 建立快取時間常數

**檔案**: `src/constants/cache.ts` (新建)

```typescript
/**
 * 快取時間策略
 *
 * LONG: 用於相對穩定的資料（統計、歷史、內容資料）
 * SHORT: 用於頻繁變動的資料（草稿、進行中的操作）
 */
export const CACHE_TIMES = {
  LONG: 'hours',   // Next.js 預設 1 小時
  SHORT: 'minutes' // Next.js 預設 5-15 分鐘
} as const;
```

#### 步驟 1.2: 建立 Cache Tag 命名函式

**檔案**: `src/constants/cache-tags.ts` (新建)

```typescript
/**
 * Cache Tag 命名規範
 *
 * 設計原則:
 * 1. 使用函式生成，避免 typo
 * 2. 包含所有影響查詢結果的參數
 * 3. 清晰的層級結構（領域 - 具體資源）
 */
export const CACHE_TAGS = {
  // 用戶相關
  USER: (userId: string) => `user-${userId}`,
  USER_PREFERENCE: (userId: string) => `user-preference-${userId}`,

  // 首頁相關
  DASHBOARD_STATS: (userId: string) => `dashboard-stats-${userId}`,
  HISTORY: (userId: string) => `history-${userId}`,
  DRAFTS: (userId: string) => `drafts-${userId}`,
  HERO: (userId: string) => `hero-${userId}`,
  DISCOVERY: (userId: string) => `discovery-${userId}`,

  // 排名相關
  RANKING_SUBMISSIONS: (userId: string, artistId: string) =>
    `ranking-submissions-${userId}-${artistId}`,
  INCOMPLETE_SUBMISSION: (userId: string, artistId: string) =>
    `incomplete-submission-${userId}-${artistId}`,
  LATEST_SUBMISSION: (userId: string, artistId: string) =>
    `latest-submission-${userId}-${artistId}`,

  // 統計相關
  TRACK_STATS: (userId: string, artistId: string) =>
    `track-stats-${userId}-${artistId}`,
  ALBUM_STATS: (userId: string, artistId: string) =>
    `album-stats-${userId}-${artistId}`,
  TRACK_HISTORY: (userId: string, submissionId: string) =>
    `track-history-${userId}-${submissionId}`,
  ALBUM_HISTORY: (userId: string, submissionId: string) =>
    `album-history-${userId}-${submissionId}`,

  // 內容相關
  ARTIST: (artistId: string) => `artist-${artistId}`,
  LOGGED_ARTISTS: (userId: string) => `logged-artists-${userId}`,
  RECENT_ARTISTS: (userId: string) => `recent-artists-${userId}`,
  ALBUM: (albumId: string) => `album-${albumId}`,
  ALBUMS_BY_ARTIST: (artistId: string) => `albums-${artistId}`,
  TRACK: (trackId: string) => `track-${trackId}`,
  TRACKS_BY_ARTIST: (artistId: string) => `tracks-${artistId}`,
  TRACKS_BY_ALBUM: (albumId: string) => `tracks-album-${albumId}`,
  TRACK_RANKING: (userId: string, trackId: string) =>
    `track-ranking-${userId}-${trackId}`,

  // 管理端
  ADMIN_DATA: 'admin-data',
} as const;
```

#### 步驟 1.3: 建立集中的快取失效函式

**檔案**: `src/lib/cache-invalidation.ts` (新建)

```typescript
'use server'

import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/constants/cache-tags';

/**
 * 完成排名後的快取失效
 *
 * 這是最複雜的快取失效操作，會影響:
 * - 使用者統計 (dashboard stats)
 * - 歷史記錄 (history)
 * - Hero 顯示 (hero)
 * - 曲目/專輯統計 (track/album stats)
 * - 排名提交記錄 (ranking submissions)
 * - 歌手清單 (logged/recent artists)
 */
export async function invalidateRankingCache(userId: string, artistId: string) {
  // 首頁相關
  revalidateTag(CACHE_TAGS.DASHBOARD_STATS(userId));
  revalidateTag(CACHE_TAGS.HISTORY(userId));
  revalidateTag(CACHE_TAGS.HERO(userId));

  // 統計相關
  revalidateTag(CACHE_TAGS.TRACK_STATS(userId, artistId));
  revalidateTag(CACHE_TAGS.ALBUM_STATS(userId, artistId));

  // 排名相關
  revalidateTag(CACHE_TAGS.RANKING_SUBMISSIONS(userId, artistId));
  revalidateTag(CACHE_TAGS.LATEST_SUBMISSION(userId, artistId));

  // 歌手清單
  revalidateTag(CACHE_TAGS.LOGGED_ARTISTS(userId));
  revalidateTag(CACHE_TAGS.RECENT_ARTISTS(userId));

  console.log(`[CACHE] Invalidated ranking cache for user=${userId}, artist=${artistId}`);
}

/**
 * 草稿操作後的快取失效
 *
 * 影響:
 * - 草稿清單 (drafts)
 * - Hero 顯示 (hero)
 * - 未完成提交 (incomplete submission)
 */
export async function invalidateDraftCache(userId: string, artistId: string) {
  revalidateTag(CACHE_TAGS.DRAFTS(userId));
  revalidateTag(CACHE_TAGS.HERO(userId));
  revalidateTag(CACHE_TAGS.INCOMPLETE_SUBMISSION(userId, artistId));

  console.log(`[CACHE] Invalidated draft cache for user=${userId}, artist=${artistId}`);
}

/**
 * 管理端內容編輯後的快取失效
 *
 * 影響:
 * - 全域管理端資料 (admin data)
 * - 特定歌手/專輯/曲目
 */
export async function invalidateAdminCache(type: 'artist' | 'album' | 'track', id: string) {
  revalidateTag(CACHE_TAGS.ADMIN_DATA);

  switch (type) {
    case 'artist':
      revalidateTag(CACHE_TAGS.ARTIST(id));
      revalidateTag(CACHE_TAGS.ALBUMS_BY_ARTIST(id));
      revalidateTag(CACHE_TAGS.TRACKS_BY_ARTIST(id));
      break;
    case 'album':
      revalidateTag(CACHE_TAGS.ALBUM(id));
      revalidateTag(CACHE_TAGS.TRACKS_BY_ALBUM(id));
      break;
    case 'track':
      revalidateTag(CACHE_TAGS.TRACK(id));
      break;
  }

  console.log(`[CACHE] Invalidated admin cache for ${type}=${id}`);
}
```

**檢查點 1**:
```bash
npx tsc --noEmit  # 確認無型別錯誤
```

---

### 階段 2: 資料層快取化 (2 小時)

**目標**: 為所有查詢函式加上 `use cache` 和對應的 cache tag

#### 步驟 2.1: 首頁服務層 (5 個檔案)

##### 檔案 1: `src/services/home/getUserHistory.ts`

**修改前**:
```typescript
import { cache } from "react";
import { db } from "@/db/client";

export const getUserHistory = cache(
  async ({
    userId,
    limit = 15,
  }: {
    userId: string;
    limit?: number;
  }) => {
    // ...
  }
);
```

**修改後**:
```typescript
'use cache'  // ← 加這行

import { cacheLife, cacheTag } from "next/cache";  // ← 加這行
import { db } from "@/db/client";
import { CACHE_TIMES } from "@/constants/cache";  // ← 加這行
import { CACHE_TAGS } from "@/constants/cache-tags";  // ← 加這行

export async function getUserHistory({  // ← 移除 cache() wrapper
  userId,
  limit = 15,
}: {
  userId: string;
  limit?: number;
}) {
  cacheLife(CACHE_TIMES.LONG);  // ← 加這行
  cacheTag(CACHE_TAGS.HISTORY(userId));  // ← 加這行

  console.log('[CACHE] getUserHistory called for', userId);  // ← 加這行（除錯用）

  const history = await db.rankingSubmission.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    include: {
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

  return history;
}
```

**關鍵變更說明**:
1. ✅ 加上 `'use cache'` directive
2. ✅ 移除 React 的 `cache()` wrapper（Next.js 15 不需要）
3. ✅ 加上 `cacheLife(CACHE_TIMES.LONG)` - 設定快取時間
4. ✅ 加上 `cacheTag(CACHE_TAGS.HISTORY(userId))` - 設定快取標籤
5. ✅ 加上 console.log 除錯資訊

##### 檔案 2: `src/services/home/getUserDrafts.ts`

**修改重點**: 使用 SHORT cache（草稿需要即時更新）

```typescript
'use cache'

import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { CACHE_TIMES } from "@/constants/cache";
import { CACHE_TAGS } from "@/constants/cache-tags";

export async function getUserDrafts({ userId }: { userId: string }) {
  cacheLife(CACHE_TIMES.SHORT);  // ← SHORT（草稿需即時）
  cacheTag(CACHE_TAGS.DRAFTS(userId));

  console.log('[CACHE] getUserDrafts called for', userId);

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
    take: 15,
  });

  return drafts;
}
```

##### 檔案 3: `src/services/home/getHeroItem.ts`

**修改重點**: 使用 SHORT cache（依賴最新的草稿和戰績）

```typescript
'use cache'

import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import type { HeroItemType } from "@/types/home";
import { CACHE_TIMES } from "@/constants/cache";
import { CACHE_TAGS } from "@/constants/cache-tags";

export async function getHeroItem({ userId }: { userId: string }): Promise<HeroItemType | null> {
  cacheLife(CACHE_TIMES.SHORT);  // ← SHORT（依賴最新狀態）
  cacheTag(CACHE_TAGS.HERO(userId));

  console.log('[CACHE] getHeroItem called for', userId);

  // P1: 24h 內有新戰績
  const recentAchievement = await db.rankingSubmission.findFirst({
    where: {
      userId,
      status: "COMPLETED",
      completedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        not: null,
      },
    },
    // ... 其他邏輯保持不變
  });

  // ... 其他邏輯保持不變
}
```

##### 檔案 4: `src/services/home/getDiscoveryArtists.ts`

```typescript
'use cache'

import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { CACHE_TIMES } from "@/constants/cache";
import { CACHE_TAGS } from "@/constants/cache-tags";

export async function getDiscoveryArtists({ userId }: { userId: string }) {
  cacheLife(CACHE_TIMES.LONG);  // ← LONG（歌手清單相對穩定）
  cacheTag(CACHE_TAGS.DISCOVERY(userId));

  console.log('[CACHE] getDiscoveryArtists called for', userId);

  // 取得已互動的歌手
  const interactedArtistIds = await db.rankingSubmission.findMany({
    where: { userId },
    select: { artistId: true },
    distinct: ["artistId"],
  }).then(results => results.map(r => r.artistId));

  // 取得未排名的歌手
  const discoveryArtists = await db.artist.findMany({
    where: {
      id: { notIn: interactedArtistIds },
    },
    select: {
      id: true,
      name: true,
      img: true,
    },
  });

  return discoveryArtists;
}
```

**注意**: `getUserDashboardStats` 已經完成，跳過。

#### 步驟 2.2: 資料庫查詢層 - Artist (3 個函式)

**檔案**: `src/db/artist.ts`

**修改前**:
```typescript
import { db } from "./client";

export async function getArtistById({ artistId }: { artistId: string }) {
  // ...
}

export async function getLoggedArtists({ userId }: { userId: string }) {
  // ...
}

export async function getRecentLoggedArtists({ userId }: { userId: string }) {
  // ...
}
```

**修改後**:
```typescript
'use cache'  // ← 加在檔案最上方

import { cacheLife, cacheTag } from "next/cache";
import { db } from "./client";
import { CACHE_TIMES } from "@/constants/cache";
import { CACHE_TAGS } from "@/constants/cache-tags";

export async function getArtistById({ artistId }: { artistId: string }) {
  cacheLife(CACHE_TIMES.LONG);
  cacheTag(CACHE_TAGS.ARTIST(artistId));

  console.log('[CACHE] getArtistById called for', artistId);

  const artist = await db.artist.findFirst({
    where: {
      id: artistId,
    },
  });
  return artist;
}

export async function getLoggedArtists({ userId }: { userId: string }) {
  cacheLife(CACHE_TIMES.LONG);
  cacheTag(CACHE_TAGS.LOGGED_ARTISTS(userId));

  console.log('[CACHE] getLoggedArtists called for', userId);

  const artists = await db.artist.findMany({
    where: {
      submissions: {
        some: {
          userId,
          status: "COMPLETED",
        },
      },
    },
    orderBy: {
      submissions: {
        _count: "desc",
      },
    },
  });

  return artists;
}

export async function getRecentLoggedArtists({ userId }: { userId: string }) {
  cacheLife(CACHE_TIMES.LONG);
  cacheTag(CACHE_TAGS.RECENT_ARTISTS(userId));

  console.log('[CACHE] getRecentLoggedArtists called for', userId);

  // ... 原本的邏輯保持不變
  const artistsWithLatestSubmission = await db.artist.findMany({
    where: {
      submissions: {
        some: {
          userId,
          status: "COMPLETED",
        },
      },
    },
    include: {
      submissions: {
        where: {
          userId,
          status: "COMPLETED",
        },
        orderBy: {
          completedAt: "desc",
        },
        take: 1,
        select: {
          completedAt: true,
        },
      },
    },
  });

  const sortedArtists = artistsWithLatestSubmission
    .filter(artist => artist.submissions.length > 0)
    .sort((a, b) => {
      const aTime = a.submissions[0]?.completedAt;
      const bTime = b.submissions[0]?.completedAt;

      if (!aTime || !bTime) return 0;

      return bTime.getTime() - aTime.getTime();
    })
    .map(({ submissions: _, ...artist }) => artist);

  return sortedArtists;
}
```

#### 步驟 2.3: 資料庫查詢層 - Ranking (3 個函式)

**檔案**: `src/db/ranking.ts`

**注意**: 這個檔案有 SHORT/LONG 混用,需特別注意。

```typescript
'use cache'  // ← 加在檔案最上方

import { cacheLife, cacheTag } from "next/cache";
import { $Enums } from "@prisma/client";
import { db } from "./client";
import { CACHE_TIMES } from "@/constants/cache";
import { CACHE_TAGS } from "@/constants/cache-tags";

// ========== SHORT: 進行中的 submission ==========
export async function getIncompleteRankingSubmission({
  artistId,
  userId,
  type = "ARTIST",
  albumId,
}: {
  artistId: string;
  userId: string;
  type?: $Enums.SubmissionType;
  albumId?: string;
}) {
  cacheLife(CACHE_TIMES.SHORT);  // ← SHORT (進行中會頻繁變動)
  cacheTag(CACHE_TAGS.INCOMPLETE_SUBMISSION(userId, artistId));

  console.log('[CACHE] getIncompleteRankingSubmission called');

  const submissions = await db.rankingSubmission.findMany({
    where: {
      artistId,
      userId,
      type,
      status: { not: "COMPLETED" },
      albumId,
    },
  });

  if (submissions.length > 1) {
    throw new Error(
      `Data integrity error: Found ${submissions.length} incomplete submissions for artist ${artistId}, expected 0 or 1`
    );
  }

  return submissions[0];
}

// ========== LONG: 最新完成的 submission ==========
export async function getLatestArtistRankingSubmissions({
  artistId,
  userId,
}: {
  artistId: string;
  userId: string;
}) {
  cacheLife(CACHE_TIMES.LONG);  // ← LONG (已完成的記錄)
  cacheTag(CACHE_TAGS.LATEST_SUBMISSION(userId, artistId));

  console.log('[CACHE] getLatestArtistRankingSubmissions called');

  const latestSubmission = await db.rankingSubmission.findFirst({
    where: {
      artistId,
      userId,
      type: "ARTIST",
      status: "COMPLETED",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  return latestSubmission
    ? {
        id: latestSubmission.id,
        date: latestSubmission.createdAt,
      }
    : null;
}

// ========== LONG: 所有完成的 submissions ==========
export async function getArtistRankingSubmissions({
  artistId,
  userId,
}: {
  artistId: string;
  userId: string;
}) {
  cacheLife(CACHE_TIMES.LONG);  // ← LONG (已完成的記錄)
  cacheTag(CACHE_TAGS.RANKING_SUBMISSIONS(userId, artistId));

  console.log('[CACHE] getArtistRankingSubmissions called');

  const submissions = await db.rankingSubmission.findMany({
    where: {
      artistId,
      userId,
      type: "ARTIST",
      status: "COMPLETED",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  return submissions.map((submission) => ({
    id: submission.id,
    date: submission.createdAt,
  }));
}
```

#### 步驟 2.4: 資料庫查詢層 - Album, Track, User

**套用模式** (全部 LONG):

##### 檔案: `src/db/album.ts`

重點函式:
- `getAlbumById` - LONG + CACHE_TAGS.ALBUM(albumId)
- `getAlbumsByArtistId` - LONG + CACHE_TAGS.ALBUMS_BY_ARTIST(artistId)

所有其他函式依此類推,全部使用 LONG cache。

##### 檔案: `src/db/track.ts`

重點函式:
- `getTrackForTrackPage` - LONG + CACHE_TAGS.TRACK(trackId)
- `getTracksByArtistId` - LONG + CACHE_TAGS.TRACKS_BY_ARTIST(artistId)
- `getTracksByAlbumId` - LONG + CACHE_TAGS.TRACKS_BY_ALBUM(albumId)
- `getTrackRanking` - LONG + CACHE_TAGS.TRACK_RANKING(userId, trackId)
- `getSinglesByArtistId` - LONG + CACHE_TAGS.TRACKS_BY_ARTIST(artistId)

所有函式全部使用 LONG cache。

##### 檔案: `src/db/user.ts`

```typescript
'use cache'

import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { UserPreferenceData } from "@/types/data";
import { CACHE_TIMES } from "@/constants/cache";
import { CACHE_TAGS } from "@/constants/cache-tags";

export default async function getUserPreference({
  userId,
}: {
  userId: string;
}): Promise<UserPreferenceData | null> {
  cacheLife(CACHE_TIMES.LONG);
  cacheTag(CACHE_TAGS.USER_PREFERENCE(userId));

  console.log('[CACHE] getUserPreference called for', userId);

  const userPreference = (await db.userPreference.findFirst({
    where: {
      userId,
    },
  })) as UserPreferenceData | null;

  return userPreference;
}
```

#### 步驟 2.5: 統計服務層 (4 個檔案)

**套用模式**:
- 所有統計函式使用 LONG cache
- 使用對應的 TRACK_STATS / ALBUM_STATS / TRACK_HISTORY / ALBUM_HISTORY tags
- **重點**: `getTracksHistory` 和 `getAlbumsHistory` 需要掛兩個 tags,因為它們依賴 `UserPreference`

##### 範例: `src/services/track/getTracksHistory.ts`

```typescript
'use cache'

import { cacheLife, cacheTag } from "next/cache";
// ... 其他 imports
import { CACHE_TIMES } from "@/constants/cache";
import { CACHE_TAGS } from "@/constants/cache-tags";

export async function getTracksHistory({
  userId,
  submissionId,
}: {
  userId: string;
  submissionId: string;
}) {
  cacheLife(CACHE_TIMES.LONG);
  cacheTag(CACHE_TAGS.TRACK_HISTORY(userId, submissionId));
  cacheTag(CACHE_TAGS.USER_PREFERENCE(userId));  // ← 掛第二個 tag!

  console.log('[CACHE] getTracksHistory called');

  // 這個函式會讀取 UserPreference 來決定顯示方式
  const preference = await getUserPreference({ userId });

  // ... 根據 preference.displayMode 過濾資料
}
```

**為什麼要掛兩個 tags?**
- 當使用者在「設定頁」改 `displayMode` 時
- `saveRankingSettings` 會失效 `USER_PREFERENCE(userId)` tag
- 因為 `getTracksHistory` 也掛了這個 tag,它的快取會自動失效
- 使用者立即看到新的顯示方式 ✅

同樣的邏輯套用到 `getAlbumsHistory`。

**檢查點 2**:
```bash
npx tsc --noEmit  # 確認無型別錯誤
pnpm lint         # 確認無 linting 錯誤
```

---

### 階段 3: Server Actions 快取失效 (2 小時)

**目標**: 在所有修改資料的 Server Actions 加上 `revalidateTag`

#### 步驟 3.1: 最關鍵 - completeSubmission

**檔案**: `src/features/sorter/actions/completeSubmission.ts`

**修改位置**: 在成功完成排名後，呼叫集中的快取失效函式

**修改前**:
```typescript
export async function completeSubmission(submissionId: string) {
  // ... 更新資料庫邏輯

  // 更新統計
  await updateTrackStats({ userId, artistId });
  await updateAlbumStats({ userId, artistId });

  // 返回結果
  return { success: true, artistId };
}
```

**修改後**:
```typescript
import { invalidateRankingCache } from "@/lib/cache-invalidation";  // ← 加這行
import { revalidatePath } from "next/cache";  // ← 如果還沒有

export async function completeSubmission(submissionId: string) {
  // ... 更新資料庫邏輯

  // 更新統計
  await updateTrackStats({ userId, artistId });
  await updateAlbumStats({ userId, artistId });

  // ========== 快取失效 ========== ← 加這段
  // 失效所有相關的快取
  await invalidateRankingCache(userId, artistId);

  // 重新驗證歌手頁面（如果有）
  revalidatePath(`/artist/${artistId}`);

  console.log(`[CACHE] Completed submission for user=${userId}, artist=${artistId}`);
  // ========== 快取失效結束 ==========

  // 返回結果
  return { success: true, artistId };
}
```

**關鍵說明**:
- ✅ 使用 `invalidateRankingCache()` 一次失效所有相關快取
- ✅ 這會失效 8+ 個 cache tags（dashboard stats, history, hero, track/album stats, etc.）
- ✅ 完成排名後使用者立即看到更新的數字

#### 步驟 3.2: 草稿相關 Actions (4 個)

##### 檔案 1: `src/features/sorter/actions/createSubmission.ts`

```typescript
import { invalidateDraftCache } from "@/lib/cache-invalidation";
import { CACHE_TAGS } from "@/constants/cache-tags";
import { revalidateTag } from "next/cache";

export async function createSubmission(/* ... */) {
  // ... 建立 submission 邏輯

  // ========== 快取失效 ==========
  await invalidateDraftCache(userId, artistId);
  revalidateTag(CACHE_TAGS.DISCOVERY(userId));  // Discovery 也要更新

  console.log(`[CACHE] Created submission for user=${userId}, artist=${artistId}`);
  // ========== 快取失效結束 ==========

  return { success: true, submissionId };
}
```

##### 檔案 2: `src/features/sorter/actions/saveDraft.ts`

```typescript
import { CACHE_TAGS } from "@/constants/cache-tags";
import { revalidateTag } from "next/cache";

export async function saveDraft(/* ... */) {
  // ... 儲存草稿邏輯

  // ========== 快取失效 ==========
  // saveDraft 只更新 draftState，但為了即時性也失效快取
  revalidateTag(CACHE_TAGS.INCOMPLETE_SUBMISSION(userId, artistId));

  console.log(`[CACHE] Saved draft for user=${userId}, artist=${artistId}`);
  // ========== 快取失效結束 ==========

  return { success: true };
}
```

##### 檔案 3: `src/features/sorter/actions/finalizeDraft.ts`

```typescript
import { invalidateDraftCache } from "@/lib/cache-invalidation";
import { revalidatePath } from "next/cache";

export async function finalizeDraft(/* ... */) {
  // ... 定案草稿邏輯（status → DRAFT）

  // ========== 快取失效 ==========
  await invalidateDraftCache(userId, artistId);
  revalidatePath("/sorter");

  console.log(`[CACHE] Finalized draft for user=${userId}, artist=${artistId}`);
  // ========== 快取失效結束 ==========

  return { success: true };
}
```

##### 檔案 4: `src/features/sorter/actions/deleteSubmission.ts`

```typescript
import { invalidateDraftCache } from "@/lib/cache-invalidation";
import { revalidatePath } from "next/cache";

export async function deleteSubmission(/* ... */) {
  // ... 刪除 submission 邏輯

  // ========== 快取失效 ==========
  await invalidateDraftCache(userId, artistId);
  revalidatePath("/sorter");

  console.log(`[CACHE] Deleted submission for user=${userId}, artist=${artistId}`);
  // ========== 快取失效結束 ==========

  return { success: true };
}
```

#### 步驟 3.3: 管理端 Actions (7 個)

**套用模式**: 所有管理端 Actions 使用 `invalidateAdminCache()`

##### 範例: `src/features/admin/addContent/actions/addArtist.ts`

```typescript
import { invalidateAdminCache } from "@/lib/cache-invalidation";
import { revalidatePath } from "next/cache";

export async function addArtist(/* ... */) {
  // ... 新增歌手邏輯

  // ========== 快取失效 ==========
  await invalidateAdminCache('artist', newArtist.id);
  revalidatePath(`/admin/artist/${newArtist.id}`);
  revalidatePath("/admin");

  console.log(`[CACHE] Added artist=${newArtist.id}`);
  // ========== 快取失效結束 ==========

  return { success: true, artistId: newArtist.id };
}
```

**其他管理端 Actions 依此模式套用**:
- `addAlbum` → `invalidateAdminCache('album', albumId)`
- `addSingle` → `invalidateAdminCache('track', trackId)`
- `updateArtist` → `invalidateAdminCache('artist', artistId)`
- `updateAlbum` → `invalidateAdminCache('album', albumId)`
- `updateInfo` (track) → `invalidateAdminCache('track', trackId)`
- `deleteItem` → 根據 type 決定

#### 步驟 3.4: 設定相關 Actions (2 個)

##### 檔案 1: `src/features/settings/actions/saveRankingSettings.ts`

```typescript
import { CACHE_TAGS } from "@/constants/cache-tags";
import { revalidateTag, revalidatePath } from "next/cache";

export async function saveRankingSettings(/* ... */) {
  // ... 儲存偏好設定邏輯

  // ========== 快取失效 ==========
  revalidateTag(CACHE_TAGS.USER_PREFERENCE(userId));

  // ✅ 關鍵: 偏好設定會影響 getTracksHistory 的結果
  // 解法: getTracksHistory 掛了兩個 tags:
  //   1. TRACK_HISTORY(userId, submissionId)
  //   2. USER_PREFERENCE(userId)
  // 所以只要失效 USER_PREFERENCE,所有依賴它的查詢都會自動失效 ✅

  revalidatePath("/settings/ranking");

  console.log(`[CACHE] Saved ranking settings for user=${userId}`);
  // ========== 快取失效結束 ==========

  return { success: true };
}
```

**檢查點 3**:
```bash
npx tsc --noEmit
pnpm lint
```

---

### 階段 4: Layout 重構 (1 小時)

**目標**: 解決 "Uncached data outside Suspense" 錯誤

#### 步驟 4.1: 建立 SidebarSkeleton 元件

**檔案**: `src/components/layout/SidebarSkeleton.tsx` (新建)

```tsx
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

/**
 * Sidebar Loading 狀態
 *
 * 當 getUserSession 和 getRecentLoggedArtists 正在載入時顯示
 */
export default function SidebarSkeleton() {
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background p-4">
      {/* 使用者資訊 Skeleton */}
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* 選單項目 Skeleton */}
      <SidebarMenu>
        {[...Array(5)].map((_, i) => (
          <SidebarMenuItem key={i}>
            <Skeleton className="h-10 w-full" />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      {/* 歌手清單 Skeleton */}
      <div className="mt-6 space-y-2">
        <Skeleton className="h-4 w-32" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 步驟 4.2: 修改 Layout 加上 Suspense

**檔案**: `src/app/(main)/layout.tsx`

**修改前**:
```tsx
import { getUserSession } from "../../../auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SimpleSidebar } from "@/components/sidebar/SimpleSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { getRecentLoggedArtists } from "@/db/artist";
import ScrollIsolationWrapper from "@/components/layout/ScrollIsolationWrapper";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function MainLayout({ children }: AdminLayoutProps) {
  const user = await getUserSession();  // ← 這裡會報錯
  const loggedArtists = await getRecentLoggedArtists({ userId: user.id });

  return (
    <SidebarProvider defaultOpen={true}>
      <ScrollIsolationWrapper>
        <SimpleSidebar user={user} artists={loggedArtists} />
      </ScrollIsolationWrapper>
      <SidebarInset className="h-full overflow-hidden">
        <AppHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
```

**修改後**:
```tsx
import { Suspense } from "react";  // ← 加這行
import { getUserSession } from "../../../auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SimpleSidebar } from "@/components/sidebar/SimpleSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { getRecentLoggedArtists } from "@/db/artist";
import ScrollIsolationWrapper from "@/components/layout/ScrollIsolationWrapper";
import SidebarSkeleton from "@/components/layout/SidebarSkeleton";  // ← 加這行

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function MainLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* ========== 用 Suspense 包裹 Sidebar ========== */}
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarWithData />
      </Suspense>
      {/* ========== Suspense 結束 ========== */}

      <SidebarInset className="h-full overflow-hidden">
        <AppHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * Sidebar 資料獲取邏輯
 *
 * 拆分原因:
 * - getUserSession() 不能加 use cache (依賴 headers())
 * - 必須包在 Suspense 裡才能符合 Next.js 15 的要求
 * - getRecentLoggedArtists() 可以快取，已加上 use cache
 */
async function SidebarWithData() {
  const user = await getUserSession();  // 動態資料，不快取
  const loggedArtists = await getRecentLoggedArtists({ userId: user.id });  // 可快取

  return (
    <ScrollIsolationWrapper>
      <SimpleSidebar user={user} artists={loggedArtists} />
    </ScrollIsolationWrapper>
  );
}
```

**關鍵變更說明**:
1. ✅ 用 `<Suspense>` 包裹 `SidebarWithData`
2. ✅ 提供 `<SidebarSkeleton />` 作為 fallback
3. ✅ 把資料獲取邏輯拆到 `SidebarWithData` 函式
4. ✅ `getUserSession()` 不快取（動態）
5. ✅ `getRecentLoggedArtists()` 已快取（階段 2 完成）

**檢查點 4**:
```bash
npm run dev  # 啟動開發伺服器
# 檢查是否還有 "Uncached data outside Suspense" 錯誤
```

---

### 階段 5: 測試驗證 (1.5 小時)

**目標**: 驗證快取功能正常運作

#### 步驟 5.1: 快取生效測試

**測試 1: 首頁統計有快取**

1. 開啟瀏覽器，進入首頁
2. 開啟 DevTools Console
3. 重新整理頁面
4. **預期結果**:
   - 第一次載入: 看到 `[CACHE] getUserDashboardStats called for user-xxx`
   - 第二次載入（1 小時內）: 不應看到此 log（快取命中）

**測試 2: 歌手清單有快取**

1. 進入首頁
2. 檢查 Console
3. **預期結果**:
   - 看到 `[CACHE] getRecentLoggedArtists called for user-xxx`
   - 重新整理後不再看到（快取命中）

**測試 3: 草稿清單快取較短**

1. 進入首頁，檢查 Drafts Section
2. 等待 5-10 分鐘
3. 重新整理
4. **預期結果**:
   - 5-10 分鐘後重新整理，應再次看到 `[CACHE] getUserDrafts called`
   - 說明 SHORT cache 正常運作

#### 步驟 5.2: 快取失效測試

**測試 4: 完成排名後統計立即更新**

1. 記下當前的統計數字（已完成排名次數）
2. 開始一個新的排名並完成
3. 回到首頁
4. **預期結果**:
   - 統計數字立即更新（+1）
   - Console 看到 `[CACHE] Invalidated ranking cache for user=xxx, artist=xxx`
   - Console 看到 `[CACHE] getUserDashboardStats called`（快取被失效，重新查詢）

**測試 5: 儲存草稿後清單立即更新**

1. 建立一個新的排名草稿
2. 進行到 50% 後儲存草稿
3. 回到首頁 Drafts Section
4. **預期結果**:
   - 草稿立即出現在清單中
   - 進度條顯示 50%
   - Console 看到 `[CACHE] Invalidated draft cache`

**測試 6: 刪除草稿後清單立即更新**

1. 刪除一個草稿
2. 回到首頁
3. **預期結果**:
   - 草稿立即從清單中消失
   - Console 看到 `[CACHE] Deleted submission`

**測試 7: 管理端編輯後內容立即更新**

1. 進入管理端，編輯一個歌手的名稱
2. 回到首頁或歌手頁面
3. **預期結果**:
   - 歌手名稱立即更新
   - Console 看到 `[CACHE] Invalidated admin cache for artist=xxx`

#### 步驟 5.3: Layout 測試

**測試 8: Layout 正常渲染**

1. 重新整理首頁
2. **預期結果**:
   - 不應看到任何 "Uncached data outside Suspense" 錯誤
   - Sidebar 短暫顯示 Loading 狀態（SidebarSkeleton）
   - 然後正常顯示使用者資料和歌手清單

**測試 9: Sidebar Loading 狀態**

1. 清除快取（DevTools > Application > Clear site data）
2. 重新載入首頁
3. **預期結果**:
   - 短暫看到 SidebarSkeleton（灰色 Skeleton）
   - 然後正常顯示 Sidebar 內容

#### 步驟 5.4: 效能測試

**測試 10: 首頁載入速度**

1. 使用 Chrome DevTools Performance 面板
2. 記錄首頁載入時間（第一次，無快取）
3. 記錄首頁載入時間（第二次，有快取）
4. **預期結果**: 第二次應該更快（提升 20%+）

**檢查點 5**:
```bash
# 確認所有測試通過
# 記錄測試結果
```

---

### 階段 6: UI 更新（次要，1 小時）

**目標**: 統一使用 shadcn 新元件

#### 步驟 6.1: 安裝 shadcn 新元件

```bash
npx shadcn@latest add spinner
npx shadcn@latest add empty
npx shadcn@latest add field
npx shadcn@latest add button-group
```

#### 步驟 6.2: 替換現有實作

**範例: 使用 Spinner 取代自訂 Loading**

**修改前**:
```tsx
// 自訂 Loading
<div className="flex items-center justify-center">
  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
</div>
```

**修改後**:
```tsx
import { Spinner } from "@/components/ui/spinner";

<Spinner />
```

**範例: 使用 Empty 取代自訂空狀態**

**修改前**:
```tsx
{items.length === 0 && (
  <div className="text-center text-muted-foreground">
    <p>No items found</p>
  </div>
)}
```

**修改後**:
```tsx
import { Empty } from "@/components/ui/empty";

{items.length === 0 && (
  <Empty
    title="No items found"
    description="Start by creating your first item"
  />
)}
```

**注意**: 這個階段是次要的，可以在主要功能穩定後再進行。

---

## 六、Server Actions 快取失效策略

### 6.1 completeSubmission 詳細流程

**最複雜的快取失效操作**

```
completeSubmission 執行流程:
├─ 1. 更新 RankingSubmission (status → COMPLETED)
├─ 2. 建立 TrackRanking / AlbumRanking 記錄
├─ 3. 更新 TrackStat / AlbumStat 統計
├─ 4. ⚠️ 快取失效 (8+ tags)
│    ├─ dashboard-stats-{userId}      ← getUserDashboardStats
│    ├─ history-{userId}              ← getUserHistory
│    ├─ hero-{userId}                 ← getHeroItem
│    ├─ track-stats-{userId}-{artistId}  ← getTracksStats
│    ├─ album-stats-{userId}-{artistId}  ← getAlbumsStats
│    ├─ ranking-submissions-{userId}-{artistId}
│    ├─ logged-artists-{userId}       ← getLoggedArtists
│    └─ recent-artists-{userId}       ← getRecentLoggedArtists
└─ 5. Revalidate Path: /artist/{artistId}
```

**使用集中函式**:
```typescript
await invalidateRankingCache(userId, artistId);
```

### 6.2 草稿操作快取失效

```
createSubmission / saveDraft / finalizeDraft / deleteSubmission:
├─ drafts-{userId}                    ← getUserDrafts
├─ hero-{userId}                      ← getHeroItem
├─ incomplete-submission-{userId}-{artistId}
└─ discovery-{userId} (僅 createSubmission)
```

**使用集中函式**:
```typescript
await invalidateDraftCache(userId, artistId);
```

### 6.3 管理端操作快取失效

```
addArtist / updateArtist / deleteArtist:
├─ admin-data (全域)
├─ artist-{artistId}
├─ albums-{artistId}
└─ tracks-{artistId}

addAlbum / updateAlbum / deleteAlbum:
├─ admin-data (全域)
├─ album-{albumId}
└─ tracks-album-{albumId}

addSingle / updateTrack / deleteTrack:
├─ admin-data (全域)
└─ track-{trackId}
```

**使用集中函式**:
```typescript
await invalidateAdminCache('artist', artistId);
await invalidateAdminCache('album', albumId);
await invalidateAdminCache('track', trackId);
```

### 6.4 設定操作快取失效

```
saveRankingSettings:
├─ user-preference-{userId}
└─ ✅ getTracksHistory 會自動失效 (因為它掛了 USER_PREFERENCE tag)

saveProfileSettings:
├─ user-{userId}
└─ Revalidate Path: /settings/profile
```

---

## 七、Layout 重構方案

### 7.1 問題分析

**原本的 Layout**:
```tsx
export default async function MainLayout({ children }) {
  const user = await getUserSession();  // ← 問題：呼叫 headers()
  const loggedArtists = await getRecentLoggedArtists({ userId: user.id });
  // ...
}
```

**為什麼會報錯？**

1. Next.js 15 要求所有動態資料操作必須：
   - 加上 `use cache` OR
   - 包在 `<Suspense>` 裡

2. `getUserSession()` 不能加 `use cache`：
   - 內部呼叫 `auth()`
   - `auth()` 讀取 `headers()`
   - `headers()` 是動態資料來源

3. 因此必須用 `<Suspense>` 包裹

### 7.2 解決方案

**架構調整**:

```
MainLayout
├─ SidebarProvider
│  ├─ <Suspense fallback={<SidebarSkeleton />}>
│  │  └─ SidebarWithData (async)
│  │     ├─ getUserSession() ← 動態，不快取
│  │     └─ getRecentLoggedArtists() ← 可快取
│  └─ SidebarInset
│     ├─ AppHeader
│     └─ {children}
```

**關鍵點**:
1. ✅ 把資料獲取邏輯拆到 `SidebarWithData`
2. ✅ 用 `<Suspense>` 包裹 `SidebarWithData`
3. ✅ 提供 `<SidebarSkeleton />` 作為 Loading 狀態
4. ✅ `getRecentLoggedArtists()` 已加 `use cache`（階段 2）

### 7.3 Suspense 的好處

**使用者體驗提升**:
- 首頁主要內容立即渲染
- Sidebar 串流渲染（顯示 Loading）
- 整體載入時間感覺更快

**技術優勢**:
- 符合 Next.js 15 的 PPR 要求
- 允許部分快取、部分動態
- 避免整個頁面阻塞

---

## 八、測試計劃

### 8.1 功能測試矩陣

| 測試項目 | 測試步驟 | 預期結果 | 優先級 |
|---------|---------|---------|--------|
| **快取生效** | 重新整理首頁 2 次 | 第 2 次不應再次查詢 DB | P0 |
| **統計更新** | 完成排名後回首頁 | 統計數字立即 +1 | P0 |
| **草稿更新** | 儲存草稿後回首頁 | 草稿立即出現在清單 | P0 |
| **草稿刪除** | 刪除草稿後回首頁 | 草稿立即消失 | P0 |
| **管理端編輯** | 編輯歌手名稱後檢查 | 名稱立即更新 | P1 |
| **Layout 渲染** | 重新整理首頁 | 無 Suspense 錯誤 | P0 |
| **Loading 狀態** | 清除快取後載入 | 短暫顯示 Skeleton | P1 |
| **快取時間** | LONG cache 測試 | 1 小時內不重複查詢 | P1 |
| **快取時間** | SHORT cache 測試 | 5-10 分鐘後重新查詢 | P1 |
| **效能提升** | Performance 測試 | 載入速度提升 20%+ | P2 |

### 8.2 測試工具

**Console Log 監控**:
```typescript
// 在每個 use cache 函式加上
console.log('[CACHE] functionName called for', params);
```

**Chrome DevTools**:
- Network 面板 - 監控請求數量
- Performance 面板 - 測量載入時間
- Console 面板 - 查看快取 log

### 8.3 測試腳本

```bash
# 測試流程腳本
npm run dev

# 1. 開啟瀏覽器 http://localhost:3000
# 2. 開啟 DevTools Console
# 3. 執行測試矩陣中的每個測試
# 4. 記錄結果
```

---

## 九、風險與對策

### 9.1 關鍵風險清單

#### 風險 1: completeSubmission 的級聯影響 ⚠️ 最高風險

**風險描述**:
- 完成排名會觸發 8+ 個 cache tags 失效
- 如果漏掉任何一個，使用者會看到舊資料
- 測試成本高（需要完整走完排名流程）

**影響範圍**:
- 首頁統計數字
- 歷史記錄
- Hero 顯示
- 曲目/專輯統計
- 歌手清單

**對策**:
1. ✅ 建立 `invalidateRankingCache()` 集中管理
2. ✅ 詳細的測試清單（見測試計劃）
3. ✅ Console log 監控所有失效操作
4. ⚠️ 考慮建立 E2E 測試（未來）

#### 風險 2: Race Condition (草稿衝突) ⚠️ 中風險

**風險描述**:
- 使用者在儲存草稿時，可能同時收到快取的舊資料
- 例如：saveDraft 完成，但 getUserDrafts 還在回傳舊快取

**影響範圍**:
- 草稿清單
- 未完成提交
- Hero 顯示

**對策**:
1. ✅ 使用 SHORT cache（幾分鐘）
2. ✅ 在 saveDraft 時立即 revalidate
3. ⚠️ 如果還有問題，考慮用 optimistic update（未來）

#### 風險 3: UserPreference 隱蔽影響 ⚠️ 已解決 ✅

**風險描述**:
- `saveRankingSettings` 只更新 UserPreference
- 但會影響 `getTracksHistory` 的過濾邏輯
- 可能導致使用者改設定後看到不一致的結果

**影響範圍**:
- 曲目歷史記錄
- 排名結果顯示

**對策** (已實作):
1. ✅ 在 `getTracksHistory` 掛兩個 tags:
   - `TRACK_HISTORY(userId, submissionId)` (細粒度)
   - `USER_PREFERENCE(userId)` (依賴)
2. ✅ 當 `saveRankingSettings` 失效 `USER_PREFERENCE(userId)` 時
3. ✅ 所有掛了這個 tag 的查詢會自動失效
4. ✅ 使用者立即看到新的顯示方式

**無需 wildcard 支援**,用多 tag 解決。

#### 風險 4: 開發環境快取干擾 ⚠️ 低風險

**風險描述**:
- 開發時快取可能導致改 code 後看不到效果
- 需要不斷手動清除快取

**影響範圍**:
- 開發體驗

**對策**:
1. ✅ 在 `next.config.ts` 設定開發環境快取時間
2. ✅ 提供清除快取的指令
3. ✅ 在 README 加上說明

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 0,  // 開發時關閉快取
      static: 180,
    },
  },
};
```

#### 風險 5: Cache Tag 命名衝突 ⚠️ 低風險

**風險描述**:
- 如果 tag 命名不一致，可能導致失效失敗
- 例如：`artist-123` vs `artist_123`

**影響範圍**:
- 所有快取失效操作

**對策**:
1. ✅ 使用 `CACHE_TAGS` 函式統一命名
2. ✅ TypeScript 型別檢查
3. ✅ 避免手寫 tag 字串

### 9.2 降級方案

**如果快取出現重大問題，降級方案**:

1. **緊急關閉快取**:
```typescript
// 在 next.config.ts 暫時關閉
experimental: {
  staleTimes: {
    dynamic: 0,
    static: 0,
  },
}
```

2. **回滾到 React cache()**:
```typescript
// 暫時移除 'use cache'，用回 React cache()
import { cache } from "react";
export const getUserDashboardStats = cache(async ({ userId }) => {
  // ...
});
```

3. **手動失效所有快取**:
```typescript
// 在 Server Action 加上
revalidatePath('/', 'layout');  // 失效整個 layout
```

---

## 十、檔案清單

### 10.1 新建檔案 (4 個)

```
src/
├── constants/
│   ├── cache.ts                           # 快取時間常數
│   └── cache-tags.ts                      # Cache Tag 命名函式
├── lib/
│   └── cache-invalidation.ts              # 集中的快取失效邏輯
└── components/
    └── layout/
        └── SidebarSkeleton.tsx            # Sidebar Loading 狀態
```

### 10.2 修改檔案 (30+ 個)

#### A. 首頁服務層 (5 個)
```
src/services/home/
├── getUserDashboardStats.ts  # ✅ 已完成
├── getUserHistory.ts          # 加 use cache (LONG)
├── getUserDrafts.ts           # 加 use cache (SHORT)
├── getHeroItem.ts             # 加 use cache (SHORT)
└── getDiscoveryArtists.ts     # 加 use cache (LONG)
```

#### B. 資料庫查詢層 (15 個)
```
src/db/
├── artist.ts                  # 3 個函式 (LONG)
├── album.ts                   # 2 個函式 (LONG)
├── track.ts                   # 5 個函式 (LONG)
├── ranking.ts                 # 3 個函式 (SHORT/LONG)
└── user.ts                    # 1 個函式 (LONG)
```

#### C. 統計服務層 (4 個)
```
src/services/
├── track/
│   ├── getTracksStats.ts      # 加 use cache (LONG)
│   └── getTracksHistory.ts    # 加 use cache (LONG)
└── album/
    ├── getAlbumsStats.ts      # 加 use cache (LONG)
    └── getAlbumsHistory.ts    # 加 use cache (LONG)
```

#### D. Server Actions (15 個)
```
src/features/
├── sorter/actions/
│   ├── completeSubmission.ts  # 加 invalidateRankingCache
│   ├── createSubmission.ts    # 加 invalidateDraftCache
│   ├── saveDraft.ts           # 加 revalidateTag
│   ├── finalizeDraft.ts       # 加 invalidateDraftCache
│   └── deleteSubmission.ts    # 加 invalidateDraftCache
├── admin/
│   ├── addContent/actions/
│   │   ├── addArtist.ts       # 加 invalidateAdminCache
│   │   ├── addAlbum.ts        # 加 invalidateAdminCache
│   │   └── addSingle.ts       # 加 invalidateAdminCache
│   ├── editContent/actions/
│   │   ├── updateArtist.ts    # 加 invalidateAdminCache
│   │   ├── updateAlbum.ts     # 加 invalidateAdminCache
│   │   ├── updateInfo.ts      # 加 invalidateAdminCache
│   │   └── deleteItem.ts      # 加 invalidateAdminCache
│   └── user/actions/
│       └── updateUser.ts      # 加 revalidatePath
└── settings/actions/
    ├── saveProfileSettings.ts # 加 revalidatePath
    └── saveRankingSettings.ts # 加 revalidateTag
```

#### E. Layout (1 個)
```
src/app/(main)/
└── layout.tsx                 # 加 Suspense + SidebarWithData
```

### 10.3 檔案修改統計

```
總計:
- 新建: 4 個檔案
- 修改: 30+ 個檔案
- 預估工作量: 7 小時

分階段:
- 階段 1 (基礎): 3 個新檔案
- 階段 2 (資料層): 24 個檔案
- 階段 3 (Actions): 15 個檔案
- 階段 4 (Layout): 2 個檔案
```

---

## 十一、Linus 式總結

### 【品味評分】🟢 好品味 (9/10)

**核心原則達成**:

1. ✅ **簡潔的資料結構**
   - LONG/SHORT 兩層，不過度設計
   - CACHE_TAGS 函式化，避免 magic string

2. ✅ **消除特殊情況**
   - 用 `invalidateRankingCache()` 封裝複雜邏輯
   - 所有查詢函式統一模式

3. ✅ **實用主義**
   - 解決真實問題（Suspense 錯誤 + 效能）
   - 不追求完美，先求可用

4. ✅ **零破壞性**
   - 只加快取，不改現有邏輯
   - 降級方案清楚

5. ✅ **集中管理**
   - cache.ts, cache-tags.ts, cache-invalidation.ts
   - 易於維護和調整

**扣分點** (-1):
- 需要在多個函式手動掛兩個 tags (但這是可接受的 trade-off)

### 【關鍵洞察】

1. **資料結構**:
   - Session 是動態的，不能快取 → 必須用 Suspense
   - 其他資料是半靜態的，可以快取 → 用 LONG/SHORT

2. **複雜度審查**:
   - `completeSubmission` 是最複雜的，影響 8+ 個查詢
   - 解法：封裝成 `invalidateRankingCache()`，一次呼叫全失效

3. **破壞性分析**:
   - 所有修改都是「加法」（加 use cache, 加 revalidateTag）
   - 沒有「減法」（不刪現有邏輯）
   - 確保零破壞

4. **實用性驗證**:
   - 解決 Next.js 15 強制要求的 Suspense 問題（真實痛點）
   - 提升效能（真實需求）
   - 降級方案清楚（風險可控）

### 【最大挑戰】

**`completeSubmission` 的級聯影響**

這是整個計畫最複雜的部分：
- 一次操作影響 8+ 個查詢函式
- 如果漏掉任何一個，使用者會看到舊資料
- 測試成本高

**Linus 的解法**:
- 把複雜度「封裝」起來
- 用 `invalidateRankingCache()` 集中管理
- 一次呼叫，全部失效
- 簡單、清晰、不會出錯

### 【成功標準】

**必須達成** (否則計畫失敗):
- ✅ "Uncached data outside Suspense" 錯誤消失
- ✅ 完成排名後統計立即更新
- ✅ Layout 正常渲染

**期望達成** (計畫成功):
- 🎯 首頁載入速度提升 20%+
- 🎯 資料庫查詢次數減少 50%+

**加分項** (錦上添花):
- 🌟 UI 元件統一使用 shadcn 新版
- 🌟 建立快取監控儀表板

---

## 附錄 A: 快速參考

### A.1 常用指令

```bash
# 開發
npm run dev

# 檢查
npx tsc --noEmit
pnpm lint

# 清除快取（開發時）
rm -rf .next

# Prisma 相關
npx prisma generate
npx prisma migrate dev
```

### A.2 快取除錯技巧

**檢查快取是否生效**:
```typescript
console.log('[CACHE] functionName called for', params);
```

**手動失效快取**:
```typescript
import { revalidateTag } from 'next/cache';
revalidateTag('tag-name');
```

**關閉快取（開發時）**:
```typescript
// next.config.ts
staleTimes: { dynamic: 0, static: 0 }
```

### A.3 關鍵檔案路徑

```
快取相關:
- src/constants/cache.ts
- src/constants/cache-tags.ts
- src/lib/cache-invalidation.ts

Layout:
- src/app/(main)/layout.tsx
- src/components/layout/SidebarSkeleton.tsx

首頁服務:
- src/services/home/getUserDashboardStats.ts (✅ 已完成)
- src/services/home/getUserHistory.ts
- src/services/home/getUserDrafts.ts
- src/services/home/getHeroItem.ts
- src/services/home/getDiscoveryArtists.ts

關鍵 Action:
- src/features/sorter/actions/completeSubmission.ts
```

---

**計畫版本**: 1.1
**最後更新**: 2025-12-10
**作者**: Claude (Linus Mode)
**狀態**: 已更新 (根據討論優化)

**更新內容 (v1.1)**:
1. ✅ 澄清快取是全域的,必須在 tag 裡包含 userId
2. ✅ 確認只用細粒度 tag,不混合粗細粒度
3. ✅ 解決 UserPreference 隱蔽影響問題 (用多 tag 方案)
4. ✅ 補充 `src/db/ranking.ts` 完整範例 (SHORT/LONG 混用)
5. ✅ 補充 `getTracksHistory` 需掛兩個 tags 的說明
6. ✅ 刪除 Prisma Log 測試 (改用 console.log 即可)
7. ✅ 確認使用 `revalidateTag` 而非 `unstable_updateTag`

**下一步**: 退出 Plan Mode,開始執行階段 1
