# Artist Page Restructuring Plan

## 執行日期
2025-10-03

## 任務進度

### ✅ Phase 0.5: 型別定義與基礎元件（已完成）
- ✅ 0.5.1 建立型別定義檔案 (`src/types/artist.ts`, `track.ts`, `album.ts`)
- ✅ 0.5.2 建立 `HybridDataSourceControl.tsx`
- ✅ 0.5.3 建立視圖元件 (`OverviewView.tsx`, `AllRankingsView.tsx`)
- ❌ 0.5.4 建立 `ViewLayoutControl.tsx`（已刪除 - 過度抽象）

### ✅ Phase 1: 資料層優化（已完成）
- ✅ 1.1 為所有資料獲取函數加上 React Cache
- ✅ 1.2 型別整合與集中化

### ✅ Phase 2: 路由結構準備（已完成）
- ✅ 2.1 創建新目錄結構 (`my-stats/`, `my-stats/[sessionId]/`)
- ✅ 2.2 創建 `my-stats/page.tsx` (Average 模式)
- ✅ 2.3 創建 `my-stats/[sessionId]/page.tsx` (Snapshot 模式)

### 🔄 Phase 3: 配置更新（待執行）
- ⏳ 3.1 更新 `artistTabs.ts`
- ⏳ 3.2 更新根 `page.tsx` 重定向

### 🔄 Phase 4: 測試新結構（待執行）
- ⏳ 4.1 手動測試 URL
- ⏳ 4.2 驗證功能

### 🔄 Phase 5: 切換與清理（待執行）
- ⏳ 5.1 刪除舊路由
- ⏳ 5.2 最終測試

### 🔄 Phase 6: 文件更新（待執行）
- ⏳ 6.1 更新 README
- ⏳ 6.2 記錄技術決策

---

## 任務目標

### 核心目標
將 Artist 詳情頁的路由結構從**三個獨立 Tab**重構為**兩個 Tab + 巢狀控制項**的架構,提升 UI 邏輯清晰度和使用者體驗。

### 具體改進
1. **頂層 Tab 簡化**：從 3 個 Tab（Overview / History / Community）減少為 2 個（My Stats / Community）
2. **資料來源控制**：在 My Stats 下引入 Average/Snapshot 切換,使用**創新的 Hybrid 下拉按鈕**設計
3. **視圖佈局控制**：統一 Overview（總覽儀表板）和 All Rankings（完整列表）兩種呈現方式
4. **消除 UI 依賴**：避免「選了模式才出現控制項」的二階互動,保持佈局穩定

---

## 預期產出

### 1. 新的路由結構
```
/artist/[artistId]/
├── layout.tsx                      # 共用的 CollapsibleArtistHeader（保持不變）
├── page.tsx                        # 重定向到 /my-stats（更新）
├── my-stats/                       # 新建（整合原 overview + history）
│   ├── page.tsx                    # 新建：Average 模式（包含控制項渲染）
│   └── [sessionId]/
│       └── page.tsx                # 新建：Snapshot 模式（包含控制項渲染）
└── community/
    └── page.tsx                    # 保持不變（目前為空）
```

### 2. 新建元件
- `src/types/artist-views.ts` - 型別定義
- `src/components/artist/HybridDataSourceControl.tsx` - Snapshot 下拉按鈕（Client）
- `src/components/artist/ViewLayoutControl.tsx` - 視圖切換器（Client）
- `src/features/ranking/views/OverviewView.tsx` - 總覽視圖（Client）
- `src/features/ranking/views/AllRankingsView.tsx` - 列表視圖（Client）

### 3. 更新配置
- `src/config/artistTabs.ts` - 從 3 個 Tab 改為 2 個
- 所有內部連結的 URL 路徑更新（如有）

### 4. URL 設計
```bash
# My Stats - Average 模式
/artist/taylor-swift/my-stats?view=overview
/artist/taylor-swift/my-stats?view=all-rankings

# My Stats - Snapshot 模式
/artist/taylor-swift/my-stats/abc123?view=overview
/artist/taylor-swift/my-stats/abc123?view=all-rankings

# Community
/artist/taylor-swift/community
```

---

## 原程式碼分析與 Review

### 現有路由結構
```
src/app/(main)/artist/[artistId]/(artist)/
├── layout.tsx                                    # ✅ 保留：CollapsibleArtistHeader
├── overview/
│   └── page.tsx                                  # ❌ 將刪除（開發階段無需重定向）
├── history/
│   ├── page.tsx                                  # ❌ 將刪除
│   └── [dateId]/
│       └── page.tsx                              # ❌ 將刪除
└── community/
    └── page.tsx                                  # ✅ 保留不變
```

### 關鍵資料獲取函數分析

#### 1. `getTracksStats` (Average 模式)
```typescript
// src/services/track/getTracksStats.ts
await getTracksStats({
  artistId,
  userId,
  dateRange,  // ✅ 支援時間範圍過濾（透過 ?range 查詢參數）
});
```
- **用途**：計算所有歷史排名的平均值
- **資料特性**：聚合計算,無具體日期
- **適用視圖**：Overview + All Rankings

#### 2. `getTracksHistory` (Snapshot 模式)
```typescript
// src/services/track/getTracksHistory.ts
await getTracksHistory({
  artistId,
  userId,
  dateId,  // ✅ 必要參數：特定的 RankingSubmission ID
});
```
- **用途**：獲取某次具體排名的快照
- **資料特性**：具體的 RankingSubmission 資源
- **適用視圖**：Overview + All Rankings（兩種都支援）

#### 3. Album 相關資料
```typescript
// overview/page.tsx
const albumRankings = await getAlbumsStats({ artistId, userId, dateRange });
const albums = await getLoggedAlbumNames(artistId, userId);
const albumSessions = await getAlbumRankingSessions(userId, artistId);
```
- **發現**：Album 資料只在 Average 模式的 Overview 視圖使用
- **策略**：條件性獲取,避免不必要的資料庫查詢

### 現有元件分析

#### 1. 可用的 UI 元件（Radix UI + shadcn/ui）
```typescript
// src/components/ui/dropdown-menu.tsx - Radix DropdownMenu primitives
// src/components/ui/button.tsx - CVA button with variants
// src/components/ui/select.tsx - Radix Select (被 SimpleDropdown 使用)
// src/components/ui/tooltip.tsx - Radix Tooltip
```

#### 2. `SimpleSegmentControl`
```typescript
// src/components/navigation/SimpleSegmentControl.tsx
```
- **功能**：支援 `href` 跳轉和 `queryParam` 更新
- **關鍵**：Line 51-54 正確保留其他查詢參數（✅ 已驗證）
- **用途**：視圖切換（Overview / All Rankings）

#### 3. `SimpleDropdown`
```typescript
// src/components/dropdown/SimpleDropdown.tsx
```
- **基於**：Radix Select（非 DropdownMenu）
- **功能**：支援 `href`、`queryParam`、`onClick`
- **限制**：無法顯示 CheckIcon（Select 的限制）
- **用途**：可能不適合 Snapshot 選擇（需要用 DropdownMenu）

#### 4. `CollapsibleArtistHeader`
```typescript
// src/components/layout/CollapsibleArtistHeader.tsx
```
- **狀態管理**：使用 `useStickyState` 追蹤卷軸位置
- **重要性**：保持 Layout 穩定是本次重構的關鍵目標
- **策略**：✅ 完全不動,新架構在其 children 內運作

### 資料流程分析

#### Overview Page (現狀)
```typescript
// overview/page.tsx
searchParams: { range?: string, view?: string }

// 資料獲取
const trackRankings = await getTracksStats({ dateRange });  // 平均數據
const albumRankings = await getAlbumsStats({ dateRange });

// 視圖渲染
if (view === 'list') {
  return <ClientStatsRankingTable />;
} else {
  return <Charts + AlbumBoard />;
}
```

**問題點**：
- ❌ `view` 參數在 Page 層級處理,導致整個頁面重新渲染
- ❌ Album 資料總是獲取,即使在 list 視圖不需要

#### History Page (現狀)
```typescript
// history/[dateId]/page.tsx
searchParams: { view?: string }

// 資料獲取
const trackRankings = await getTracksHistory({ dateId });

// 視圖渲染
if (view === 'list') {
  return <ClientHistoryRankingTable />;
} else {
  return <p>Charts view not available</p>;  // ⚠️ 尚未實作
}
```

**改進空間**：
- ✅ 統一 Average 和 Snapshot 的視圖渲染邏輯
- ✅ 實作 Snapshot 模式的 Overview 視圖

---

## UI/UX 設計決策

### 核心創新：Hybrid Snapshot 按鈕

#### 問題定義
傳統方案會有「選了 Snapshot 模式後,才出現日期選擇器」的二階互動：
```
[Average] [Snapshot] [Overview] [All Rankings]
                     ↓ 選了 Snapshot 後
[Average] [Snapshot] [Overview] [All Rankings]
[Date: 2024-10-02 ▼]  ← 新出現的元素導致佈局跳動
```

#### 解決方案
將 Snapshot 按鈕本身設計為下拉選單：
```
[Average] [Snapshot ▼] [Overview] [All Rankings]
          ↓ 點擊 Snapshot
          ┌─────────────┐
          │ ✓ Oct 2, 2024│
          │ Sep 15, 2024│
          └─────────────┘
```

#### 優勢分析
1. **消除佈局跳動**：兩組 Control 始終在固定位置
2. **減少操作步驟**：從「選模式 → 選日期」變為「選日期」（一步到位）
3. **語義清晰**：Snapshot 不再是抽象的「模式」,而是「選擇一個快照」
4. **空間效率**：Average 模式下不會有空白的日期選擇器位置
5. **上下文可見**：選中後,按鈕顯示當前日期（如 "Oct 2, 2024 ▼"）

### 命名決策

| 概念 | 最終命名 | 備選方案 | 選擇理由 |
|------|---------|---------|---------|
| **頂層 Tab 1** | My Stats | Personal / Stats | 涵蓋個人的所有統計視圖 |
| **頂層 Tab 2** | Community | Global | 與 My Stats 形成清晰對比 |
| **資料來源 1** | Average | Summary / Aggregate | 直觀描述「平均值」 |
| **資料來源 2** | Snapshot | History / Record | 強調「時間點的快照」 |
| **視圖 1** | Overview | Dashboard | 總覽儀表板（圖表、highlights） |
| **視圖 2** | All Rankings | List View | 完整的歌曲排名列表 |

---

## 詳細任務流程

### Phase 0: 準備工作（當前階段）
- [x] 撰寫完整的 `plan.md`
- [x] Review plan.md 並確認所有細節
- [ ] 備份當前程式碼（建議 commit）

### Phase 0.5: 架構驗證與型別定義
**目的**：在開發前確認元件能力和建立型別安全

#### 0.5.1 建立型別定義檔案
**檔案位置**：`src/types/artist.ts`

```typescript
/**
 * Artist 頁面的視圖類型
 * - overview: 總覽儀表板（圖表、highlights）
 * - all-rankings: 完整的排名列表
 */
export type ArtistViewType = 'overview' | 'all-rankings';

/**
 * Artist 頁面的資料來源模式
 * - average: 所有歷史排名的平均值
 * - snapshot: 某次具體的排名快照
 */
export type ArtistDataSourceMode = 'average' | 'snapshot';

/**
 * Artist 排名快照的 Session 資訊
 */
export type ArtistRankingSession = {
  id: string;
  createdAt: Date;
};
```

**命名決策**：
- ✅ 使用 `artist.ts` 而非 `artist-views.ts`（符合專案慣例：`data.ts`, `general.ts`）
- ✅ 型別名稱加 `Artist` 前綴（避免全域衝突，import 時更清楚）
- ✅ 未來可擴充其他 Artist 相關型別（如 `ArtistSortOrder`, `ArtistFilterType`）

#### 0.5.2 驗證現有元件能力
- [ ] 確認 `SimpleSegmentControl` 的 `queryParam` 正確保留其他查詢參數（Line 51-54）
- [ ] 確認 `SimpleDropdown` 基於 Radix Select（無 CheckIcon）
- [ ] 確認需要使用 `src/components/ui/dropdown-menu.tsx` 來實作 Snapshot 下拉選單

#### 0.5.3 確認 Server/Client Component 邊界
**關鍵決策**：
- **不需要** `my-stats/layout.tsx`（避免創建空殼 Layout）
- 控制項必須是 **Client Component**（使用 useRouter）
- **策略**：所有資料獲取和控制項渲染都在 Page 層完成

### Phase 1: 元件開發與資料層優化（獨立開發,不影響現有功能）

#### 1.0 資料層遷移與優化策略

**核心原則**：
- ✅ 優先使用 `src/services/**/*` 和 `src/db/*` 的現有函數
- ✅ 若需使用 `src/lib/database/**/*` 的函數：
  1. **優先**：在 `src/services/**/*` 或 `src/db/*` 創建新的包裝函數
  2. **記錄**：在 plan.md 的「修改檔案」清單中註記
  3. **範圍**：只遷移本次任務需要的函數，不做全面重構
- ❌ 不直接從 Page 或 Component import `lib/database/**/*`

**遷移決策流程**：
```
需要某個資料？
  ├─ src/services/**/* 有？ → 直接用
  ├─ src/db/* 有？ → 直接用
  └─ 只在 lib/database/**/* 有？
      └─ 在 src/services/**/* 或 src/db/* 創建新函數
         └─ 內部可以暫時 import lib/database（標記為 TODO）
```

**範例**（假設需要某個函數）：
```typescript
// ❌ 錯誤做法：直接 import
import { getTracksMetrics } from '@/lib/database/ranking/overview/getTracksMetrics';

// ✅ 正確做法：在 src/services/track/ 創建包裝
// src/services/track/getTracksMetrics.ts
import { getTracksMetrics as _getTracksMetrics } from '@/lib/database/ranking/overview/getTracksMetrics';
import { cache } from 'react';

// 立即加上 cache 包裝
export const getTracksMetrics = cache(_getTracksMetrics);

// 標記 TODO（未來任務處理）
// TODO: 將 lib/database 的實作移進此檔案
```

---

#### 1.1 為資料獲取函數加上 React Cache
**目的**：防止同一個 request 內重複查詢資料庫

**需要修改的檔案**（在各自檔案內包裝）：
1. `src/services/track/getTracksStats.ts`
2. `src/services/track/getTracksHistory.ts`
3. `src/services/album/getAlbumsStats.ts`
4. `src/db/album.ts` - `getLoggedAlbumNames`, `getAlbumRankingSessions`
5. `src/db/ranking.ts` - `getArtistRankingSubmissions`

**實作方式**（以 `getTracksStats` 為例）：
```typescript
// src/services/track/getTracksStats.ts
import { cache } from 'react';

// 將原本的函數改名為內部函數（加底線前綴）
async function _getTracksStats(params: GetTracksStatsParams) {
  // 原本的實作保持不變
}

// Export cache 包裝版本
export const getTracksStats = cache(_getTracksStats);
```

**為什麼這樣做？**
- ✅ 同一個 request 內，多次呼叫同樣的函數只會執行一次
- ✅ `my-stats/page.tsx` 和 `my-stats/[sessionId]/page.tsx` 都呼叫 `getArtistRankingSubmissions`，加上 cache 後只查詢一次
- ✅ 零心智負擔：import 哪個函數就自動 cache

---

#### 1.2 創建 `HybridDataSourceControl.tsx`
**檔案位置**：`src/components/artist/HybridDataSourceControl.tsx`

**Props 設計**（修正後）：
```typescript
import { ArtistRankingSession, ArtistViewType } from '@/types/artist';

type HybridDataSourceControlProps = {
  artistId: string;
  currentSessionId: string | null;  // 不需要 currentMode（可推導）
  currentView: ArtistViewType;      // 使用型別而非 string
  sessions: ArtistRankingSession[];
};
```

**實作要點**：
- **使用 Radix UI DropdownMenu**（`src/components/ui/dropdown-menu.tsx`）而非 SimpleDropdown
- **Average 按鈕**：
  ```typescript
  <Button
    variant={!currentSessionId ? "primary" : "outline"}
    onClick={() => router.push(`/artist/${artistId}/my-stats?view=${currentView}`)}
  >
    Average
  </Button>
  ```
- **Snapshot 按鈕**：
  ```typescript
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant={currentSessionId ? "primary" : "outline"}>
        {currentSessionId ? formatDate(currentSession.createdAt) : 'Snapshot'}
        <ChevronDown className="ml-1" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {sessions.map(session => (
        <DropdownMenuItem
          key={session.id}
          onClick={() => router.push(`/artist/${artistId}/my-stats/${session.id}?view=${currentView}`)}
        >
          <Check className={session.id === currentSessionId ? 'visible' : 'invisible'} />
          {formatDate(session.createdAt)}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
  ```

**邊界情況處理**：
- **無 sessions 時**：
  ```typescript
  {sessions.length === 0 ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" disabled>
          Snapshot  {/* 注意：沒有 ChevronDown，避免視覺矛盾 */}
        </Button>
      </TooltipTrigger>
      <TooltipContent>尚無快照紀錄</TooltipContent>
    </Tooltip>
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={currentSessionId ? "primary" : "outline"}>
          {currentSessionId ? formatDate(currentSession.createdAt) : 'Snapshot'}
          <ChevronDown className="ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {sessions.map(session => (
          <DropdownMenuItem
            key={session.id}
            onClick={() => router.push(`/artist/${artistId}/my-stats/${session.id}?view=${currentView}`)}
          >
            <Check className={session.id === currentSessionId ? 'visible' : 'invisible'} />
            {formatDate(session.createdAt)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )}
  ```

**關鍵設計決策**：
- ✅ **移除 disabled 狀態的 ChevronDown**：避免「看起來可點但點不了」的視覺矛盾
- ✅ **不重複 Header 的行動呼籲**：Header 已有「Create Ranking」按鈕，Tooltip 保持簡潔
- ✅ **完整的條件分支**：消除「選了才出現」的特殊情況

**必要的 imports**：
```typescript
'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Check, ChevronDown } from 'lucide-react'; // 或 @radix-ui/react-icons
import { useRouter } from 'next/navigation';
```

#### 1.3 創建 `ViewLayoutControl.tsx`
**檔案位置**：`src/components/artist/ViewLayoutControl.tsx`

**Props 設計**（修正後）：
```typescript
import { ArtistViewType } from '@/types/artist';

type ViewLayoutControlProps = {
  currentView: ArtistViewType;  // 使用型別而非 string
};
```

**實作**：
```typescript
'use client';
import SimpleSegmentControl from '@/components/navigation/SimpleSegmentControl';

export default function ViewLayoutControl({ currentView }: ViewLayoutControlProps) {
  return (
    <SimpleSegmentControl
      value={currentView}
      options={[
        {
          label: 'Overview',
          value: 'overview',
          queryParam: ['view', 'overview']
        },
        {
          label: 'All Rankings',
          value: 'all-rankings',
          queryParam: ['view', 'all-rankings']
        },
      ]}
      size="md"
    />
  );
}
```

#### 1.4 創建視圖元件

**`OverviewView.tsx`**
```typescript
// src/features/ranking/views/OverviewView.tsx
'use client';

import { ArtistDataSourceMode } from '@/types/artist';
import { AlbumStatsType, AlbumSession } from '@/types/...'; // 根據實際路徑

type OverviewViewProps = {
  mode: ArtistDataSourceMode;
  albumRankings?: AlbumStatsType[];  // 只在 Average 模式有
  albumSessions?: AlbumSession[];    // 只在 Average 模式有
  artistId: string;
};

export default function OverviewView({
  mode,
  albumRankings,
  albumSessions,
  artistId
}: OverviewViewProps) {
  if (mode === 'snapshot') {
    return <div>Snapshot Overview - 未來實作圖表視圖</div>;
  }

  return (
    <>
      {/* 現有的 Charts */}
      {/* 現有的 AlbumBoard */}
    </>
  );
}
```

**`AllRankingsView.tsx`**
```typescript
// src/features/ranking/views/AllRankingsView.tsx
'use client';

import { ArtistDataSourceMode } from '@/types/artist';
import { TrackStatsType, TrackHistoryType } from '@/types/...';
import ClientStatsRankingTable from '@/components/.../ClientStatsRankingTable';
import ClientHistoryRankingTable from '@/components/.../ClientHistoryRankingTable';

type AllRankingsViewProps = {
  mode: ArtistDataSourceMode;
  trackRankings: TrackStatsType[] | TrackHistoryType[];
  albums: Array<{ name: string }>;
};

export default function AllRankingsView({
  mode,
  trackRankings,
  albums
}: AllRankingsViewProps) {
  if (mode === 'average') {
    return <ClientStatsRankingTable trackRankings={trackRankings as TrackStatsType[]} albums={albums} />;
  }

  return <ClientHistoryRankingTable trackRankings={trackRankings as TrackHistoryType[]} albums={albums} />;
}
```

### Phase 2: 路由結構準備（建立新結構,保留舊結構）

#### 2.1 創建新目錄結構
```bash
mkdir -p src/app/\(main\)/artist/\[artistId\]/\(artist\)/my-stats/\[sessionId\]
```

**說明**：不需要創建 `my-stats/layout.tsx`（避免空殼 Layout），所有邏輯在 Page 層完成。

---

#### 2.2 創建 `my-stats/page.tsx` (Average 模式)

```typescript
// src/app/(main)/artist/[artistId]/(artist)/my-stats/page.tsx
import { getUserSession } from '@/lib/auth';
import { getTracksStats, getAlbumsStats, getAlbumRankingSessions, getLoggedAlbumNames } from '@/services/...';
import { getArtistRankingSubmissions } from '@/services/...';
import { calculateDateRangeFromSlug } from '@/lib/utils/...';
import { ArtistViewType } from '@/types/artist';
import HybridDataSourceControl from '@/components/artist/HybridDataSourceControl';
import ViewLayoutControl from '@/components/artist/ViewLayoutControl';
import OverviewView from '@/features/ranking/views/OverviewView';
import AllRankingsView from '@/features/ranking/views/AllRankingsView';
import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ artistId: string }>;
  searchParams: Promise<{ view?: string; range?: string }>;
};

export default async function MyStatsPage({ params, searchParams }: PageProps) {
  const { artistId } = await params;
  const { view: rawView, range } = await searchParams;

  // 驗證 view 參數，無效則重定向
  const VALID_VIEWS: ArtistViewType[] = ['overview', 'all-rankings'];
  if (rawView && !VALID_VIEWS.includes(rawView as ArtistViewType)) {
    const queryParams = new URLSearchParams();
    queryParams.set('view', 'overview');
    if (range) queryParams.set('range', range);
    redirect(`/artist/${artistId}/my-stats?${queryParams.toString()}`);
  }

  const view: ArtistViewType = (rawView as ArtistViewType) || 'overview';
  const { id: userId } = await getUserSession();

  const dateRange = calculateDateRangeFromSlug(range);

  // 獲取 Track 資料
  const trackRankings = await getTracksStats({ artistId, userId, dateRange });

  // 條件性獲取 Album 資料（只在 Overview 視圖需要）
  const albumData = view === 'overview'
    ? {
        albumRankings: await getAlbumsStats({ artistId, userId, dateRange }),
        albumSessions: await getAlbumRankingSessions(userId, artistId),
      }
    : null;

  const albums = await getLoggedAlbumNames(artistId, userId);

  // 獲取 sessions（用於控制項）
  const sessions = await getArtistRankingSubmissions(artistId, userId);

  return (
    <>
      {/* 控制項區域 */}
      <div className="p-content flex items-center justify-between">
        <HybridDataSourceControl
          artistId={artistId}
          currentSessionId={null}
          currentView={view}
          sessions={sessions}
        />
        <ViewLayoutControl currentView={view} />
      </div>

      {/* 視圖渲染 */}
      {view === 'overview' ? (
        <OverviewView
          mode="average"
          albumRankings={albumData?.albumRankings}
          albumSessions={albumData?.albumSessions}
          artistId={artistId}
        />
      ) : (
        <AllRankingsView
          mode="average"
          trackRankings={trackRankings}
          albums={albums}
        />
      )}
    </>
  );
}
```

**重要修正點**：
1. **View 參數驗證**：無效的 `view` 參數會重定向到 `overview`（保留其他參數如 `range`）
2. **控制項在 Page 渲染**：所有邏輯集中在 Page 層
3. **型別安全**：驗證後的 `view` 保證是 `ArtistViewType`
4. **條件性資料獲取**：Album 資料只在 Overview 視圖載入

**為什麼用 redirect 而非 notFound**：
- ✅ 使用者友善：自動導到正確 URL，而非顯示 404
- ✅ URL 自我修正：瀏覽器位址列會更新
- ✅ 符合「Never break userspace」原則

---

#### 2.3 創建 `my-stats/[sessionId]/page.tsx` (Snapshot 模式)

```typescript
// src/app/(main)/artist/[artistId]/(artist)/my-stats/[sessionId]/page.tsx
import { getUserSession } from '@/lib/auth';
import { getTracksHistory, getLoggedAlbumNames } from '@/services/...';
import { getArtistRankingSubmissions } from '@/services/...';
import { ArtistViewType } from '@/types/artist';
import HybridDataSourceControl from '@/components/artist/HybridDataSourceControl';
import ViewLayoutControl from '@/components/artist/ViewLayoutControl';
import OverviewView from '@/features/ranking/views/OverviewView';
import AllRankingsView from '@/features/ranking/views/AllRankingsView';
import { notFound, redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ artistId: string; sessionId: string }>;
  searchParams: Promise<{ view?: string }>;
};

export default async function SnapshotPage({ params, searchParams }: PageProps) {
  const { artistId, sessionId } = await params;
  const { view: rawView } = await searchParams;
  const { id: userId } = await getUserSession();

  // 驗證 view 參數，無效則重定向
  const VALID_VIEWS = ['overview', 'all-rankings'] as const;
  if (rawView && !VALID_VIEWS.includes(rawView as any)) {
    redirect(`/artist/${artistId}/my-stats/${sessionId}?view=overview`);
  }

  const view: ArtistViewType = (rawView as ArtistViewType) || 'overview';

  // 驗證 sessionId 是否有效
  const sessions = await getArtistRankingSubmissions(artistId, userId);
  const currentSession = sessions.find(s => s.id === sessionId);

  if (!currentSession) {
    notFound();  // 資源不存在用 notFound，參數錯誤用 redirect
  }

  // 獲取 Snapshot 資料
  const trackRankings = await getTracksHistory({ artistId, userId, dateId: sessionId });
  const albums = await getLoggedAlbumNames(artistId, userId);

  return (
    <>
      {/* 控制項區域 */}
      <div className="p-content flex items-center justify-between">
        <HybridDataSourceControl
          artistId={artistId}
          currentSessionId={sessionId}
          currentView={view}
          sessions={sessions}
        />
        <ViewLayoutControl currentView={view} />
      </div>

      {/* 視圖渲染 */}
      {view === 'overview' ? (
        <OverviewView mode="snapshot" artistId={artistId} />
      ) : (
        <AllRankingsView mode="snapshot" trackRankings={trackRankings} albums={albums} />
      )}
    </>
  );
}
```

**重要修正點**：
1. **View 參數驗證**：無效的 `view` 參數會重定向（保持 sessionId）
2. **SessionId 驗證**：資源不存在時使用 `notFound()`（與參數錯誤區分）
3. **控制項一致性**：Average 和 Snapshot 頁面渲染相同的控制項（保持 UI 穩定）

**驗證邏輯的區別**：
- `view` 參數錯誤 → `redirect()`（參數可修正）
- `sessionId` 不存在 → `notFound()`（資源真的不存在）

### Phase 3: 配置更新（準備切換）

#### 3.1 更新 `artistTabs.ts`
```typescript
// src/config/artistTabs.ts
export const getArtistTabOptions = (artistId: string) => [
  {
    id: "my-stats",
    label: "My Stats",
    href: `/artist/${artistId}/my-stats`,
  },
  {
    id: "community",
    label: "Community",
    href: `/artist/${artistId}/community`,
  },
];
```

#### 3.2 更新根 `page.tsx` 重定向
```typescript
// src/app/(main)/artist/[artistId]/page.tsx
import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ artistId: string }>;
};

export default async function ArtistPage({ params }: PageProps) {
  const { artistId } = await params;
  redirect(`/artist/${artistId}/my-stats`);
}
```

**說明**：開發階段無需為舊路由（`/overview`, `/history`）建立重定向,直接刪除即可。

### Phase 4: 測試新結構（與舊結構並存）

#### 4.1 手動測試 URL
```bash
# 測試 Average 模式
http://localhost:3000/artist/[artistId]/my-stats
http://localhost:3000/artist/[artistId]/my-stats?view=overview
http://localhost:3000/artist/[artistId]/my-stats?view=all-rankings

# 測試 Snapshot 模式
http://localhost:3000/artist/[artistId]/my-stats/[sessionId]
http://localhost:3000/artist/[artistId]/my-stats/[sessionId]?view=overview
```

#### 4.2 驗證功能
- [ ] Average 模式的 Overview 視圖顯示圖表和專輯面板
- [ ] Average 模式的 All Rankings 視圖顯示虛擬列表
- [ ] Snapshot 模式的 Overview 視圖顯示正確內容
- [ ] Snapshot 模式的 All Rankings 視圖顯示歷史數據
- [ ] Snapshot 下拉選單正確顯示所有日期
- [ ] 切換日期後 URL 和內容正確更新
- [ ] 視圖切換時保持當前模式和日期
- [ ] `view` 切換時其他查詢參數（如 `range`）正確保留

#### 4.3 驗證邊界情況
- [ ] **無 sessions 時**：Snapshot 按鈕 disabled、無箭頭、Tooltip 顯示「尚無快照紀錄」
- [ ] **無效 sessionId**：訪問 `/my-stats/invalid-id` 顯示 404
- [ ] **無效 view 參數**：訪問 `/my-stats?view=foobar` 自動重定向到 `?view=overview`
- [ ] **保留其他參數**：`/my-stats?view=invalid&range=30d` 重定向為 `?view=overview&range=30d`
- [ ] **Snapshot 模式 view 驗證**：`/my-stats/abc123?view=invalid` 重定向到 `/my-stats/abc123?view=overview`
- [ ] **切換視圖保留模式**：在 Snapshot 模式下切換視圖，URL 保留 sessionId
- [ ] **頁面刷新**：重新整理頁面後，所有參數（view, range, sessionId）正確保留
- [ ] **瀏覽器導航**：前進/後退按鈕正常運作

#### 4.4 視覺驗證
- [ ] 從 Average 切到 Snapshot 無佈局跳動
- [ ] Snapshot 按鈕選中後顯示當前日期（如 "Oct 2, 2024 ▼"）
- [ ] **Snapshot 按鈕 disabled 狀態**：無 sessions 時，按鈕無下拉箭頭
- [ ] 控制項在移動端正常顯示和操作

### Phase 5: 遷移與清理（確認新結構無誤後執行）

#### 5.1 刪除舊路由
```bash
rm -rf src/app/\(main\)/artist/\[artistId\]/\(artist\)/overview
rm -rf src/app/\(main\)/artist/\[artistId\]/\(artist\)/history
```

#### 5.2 更新內部連結（如有）
**需要檢查的檔案**：
- `src/components/layout/ArtistNavigationHeader.tsx`
- `src/features/sorter/components/CreateRankingButton.tsx`
- 所有包含 `/artist/[artistId]/overview` 或 `/history` 的元件

**搜尋指令**：
```bash
grep -r "artist/.*/overview" src/
grep -r "artist/.*/history" src/
```

#### 5.3 更新測試（如有）
```bash
grep -r "overview\|history" src/**/*.test.tsx
```

### Phase 6: 最終驗證與優化

#### 6.1 執行 Lint 和 Type Check
```bash
npm run lint
npx tsc --noEmit
```

#### 6.2 效能檢查
- [ ] 確認切換視圖時不會重新獲取資料（searchParams 變化會觸發頁面重新渲染，這是 Next.js 的預期行為）
- [ ] 確認 Layout 在切換模式時不會重新渲染
- [ ] **確認 React Cache 生效**：同一 request 內，`getArtistRankingSubmissions` 只執行一次（檢查資料庫查詢日誌）

#### 6.3 使用者體驗測試
- [ ] 從 Average 切到 Snapshot 的轉場流暢
- [ ] Snapshot 下拉選單的開關動畫自然
- [ ] 按鈕文字變化（"Snapshot" → "Oct 2, 2024"）清晰可見
- [ ] 所有互動在移動端正常運作

---

## 風險評估與應對策略

### 風險 1: ~~URL 變更導致現有書籤失效~~
**結論**：開發階段無此風險,無需處理舊路由重定向。

### 風險 2: Snapshot 下拉選單效能問題
**影響範圍**：如果使用者有數百個 sessions,下拉選單會很長

**應對策略**：
- 限制顯示最近 50 個 sessions
- 加入搜尋或日期範圍過濾功能（未來優化）
- 使用虛擬滾動（如果必要）

### 風險 3: 移動端的 Snapshot 下拉選單體驗
**影響範圍**：小螢幕下,下拉選單可能遮擋其他內容

**應對策略**：
- Radix DropdownMenu 已內建 Portal,會自動處理定位
- 測試移動端體驗,必要時調整 `DropdownMenuContent` 的 `align` 和 `side` props

### ~~風險 4: Server/Client Component 資料重複獲取~~
**結論**：已在 Phase 1.0 透過 React Cache 解決（直接包裝在各函數檔案內）。

### 風險 4: View 切換導致整頁重新渲染
**影響範圍**：searchParams 變化會觸發 Server Component 重新執行

**現狀評估**：
- 這是 Next.js App Router 的預期行為
- 好處：資料永遠是最新的（如 Album 資料條件性載入）
- 壞處：切換視圖會有輕微延遲

**應對策略（未來優化）**：
- 方案 A：將視圖切換改為 Client State,但會失去 URL 狀態持久性
- 方案 B：使用 Parallel Routes（複雜度高）
- **建議**：保持現狀,觀察實際使用體驗

---

## 成功指標

### 技術指標
- [ ] 所有 TypeScript 編譯錯誤清零
- [ ] ESLint 無新增警告
- [ ] 所有 URL 路徑一致且語義化
- [ ] Layout 在路由切換時不重新渲染

### 使用者體驗指標
- [ ] 從 Average 切換到 Snapshot 只需一次點擊
- [ ] 佈局穩定,無元素跳動
- [ ] 當前選中的日期清楚顯示在 Snapshot 按鈕上
- [ ] 視圖切換時載入流暢（即使有重新渲染）

### 程式碼品質指標
- [ ] 路由檔案數量減少（5 個 → 3 個）
- [ ] 元件邏輯清晰（Server/Client 邊界明確）
- [ ] 視圖元件可重用（Average 和 Snapshot 共用）
- [ ] 型別安全（使用 ArtistViewType 和 ArtistDataSourceMode）

---

## 回滾計劃

如果新架構出現嚴重問題,回滾步驟：

1. **Git 分支策略**（建議）：
   ```bash
   git checkout -b feature/artist-page-restructure
   # 所有改動在此分支進行
   # 如需回滾：
   git checkout main
   ```

2. **配置切換**：
   - 恢復 `artistTabs.ts` 和根 `page.tsx` 的重定向
   - 刪除新建的 `my-stats/` 目錄
   - 恢復舊的 `overview/` 和 `history/` 目錄（如果已刪除）

---

## 附錄：檔案變更清單

### 新建檔案
```
src/types/artist.ts
src/components/artist/HybridDataSourceControl.tsx
src/components/artist/ViewLayoutControl.tsx
src/features/ranking/views/OverviewView.tsx
src/features/ranking/views/AllRankingsView.tsx
src/app/(main)/artist/[artistId]/(artist)/my-stats/page.tsx
src/app/(main)/artist/[artistId]/(artist)/my-stats/[sessionId]/page.tsx
```

**說明**：不創建 `my-stats/layout.tsx`（避免空殼 Layout）

### 修改檔案

#### 核心修改
```
src/config/artistTabs.ts - Tab 選項從 3 個改為 2 個
src/app/(main)/artist/[artistId]/page.tsx - 重定向目標更新
```

#### 資料層修改（加入 React Cache）
```
src/services/track/getTracksStats.ts
src/services/track/getTracksHistory.ts
src/services/album/getAlbumsStats.ts
src/db/album.ts - getLoggedAlbumNames, getAlbumRankingSessions
src/db/ranking.ts - getArtistRankingSubmissions
```

#### 可能的資料層遷移（視實作需求）
**原則**：若需使用 `lib/database/**/*` 的函數，在 `services/` 或 `db/` 創建包裝

**範例場景**（假設）：
```
src/services/track/getTracksMetrics.ts - 若需從 lib/database 遷移
src/services/ranking/getLatestSubmission.ts - 若需從 lib/database 遷移
```

**遷移記錄**（實作時填寫）：
```
# 格式：新檔案路徑 - 來源檔案路徑
# 範例：src/services/track/getTracksMetrics.ts ← lib/database/ranking/overview/getTracksMetrics.ts

（此處在實作過程中記錄實際遷移的函數）
```

### 刪除檔案（Phase 5）
```
src/app/(main)/artist/[artistId]/(artist)/overview/page.tsx
src/app/(main)/artist/[artistId]/(artist)/history/page.tsx
src/app/(main)/artist/[artistId]/(artist)/history/[dateId]/page.tsx
```

---

## 預計時程

| Phase | 預計時間 | 說明 |
|-------|---------|------|
| Phase 0 | ✅ 完成 | Review plan.md，備份程式碼 |
| Phase 0.5 | 30 分鐘 | 型別定義與架構驗證 |
| Phase 1 | 3-4 小時 | 資料層 Cache 優化 + 開發新元件 |
| Phase 2 | 1-2 小時 | 建立新路由結構（包含 view 驗證） |
| Phase 3 | 30 分鐘 | 更新配置檔案 |
| Phase 4 | 1.5 小時 | 測試新結構（含邊界測試） |
| Phase 5 | 30 分鐘 | 刪除舊程式碼，更新連結 |
| Phase 6 | 1 小時 | 最終驗證與優化 |
| **總計** | **7-9 小時** | 分散在 2-3 天執行 |

---

## 注意事項

1. **優先使用 src/components/ui/ 的元件**：不要重新發明輪子
2. **不創建空殼 Layout**：`my-stats/` 不需要 `layout.tsx`，所有邏輯在 Page 層
3. **React Cache 必須在 Phase 1 完成**：這是正確性要求，不是優化
4. **型別安全 + Runtime 驗證**：
   - TypeScript：使用 `ArtistViewType` 和 `ArtistDataSourceMode`
   - Runtime：用 `redirect()` 處理無效的 `view` 參數
5. **驗證邏輯的區別**：
   - 參數錯誤（view）→ `redirect()`（可修正）
   - 資源不存在（sessionId）→ `notFound()`（真的不存在）
6. **Snapshot 按鈕的視覺一致性**：disabled 狀態不該有下拉箭頭
7. **searchParams 是 Promise**：Next.js 15 的 API 變更
8. **保持 Layout 穩定**：`CollapsibleArtistHeader` 的狀態管理不能被破壞
9. **移動端優先**：Snapshot 下拉選單在小螢幕下的體驗需特別注意
10. **開發階段無需舊路由重定向**：直接刪除舊程式碼即可

---

## 後續優化方向（非本次任務範圍）

1. **統一 Table 元件**：合併 `ClientStatsRankingTable` 和 `ClientHistoryRankingTable`
2. **Snapshot Overview 實作**：完成 Snapshot 模式下的圖表視圖
3. **Community 頁面開發**：實作社群統計資料
4. **日期範圍選擇器**：Average 模式支援自訂時間範圍
5. **Snapshot 搜尋功能**：在下拉選單加入日期搜尋或篩選
6. **視圖切換優化**：探索 Client State 或 Parallel Routes 方案（如果效能成為問題）

---

**Plan 撰寫完成時間**: 2025-10-03
**最後更新時間**: 2025-10-03 (Linus Review 後全面修正)
**修正內容摘要**:
1. ✅ Cache 策略從「風險應對」提升為「Phase 1.0 必要步驟」
2. ✅ 移除空殼 `my-stats/layout.tsx`
3. ✅ Snapshot 按鈕 disabled 狀態移除箭頭，避免視覺矛盾
4. ✅ 加上 view 參數的 `redirect()` 驗證（區分參數錯誤 vs 資源不存在）
5. ✅ 補充完整的邊界測試項目

**下一步**: 執行 Phase 0.5 建立型別定義
