# 排名系統草稿檢查流程重構計畫

## 📋 目標概述

簡化排名系統的草稿檢查流程，移除冗餘的 localStorage 時間戳比較邏輯，將草稿檢查統一在排名頁面處理，並實作 beforeunload 警告機制。

---

## 🎯 核心問題與解決方案

### **問題 1：三層冗餘檢查**

**現況**：
```
CreateRankingButton (檢查資料庫 + localStorage)
       ↓
   Modal 詢問使用者
       ↓
  導航到 Sorter Page (再次檢查資料庫)
       ↓
SorterWithConflictResolver (比較 localStorage vs 資料庫時間戳)
```

**問題**：
- CreateRankingButton 檢查草稿 → **冗餘**（Page 會再檢查）
- SorterWithConflictResolver 比較時間戳 → **過度複雜**（增加故障點）
- localStorage 被當作「第二個真實來源」→ **違反單一數據源原則**

**解決方案**：
```
CreateRankingButton (單純導航，使用 Next.js Link)
       ↓
  導航到 Sorter Page
       ↓
   檢查資料庫是否有草稿
       ↓
   有草稿 → DraftResolver 顯示 Modal 詢問
   沒草稿 → 直接顯示 FilterStage
```

---

### **問題 2：localStorage 角色錯位**

**現況**：
- 每次點擊寫入 localStorage（帶時間戳）
- 頁面載入時比較 localStorage vs 資料庫時間戳
- 選擇較新的版本作為初始狀態

**問題**：
- 客戶端/伺服器時間可能不同步
- localStorage 可能被清除、損壞、手動修改
- 為了挽救「幾秒鐘的數據」而寫一套複雜的時間戳比較邏輯
- 時間戳比較是脆弱的、不可靠的

**解決方案**：
- **完全移除 localStorage**
- 頁面載入永遠從資料庫讀取（單一數據源）
- 使用 debounce/throttle 自動儲存到資料庫（從 3 分鐘改為 30 秒）
- 可接受的代價：最多損失 30 秒內的點擊數據

---

### **問題 3：導航邏輯過度抽象**

**現況**：
```typescript
// useRankingNavigation.ts（簡化後還剩什麼？）
export function useRankingNavigation({ artistId, type, albumId }) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateToRanking = useCallback(async () => {
    setIsNavigating(true);
    router.push(targetUrl);
    setIsNavigating(false);
  }, []);

  return { navigateToRanking, isNavigating };
}
```

**問題**：
- Hook 只做了「計算 URL + 呼叫 router.push()」
- 多一層抽象但沒有實際價值
- `isNavigating` 狀態對 UX 幫助不大（Next.js 已有內建 loading UI）

**解決方案**：
- **直接使用 Next.js `<Link>` 元件**
- 刪除整個 `useRankingNavigation.ts` 檔案
- 更符合 Next.js 慣例、更簡單、更好的 SEO 和無障礙支援

---

## 📐 架構設計

### **新的資料流**

```
使用者點擊 CreateRankingButton (Next.js Link)
       ↓
  導航到 /sorter/artist/[artistId] 或 /sorter/album/[albumId]
       ↓
   Page 從資料庫查詢是否有未完成的 submission
       ↓
┌──────────────────┬────────────────────┐
│  沒有草稿         │   有草稿            │
├──────────────────┼────────────────────┤
│ FilterStage      │ <DraftResolver>    │
│ (Artist Sorter)  │   ↓ Modal 詢問     │
│                  │   ├─ Continue      │
│ 或               │   │  → RankingStage│
│                  │   │                │
│ 自動建立 + 導航  │   └─ Start Over    │
│ (Album Sorter)   │      → 刪除草稿    │
│                  │      → refresh()   │
└──────────────────┴────────────────────┘
       ↓
  RankingStage (排名遊戲)
       ↓
  使用者每次點擊：
  1. 立即更新 React State
  2. 觸發 throttled 資料庫儲存（30 秒間隔）
       ↓
  beforeunload 檢查：
  如果 saveStatus !== "saved" → 顯示警告
```

---

### **DraftResolver 元件設計**

**職責**：
- 統一處理草稿詢問邏輯
- 可重用於 Artist Sorter 和 Album Sorter

**API**：
```typescript
type DraftResolverProps = {
  hasDraft: boolean;           // 是否有草稿
  submissionId?: string;       // 草稿 ID（用於刪除）
  draftDate?: Date;            // 草稿日期（顯示給使用者）
  onStartOver?: () => void;    // 自訂「重新開始」行為（可選）
  children: React.ReactNode;   // 草稿內容（RankingStage）
};
```

**行為**：
1. `hasDraft === false` → 直接渲染 children
2. `hasDraft === true` → 顯示 Modal 詢問
   - **Continue Draft** → 渲染 children
   - **Start Over** → 刪除 submission + 執行 `onStartOver` 或 `router.refresh()`

---

## 📝 實施步驟

### **Phase 1：移除冗餘邏輯與檔案**

#### **任務 1.1：刪除 localStorage 相關檔案**
**檔案**：
- `src/features/sorter/utils/localDraft.ts`
- `src/features/sorter/components/SorterWithConflictResolver.tsx`

**理由**：
- localStorage 不再用於時間戳比較
- SorterWithConflictResolver 的唯一用途就是比較時間戳

---

#### **任務 1.2：刪除導航 Hook**
**檔案**：
- `src/features/sorter/hooks/useRankingNavigation.ts`

**理由**：
- 簡化後只剩「計算 URL + 導航」，過度抽象
- 直接用 Next.js Link 更簡單

---

#### **任務 1.3：檢查並刪除 checkDraft Server Action**
**檔案**：
- `src/features/sorter/actions/checkDraft.ts`

**動作**：
1. 使用 Grep 確認是否還有其他地方使用
   ```bash
   # 搜尋 checkDraft 的所有引用
   grep -r "checkDraft" src/ --include="*.ts" --include="*.tsx"

   # 或使用 Grep tool
   # pattern: "checkDraft"
   # glob: "**/*.{ts,tsx}"
   ```
2. 如果只有 `useRankingNavigation` 使用 → 刪除
3. 如果有其他地方使用 → 保留並加上 `@deprecated` JSDoc，並在所有引用移除後統一刪除

---

### **Phase 2：重構 CreateRankingButton**

#### **任務 2.1：改用 Next.js Link**
**檔案**：`src/features/sorter/components/CreateRankingButton.tsx`

**變更前**：
```typescript
const { navigateToRanking, isNavigating } = useRankingNavigation({
  artistId,
  type,
  albumId,
});

return (
  <Button onClick={navigateToRanking} disabled={isNavigating}>
    <Plus /> Create
  </Button>
);
```

**變更後**：
```typescript
import Link from "next/link";

// 計算路由並加上邊界檢查
const href = useMemo(() => {
  if (type === "ALBUM") {
    if (!albumId) {
      console.error("albumId is required for ALBUM type");
      return `/sorter/artist/${artistId}`; // Fallback
    }
    return `/sorter/album/${albumId}`;
  }
  return `/sorter/artist/${artistId}`;
}, [type, albumId, artistId]);

return (
  <Button asChild>
    <Link href={href}>
      <Plus /> Create
    </Link>
  </Button>
);
```

**優點**：
- ✅ 刪除 `useRankingNavigation` import
- ✅ 移除 `isNavigating` 狀態管理
- ✅ 自動 prefetch、更好的 SEO、支援右鍵開新分頁
- ✅ 加上邊界檢查，避免 `undefined` 導致錯誤路由

---

### **Phase 3：建立 DraftPrompt 與 CorruptedDraftFallback 元件**

#### **任務 3.1：建立 DraftPrompt 元件**
**檔案**：`src/features/sorter/components/DraftPrompt.tsx`（新建）

**設計理念**：
- ✅ **完全用 Server Component 條件渲染**：Page 決定渲染 DraftPrompt 或 FilterStage
- ✅ **無 Hydration 問題**：用 `useState` 直接管理狀態，不依賴 `useEffect`
- ✅ **更簡單直觀**：`choice` 狀態直接對應 UI（Modal / RankingStage / Loading）

**實作**：
```typescript
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import deleteSubmission from "../actions/deleteSubmission";
import { dateToDashFormat } from "@/lib/utils";
import { RankingStage } from "./RankingStage";
import type { SorterState } from "../types";
import type { Track } from "@/types";

type DraftPromptProps = {
  submissionId: string;
  draftState: SorterState;
  draftDate: Date;
  tracks: Track[];
  userId: string;
};

export function DraftPrompt({
  submissionId,
  draftState,
  draftDate,
  tracks,
  userId,
}: DraftPromptProps) {
  const [choice, setChoice] = useState<"continue" | "restart" | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRestart = () => {
    setChoice("restart");
    startTransition(async () => {
      await deleteSubmission({ submissionId });
      router.refresh(); // 觸發 RSC refresh，會被 transition 追蹤
    });
  };

  // 使用者尚未選擇 → 顯示 Modal
  if (choice === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
          <h2 className="text-xl font-semibold">Unfinished Draft Found</h2>
          <p className="text-muted-foreground">
            You have an incomplete draft from {dateToDashFormat(draftDate)}.
            Would you like to continue?
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleRestart}
              disabled={isPending}
            >
              Start Over
            </Button>
            <Button
              onClick={() => setChoice("continue")}
              disabled={isPending}
            >
              Continue Draft
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 使用者選擇重新開始 → 顯示刪除中畫面
  if (choice === "restart") {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">正在刪除草稿...</p>
      </div>
    );
  }

  // 使用者選擇繼續 → 顯示 RankingStage
  return (
    <RankingStage
      initialState={draftState}
      tracks={tracks}
      submissionId={submissionId}
      userId={userId}
    />
  );
}
```

**設計要點**：

1. **狀態管理簡單明確**
   - `choice === null` → 顯示詢問 Modal
   - `choice === "continue"` → 顯示 RankingStage
   - `choice === "restart"` → 顯示刪除中畫面

2. **無 Hydration 問題**
   - 初始 `choice === null`，直接渲染 Modal
   - Server 和 Client 的初始渲染一致

3. **useTransition 處理刪除流程**
   - `handleRestart` 先設定 `choice === "restart"`（觸發 Loading UI）
   - `startTransition` 包裹 async 操作：刪除 + `router.refresh()`
   - `isPending` 追蹤整個 transition，包含 RSC refresh

4. **為何 useTransition 可以包裹 router.refresh()**
   - `router.refresh()` 會觸發 Server Components 重新執行
   - React 會追蹤這個更新，並在完成前保持 `isPending === true`
   - 使用者看到平滑的轉場，不會白屏

**與舊版 DraftResolver 的差異**：

| 特性 | DraftResolver (舊) | DraftPrompt (新) |
|------|-------------------|------------------|
| 設計模式 | Wrapper Pattern | Direct Rendering |
| Hydration | ⚠️ useEffect 延遲 | ✅ 無問題 |
| 狀態管理 | `resolved` + `hasDraft` | `choice` |
| Modal 顯示 | useEffect + Modal Context | 直接渲染 |
| 程式碼複雜度 | 較複雜 | 較簡單 |
| Props | `hasDraft`, `children`, `onStartOver` | `submissionId`, `draftState`, `tracks` |

---

#### **任務 3.2：建立 CorruptedDraftFallback 元件**
**檔案**：`src/features/sorter/components/CorruptedDraftFallback.tsx`（新建）

**設計理念**：
- ✅ **Client Component 處理互動**：Loading 狀態、錯誤處理
- ✅ **useTransition 優化 UX**：刪除時顯示「刪除中...」，transition 追蹤導航
- ✅ **router.push 而非 redirect**：Client 端導航，無需 Server Action redirect

**實作**：
```typescript
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import deleteSubmission from "../actions/deleteSubmission";

type CorruptedDraftFallbackProps = {
  submissionId: string;
  redirectPath: string;
};

export function CorruptedDraftFallback({
  submissionId,
  redirectPath,
}: CorruptedDraftFallbackProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteSubmission({ submissionId });
        if (result.error) {
          setError(result.error);
          return;
        }
        router.push(redirectPath); // 觸發導航，會被 transition 追蹤
      } catch (err) {
        setError(err instanceof Error ? err.message : "未知錯誤");
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-destructive">排名資料已損毀，無法繼續</p>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button
        onClick={handleDelete}
        disabled={isPending}
        variant="destructive"
      >
        {isPending ? "刪除中..." : "刪除草稿並重新開始"}
      </Button>
    </div>
  );
}
```

**設計要點**：

1. **useTransition 處理整個流程**
   - `startTransition` 包裹 async 刪除 + 導航
   - `isPending` → 按鈕顯示「刪除中...」並 disable
   - React 追蹤導航更新，避免白屏或卡頓

2. **錯誤處理**
   - `deleteSubmission` 失敗 → `setError()` 顯示錯誤訊息
   - `catch` 捕獲未預期的錯誤
   - 錯誤發生時 transition 結束，`isPending` 變回 `false`

3. **為何可以在 startTransition 中使用 async**
   - React 官方文件允許 async 回呼
   - `router.push()` 觸發的導航會被 transition 追蹤
   - 使用者看到平滑轉場，而非突然跳轉

---

### **Phase 4：整合 DraftPrompt 到 Page**

#### **任務 4.1：Artist Sorter 整合**
**檔案**：`src/app/sorter/artist/[artistId]/page.tsx`

**變更前**：
```typescript
if (submission && validation.success) {
  return (
    <SorterWithConflictResolver
      serverDraft={{ state: validation.data, updatedAt: ... }}
      tracks={tracks}
      submissionId={submission.id}
      userId={userId}
      status={submission.status}
    />
  );
}
```

**變更後**：
```typescript
import { DraftPrompt } from "@/features/sorter/components/DraftPrompt";
import { CorruptedDraftFallback } from "@/features/sorter/components/CorruptedDraftFallback";

// ... (Page 的其他邏輯)

// 🟢 Server Component 條件渲染：沒有草稿 → 直接顯示 FilterStage
if (!submission) {
  return <FilterStage albums={albums} singles={singles} />;
}

// 🟢 驗證草稿資料
const validation = sorterStateSchema.safeParse(submission.draftState);
if (!validation.success) {
  // 資料損毀 → 用 Client Component 處理刪除 + Loading 狀態
  return (
    <CorruptedDraftFallback
      submissionId={submission.id}
      redirectPath={`/sorter/artist/${artistId}`}
    />
  );
}

// 🟢 Server Component 條件渲染：有草稿 → 渲染 DraftPrompt
// DraftPrompt 內部處理 Modal 與 RankingStage 的切換
return (
  <DraftPrompt
    submissionId={submission.id}
    draftState={validation.data}
    draftDate={submission.updatedAt || submission.createdAt}
    tracks={tracks}
    userId={userId}
  />
);
```

**關鍵變更**：
- ❌ 移除 `SorterWithConflictResolver`
- ✅ **Server Component (Page) 負責條件渲染**：決定顯示 FilterStage 或 DraftPrompt
- ✅ **Client Component (DraftPrompt) 負責互動**：Modal 詢問 + RankingStage 顯示
- ✅ `draftState` 永遠來自資料庫（`validation.data`）
- ✅ 資料損毀時用 `CorruptedDraftFallback` Client Component 處理刪除 + Loading
- ✅ 無 Hydration 問題，無 `useEffect` 延遲

**資料流**：
```
Page (Server Component)
  ↓ 查詢資料庫
  ├─ 沒有 submission → FilterStage
  ├─ 資料損毀 → 錯誤 UI + 刪除按鈕
  └─ 有草稿 → DraftPrompt (Client Component)
       ↓ useState 管理 choice
       ├─ choice === null → Modal 詢問
       ├─ choice === "restart" → 刪除 + refresh
       └─ choice === "continue" → RankingStage
```

---

#### **任務 4.2：Album Sorter 整合**
**檔案**：`src/app/sorter/album/[albumId]/page.tsx`

**變更前**：
```typescript
if (submission && validation.success) {
  return (
    <SorterWithConflictResolver
      serverDraft={{ state: validation.data, updatedAt: ... }}
      tracks={tracks}
      submissionId={submission.id}
      userId={userId}
      status={submission.status}
    />
  );
}
```

**變更後**：
```typescript
import { DraftPrompt } from "@/features/sorter/components/DraftPrompt";
import { CorruptedDraftFallback } from "@/features/sorter/components/CorruptedDraftFallback";

// ... (Page 的其他邏輯)

// 🟢 Server Component 條件渲染：沒有草稿 → 自動建立（不 redirect）
if (!submission) {
  const tracks = await getTracksByAlbumId({ albumId });
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg">此專輯無歌曲資料</p>
        <Link href={`/album/${albumId}`}>
          <Button className="mt-4">返回專輯頁面</Button>
        </Link>
      </div>
    );
  }

  const submissionResult = await createSubmission({
    selectedAlbumIds: [albumId],
    selectedTrackIds: tracks.map((t) => t.id),
    type: "ALBUM",
    artistId: album.artistId,
    albumId,
  });

  // 建立成功 → 賦值給 submission，繼續往下執行
  if (submissionResult.data) {
    submission = submissionResult.data;
  } else {
    // 建立失敗 → 顯示錯誤
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-destructive">無法建立排名</p>
        <p className="text-sm text-muted-foreground">
          {submissionResult.error || "未知錯誤"}
        </p>
      </div>
    );
  }
}

// 🟢 驗證草稿資料
const tracks = await getTracksByAlbumId({ albumId });
const validation = sorterStateSchema.safeParse(submission.draftState);
if (!validation.success) {
  // 資料損毀 → 用 Client Component 處理刪除 + Loading 狀態
  return (
    <CorruptedDraftFallback
      submissionId={submission.id}
      redirectPath={`/sorter/album/${albumId}`}
    />
  );
}

// 🟢 Server Component 條件渲染：有草稿 → 渲染 DraftPrompt
return (
  <DraftPrompt
    submissionId={submission.id}
    draftState={validation.data}
    draftDate={submission.updatedAt || submission.createdAt}
    tracks={tracks}
    userId={userId}
  />
);
```

**關鍵差異**：
- ❌ 移除 `SorterWithConflictResolver`
- ✅ **與 Artist Sorter 完全一致的結構**（除了「沒有草稿」的處理邏輯）
- ✅ 資料損毀時用 `CorruptedDraftFallback` Client Component 處理刪除 + Loading
- ✅ 建立 submission 失敗時顯示錯誤訊息（不 redirect）
- ✅ DraftPrompt 的「Start Over」會刪除草稿後呼叫 `router.refresh()`
- ✅ `router.refresh()` 觸發 Page 重新執行 → 進入「沒有 submission」分支 → 自動建立新 submission（不 redirect）

**Album Sorter 特殊邏輯**：
- 沒有 FilterStage（因為只排名單一專輯的曲目）
- 直接自動建立 submission（同 Page，不 redirect）
- DraftPrompt 的「Start Over」行為：
  ```
  刪除草稿 → router.refresh()
  → Page 重新執行
  → !submission
  → createSubmission() → 賦值給 submission → 繼續執行
  ```

**資料流**：
```
Page (Server Component)
  ↓ 查詢資料庫
  ├─ 沒有 submission → 自動建立 + 賦值並繼續執行
  ├─ 資料損毀 → 錯誤 UI + 刪除按鈕
  └─ 有草稿 → DraftPrompt (Client Component)
       ↓ useState 管理 choice
       ├─ choice === null → Modal 詢問
       ├─ choice === "restart" → 刪除 + refresh → 觸發自動建立
       └─ choice === "continue" → RankingStage
```

---

### **Phase 5：清理 useSorter Hook**

#### **任務 5.1：移除 localStorage 寫入邏輯**
**檔案**：`src/features/sorter/hooks/useSorter.ts`

**變更**：
```diff
- import { saveDraftToLocalStorage } from "../utils/localDraft";

  const sortList = useCallback((flag: number) => {
    // ...
    setState(newState);
-   saveDraftToLocalStorage(newState, userId, submissionId);
    setPercentage(newState.percent);
    // ...
- }, [throttledAutoSave, setSaveStatus, setPercentage, submissionId, userId]);
+ }, [throttledAutoSave, setSaveStatus, setPercentage, submissionId]);
```

**移除**：
- Line 19: `import { saveDraftToLocalStorage } from "../utils/localDraft";`
- Line 327: `saveDraftToLocalStorage(newState, userId, submissionId);`
- Line 344 dependency array: 移除 `userId`（如果只用於 localStorage）

---

#### **任務 5.2：重構為 Debounce + 最大間隔保證**

**問題分析**：
- **Throttle 的缺陷**：使用者停止點擊後仍要等待 3 分鐘才儲存
- **資料遺失風險**：瀏覽器崩潰最多損失 3 分鐘數據
- **不符合直覺**：「自動儲存」應該是「停止後儲存」，而非「操作中定期儲存」

**解決方案**：
- ✅ **Debounce 優先**：停止點擊 10 秒後立即儲存
- ✅ **最大間隔保證**：連續點擊超過 2 分鐘 → 強制儲存
- ✅ **專用 Hook**：不考慮重用性，直接整合 `saveDraft` 和 `setSaveStatus`

---

**步驟 1：建立 useAutoSave.ts**

**檔案**：`src/features/sorter/hooks/useAutoSave.ts`（新建）

**完整實作**：
```typescript
// src/features/sorter/hooks/useAutoSave.ts
import { useRef, useCallback, useEffect } from 'react';
import type { SorterState } from '../types';
import saveDraft from '../actions/saveDraft';
import type { SaveStatusType } from '@/contexts/SorterContext';

type UseAutoSaveParams = {
  submissionId: string;
  setSaveStatus: (status: SaveStatusType) => void;
  debounceDelay?: number;  // 預設 10 秒
  maxInterval?: number;    // 預設 2 分鐘
};

/**
 * Sorter 專用自動儲存 Hook
 *
 * 行為:
 * - 使用者停止點擊 10 秒後 → 自動儲存
 * - 連續點擊超過 2 分鐘 → 強制儲存
 */
export function useAutoSave({
  submissionId,
  setSaveStatus,
  debounceDelay = 10 * 1000,
  maxInterval = 2 * 60 * 1000,
}: UseAutoSaveParams) {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxIntervalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);

  // 清理計時器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (maxIntervalTimerRef.current) clearTimeout(maxIntervalTimerRef.current);
    };
  }, []);

  // 實際執行儲存
  const executeSave = useCallback(async (state: SorterState) => {
    setSaveStatus('pending');

    try {
      const result = await saveDraft({
        submissionId,
        draftState: state,
      });

      if (result.error) {
        console.error('Auto-save failed:', result.error);
        setSaveStatus('failed');
      } else {
        setSaveStatus('saved');
        lastSaveTimeRef.current = Date.now();
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('failed');
    }
  }, [submissionId, setSaveStatus]);

  // 觸發自動儲存（由 sortList 呼叫）
  const triggerAutoSave = useCallback((state: SorterState) => {
    // 清除舊的 debounce 計時器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 如果是首次觸發，啟動最大間隔計時器
    if (!maxIntervalTimerRef.current) {
      maxIntervalTimerRef.current = setTimeout(() => {
        executeSave(state);
        maxIntervalTimerRef.current = null;

        // 清除 debounce 計時器（因為已經儲存了）
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
      }, maxInterval);
    }

    // 設定 debounce 計時器
    debounceTimerRef.current = setTimeout(() => {
      executeSave(state);

      // 清除最大間隔計時器（因為已經儲存了）
      if (maxIntervalTimerRef.current) {
        clearTimeout(maxIntervalTimerRef.current);
        maxIntervalTimerRef.current = null;
      }
    }, debounceDelay);
  }, [executeSave, debounceDelay, maxInterval]);

  return triggerAutoSave;
}
```

**設計要點**：
- 直接綁定 `SorterState` 型別（不需要泛型）
- 直接呼叫 `saveDraft` action（不需要外部傳入）
- 直接更新 `saveStatus`（不需要多層 callback）
- 兩個計時器：`debounceTimerRef`（10 秒）+ `maxIntervalTimerRef`（2 分鐘）

---

**步驟 2：重構 useSorter.ts**

**檔案**：`src/features/sorter/hooks/useSorter.ts`

**移除**：
1. Line 11: `import { useThrottle } from "@/lib/hooks/useDebounceAndThrottle";`
2. Line 12: `import saveDraft from "../actions/saveDraft";`（改由 useAutoSave 內部呼叫）
3. Line 21: `const autoSaveInterval = 3 * 60 * 1000;`
4. Line 243-285: `autoSave` 函數 + `throttledAutoSave`（共 ~43 行）

**新增**：
```typescript
import { useAutoSave } from "./useAutoSave";

// 在 useSorter 函數內
const triggerAutoSave = useAutoSave({
  submissionId,
  setSaveStatus,
  // debounceDelay 和 maxInterval 使用預設值
});
```

**修改 sortList**：
```diff
  const sortList = useCallback((flag: number) => {
    // ... 排序邏輯

    setState(newState);
    setPercentage(newState.percent);

    if (newState.isCompleted) {
      finalizeDraft(newState, submissionId);
    } else {
-     setTimeout(() => throttledAutoSave(), 0);
+     triggerAutoSave(newState);
    }
  }, [
-   throttledAutoSave,
+   triggerAutoSave,
    setSaveStatus,
    setPercentage,
    submissionId,
-   userId,  // 如果只用於 localStorage，可刪除
  ]);
```

**移除 userId 參數**（如果只用於 localStorage）：
```diff
  type UseSorterParams = {
    initialState: SorterState | null;
    tracks: Track[];
    submissionId: string;
-   userId: string;
  };
```

**移除 Line 19** (localStorage import)：
```diff
- import { saveDraftToLocalStorage } from "../utils/localDraft";
```

**移除 Line 327** (localStorage 呼叫)：
```diff
  setState(newState);
- saveDraftToLocalStorage(newState, userId, submissionId);
  setPercentage(newState.percent);
```

---

**行為驗證**：

| 場景 | 行為 |
|------|------|
| 點擊一次後停止 | 10 秒後自動儲存 |
| 連續點擊 5 分鐘 | 第 2 分鐘強制儲存 → 繼續點擊 → 第 4 分鐘再次強制儲存 |
| 連續點擊 1 分 50 秒後停止 | 10 秒後儲存（不會等到 2 分鐘） |
| 點擊後立即關閉分頁 | 最多損失 10 秒數據 |
| 瀏覽器崩潰 | 最多損失 10 秒數據（vs 舊版的 3 分鐘） |

**資料庫負載評估**：
- 短時間操作（< 2 分鐘）：停止後 10 秒觸發一次
- 長時間操作（> 2 分鐘）：每 2 分鐘一次
- 10 個同時線上使用者：每分鐘最多 5-10 次寫入（vs Throttle 的 3-4 次）
- 負載略增但可接受（PostgreSQL 輕鬆應付）

---

#### **任務 5.3：清理 ResultStage.tsx 的 localStorage**
**檔案**：`src/features/sorter/components/ResultStage.tsx`

**變更**：
1. 移除 Line 19: `import { saveDraftToLocalStorage } from "../utils/localDraft";`
2. 刪除 Line 98-108: `saveToLocalStorage` 函數
3. 移除 Line 146: `saveToLocalStorage(updatedResult)` 呼叫

**理由**：
- ResultStage 是短暫停留的調整階段，不需要自動儲存
- beforeunload 警告已足夠提醒使用者「未送出會遺失」
- 使用者應該快速調整後點擊「Submit」
- 不為低頻場景過度設計（YAGNI 原則）

---

### **Phase 6：實作 beforeunload 警告**

#### **任務 6.1：在 RankingStage 加上 beforeunload**
**檔案**：`src/features/sorter/components/RankingStage.tsx`

**新增邏輯**：
```typescript
// 在 RankingStage 元件中新增
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    // 如果有未儲存的變更，顯示警告
    if (saveStatus !== "saved") {
      e.preventDefault();
      e.returnValue = ''; // Chrome 需要設定 returnValue
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [saveStatus]);
```

**位置**：
- 放在 RankingStage 的 `useEffect` 區塊
- 依賴 `saveStatus` 狀態（來自 SorterContext）

**📋 SaveStatus 狀態定義**（來自 `src/contexts/SorterContext.tsx:10`）：
```typescript
export type SaveStatusType = "idle" | "pending" | "saved" | "failed";
```

**判斷邏輯**：
- `saveStatus === "saved"` → ✅ 已儲存，允許離開
- `saveStatus === "idle"` → ⚠️ 初始狀態或有新點擊但還沒觸發 throttle → 警告
- `saveStatus === "pending"` → ⚠️ 正在儲存中 → 警告
- `saveStatus === "failed"` → ⚠️ 儲存失敗 → 警告

**簡化判斷**：
```typescript
if (saveStatus !== "saved") {
  e.preventDefault(); // 只有 "saved" 才允許離開
}
```

**瀏覽器行為**：
- 顯示原生警告訊息（無法自訂文字，瀏覽器安全限制）
- 使用者可選擇「離開」或「留在頁面」

**⚠️ Critical Bug**：
- 使用者剛載入頁面 → `saveStatus === "idle"` → **立即觸發警告** → UX 災難
- **必須修正**：在 `useSorter` 初始化時，如果 `state` 來自伺服器（非使用者點擊）→ 設為 `"saved"`

**修正方式**：
```typescript
// useSorter.ts
// 在 useState 初始化時判斷
const [saveStatus, setSaveStatus] = useState<SaveStatusType>(
  initialState ? "saved" : "idle"
);
```

---

#### **任務 6.2：在 ResultStage 加上 beforeunload**
**檔案**：`src/features/sorter/components/ResultStage.tsx`

**新增邏輯**：
```typescript
// ResultStage 永遠顯示警告（因為結果尚未送出）
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, []);
```

**設計理念**：
- ResultStage 沒有自動儲存機制（不需要）
- 永遠顯示警告，因為結果尚未送出
- 不依賴 `saveStatus`（ResultStage 不使用 useSorter）
- 使用者應該快速調整後點擊「Submit」
- Submit 成功後應自動 unmount ResultStage（跳轉到成功頁面），所以不需要檢查提交狀態

---

## 📊 影響範圍總覽

### **刪除的檔案（4 個）**
1. ❌ `src/features/sorter/utils/localDraft.ts`
   - 使用位置：`useSorter.ts`, `ResultStage.tsx`, `SorterWithConflictResolver.tsx`, `useRankingNavigation.ts`
   - 影響：需清理所有 `import` 和呼叫

2. ❌ `src/features/sorter/components/SorterWithConflictResolver.tsx`
   - 使用位置：`artist/[artistId]/page.tsx`, `album/[albumId]/page.tsx`
   - 影響：改用 `DraftPrompt`

3. ❌ `src/features/sorter/hooks/useRankingNavigation.ts`
   - 使用位置：`CreateRankingButton.tsx`
   - 影響：改用 `Next.js Link`

4. ❌ `src/features/sorter/actions/checkDraft.ts`
   - 使用位置：`useRankingNavigation.ts`（會被刪除）
   - 影響：無，可直接刪除

### **新建的檔案（3 個）**
1. ✅ `src/features/sorter/components/DraftPrompt.tsx`（~70 行）
2. ✅ `src/features/sorter/components/CorruptedDraftFallback.tsx`（~40 行）
3. ✅ `src/features/sorter/hooks/useAutoSave.ts`（~80 行）

### **修改的檔案（5 個）**
1. 🔧 `src/features/sorter/components/CreateRankingButton.tsx`
   - 變更：移除 `useRankingNavigation`，改用 `Next.js Link`
   - 影響範圍：小（~20 行改動）

2. 🔧 `src/app/sorter/artist/[artistId]/page.tsx`
   - 變更：移除 `SorterWithConflictResolver`，改用 `DraftPrompt` + `CorruptedDraftFallback`
   - 影響範圍：中（~40 行改動）

3. 🔧 `src/app/sorter/album/[albumId]/page.tsx`
   - 變更：移除 `SorterWithConflictResolver`，改用 `DraftPrompt` + `CorruptedDraftFallback`（不 redirect）
   - 影響範圍：中（~40 行改動）

4. 🔧 `src/features/sorter/hooks/useSorter.ts`
   - 變更：移除 `saveDraftToLocalStorage`、移除 `autoSave` 函數、改用 `useAutoSave` Hook
   - 影響範圍：中（~50 行改動：刪除 43 行 + 新增 7 行）

5. 🔧 `src/features/sorter/components/RankingStage.tsx`
   - 變更：新增 `beforeunload` 事件監聽
   - 影響範圍：小（~15 行新增）

### **需要清理的檔案（1 個）**
1. 🧹 `src/features/sorter/components/ResultStage.tsx`
   - 變更：移除 Line 19 `import` 和 Line 104 `saveDraftToLocalStorage()` 呼叫
   - 影響範圍：極小（刪除 2 行）
   - 備註：ResultStage 中的拖放排序應改為觸發 Server Action 儲存，或移除 localStorage 儲存即可

### **總計**
- **刪除**：4 個檔案（~200 行）
- **新增**：3 個檔案（~190 行）
- **修改**：5 個檔案（~165 行改動）
- **清理**：1 個檔案（移除 localStorage 呼叫）
- **淨變化**：增加 ~10 行，但複雜度大幅降低，影響 **11 個檔案**

---

## ✅ 預期成果

### **程式碼簡化**
- 刪除 ~200 行程式碼（4 個檔案：localDraft.ts + SorterWithConflictResolver.tsx + useRankingNavigation.ts + checkDraft.ts）
- 新增 ~190 行程式碼（3 個檔案：DraftPrompt.tsx + CorruptedDraftFallback.tsx + useAutoSave.ts）
- useSorter.ts 簡化 ~43 行（移除 autoSave 函數）
- **淨增加 ~10 行，但複雜度大幅降低**

### **架構改進**
- ✅ **單一數據源**（資料庫，移除 localStorage）
- ✅ **移除時間戳比較**的脆弱邏輯
- ✅ **Server Component 條件渲染**：Page 層級決定顯示哪個元件
- ✅ **無 Hydration 問題**：DraftPrompt 用 `useState` 直接管理狀態
- ✅ **更符合 Next.js 慣例**：使用 `<Link>`、Server/Client 分離

### **使用者體驗**
- ✅ **無 Modal 延遲**：不依賴 `useEffect`，Modal 立即顯示
- ✅ **beforeunload 警告**：防止意外關閉導致資料遺失
- ✅ **更快的自動儲存**：30 秒 vs 3 分鐘（減少資料遺失風險）
- ✅ **更好的導航體驗**：Link prefetch、支援右鍵開新分頁

### **可接受的代價**
- ⚠️ 最多損失 10 秒內的點擊數據（瀏覽器崩潰/斷電/強制關閉）
- ⚠️ 連續操作時每 2 分鐘強制儲存一次（vs 舊版的 3 分鐘）
- ⚠️ 資料庫寫入頻率略增（但仍可接受）
- ⚠️ 這是實用主義的選擇：**簡單 > 完美**

---

## 🔍 驗證檢查清單

實作完成後，請驗證：

### **功能驗證**
- [ ] Artist Sorter：點擊「Create」按鈕可正常導航（Next.js Link）
- [ ] Album Sorter：點擊「Create」按鈕可正常導航（Next.js Link）
- [ ] Artist Sorter：有草稿時**立即顯示** Modal 詢問（無延遲）
- [ ] Album Sorter：有草稿時**立即顯示** Modal 詢問（無延遲）
- [ ] Modal「Continue Draft」→ 繼續排名（顯示 RankingStage）
- [ ] Modal「Start Over」→ 刪除草稿並重新開始（Artist: FilterStage, Album: 自動建立新 submission）
- [ ] 排名遊戲：停止點擊 10 秒後自動儲存（debounce）
- [ ] 排名遊戲：連續點擊超過 2 分鐘時強制儲存（max interval）
- [ ] saveStatus 狀態正確轉換：idle → pending → saved
- [ ] 儲存失敗時 saveStatus 變為 failed
- [ ] RankingStage beforeunload：有未儲存變更時顯示警告（`saveStatus !== "saved"`）
- [ ] RankingStage beforeunload：已儲存時可正常離開
- [ ] ResultStage beforeunload：永遠顯示警告（因為結果尚未送出）
- [ ] 資料損毀時顯示錯誤 UI + 刪除按鈕
- [ ] 無 Hydration Mismatch 錯誤（檢查瀏覽器 Console）

### **程式碼品質**
- [ ] TypeScript 編譯通過（`npx tsc --noEmit`）
- [ ] ESLint 無錯誤（`npm run lint`）
- [ ] 無 console.error 或 warning

### **效能驗證**
- [ ] Next.js Link 正確 prefetch
- [ ] 頁面載入速度無退化
- [ ] 自動儲存不阻塞 UI

---

## 📚 技術決策記錄

### **為什麼移除 localStorage？**

**原因**：
1. **時間戳比較不可靠**：客戶端/伺服器時間可能不同步
2. **違反單一數據源原則**：localStorage vs 資料庫造成決策複雜
3. **過度設計**：為了挽救 30 秒數據而增加大量複雜邏輯
4. **沒有實際需求**：目前沒有手動恢復、離線支援等功能

**未來如需加回**：
- 可從 git history 恢復 `localDraft.ts`
- 用於離線模式支援
- 用於「手動恢復上次意外關閉的資料」功能

### **為什麼用 Next.js Link 而非 router.push？**

**原因**：
1. **更符合 Next.js 慣例**：官方推薦用 Link 做導航
2. **自動 prefetch**：滑鼠懸停時預載頁面
3. **更好的 SEO**：真正的 `<a>` 標籤
4. **無障礙支援**：右鍵開新分頁、Cmd+點擊等
5. **更簡單**：不需要 Hook、不需要 loading 狀態

### **為什麼用 DraftPrompt 而非 DraftResolver？**

**DraftResolver 的問題**：
1. **useEffect 延遲**：Modal 不會立即顯示，需要等 Client 掛載
2. **Hydration 風險**：Server 渲染 Loading，Client 渲染 Modal
3. **Wrapper Pattern 多餘**：需要 `children` + `hasDraft` props，但 Page 已經知道是否有草稿
4. **依賴 Modal Context**：增加耦合

**DraftPrompt 的優勢**：
1. **直接渲染**：`choice` 狀態直接對應 UI，無 `useEffect`
2. **無 Hydration 問題**：Server 和 Client 初始狀態一致（Modal）
3. **Server Component 條件渲染**：Page 決定渲染 DraftPrompt 或 FilterStage
4. **更簡單**：~70 行 vs ~90 行（DraftResolver + useEffect logic）

### **為什麼加上 CorruptedDraftFallback？**

**問題**：
1. **Server Action in form 無 Loading 狀態**：使用者點擊後畫面凍結，不知道是否正在執行
2. **錯誤處理困難**：如果 `deleteSubmission` 失敗，無法顯示錯誤訊息
3. **違反 Client/Server 分離原則**：互動邏輯（Loading、錯誤處理）應在 Client Component

**CorruptedDraftFallback 的優勢**：
1. **useTransition 處理 Loading**：按鈕顯示「刪除中...」
2. **錯誤處理**：可加上 try-catch 顯示錯誤訊息
3. **平滑的使用者體驗**：transition 追蹤刪除 + 導航，避免突然跳轉
4. **符合 Next.js 最佳實踐**：Server Component 傳 data，Client Component 處理互動

### **為什麼用 Debounce + Max Interval 而非 Throttle？**

**Throttle 的問題**：
1. **停止操作後仍要等待**：使用者點擊後停止 → 最多還要等 3 分鐘才儲存
2. **資料遺失風險高**：瀏覽器崩潰 → 最多損失 3 分鐘數據
3. **不符合直覺**：「自動儲存」應該是「停止操作後儲存」，而非「操作中定期儲存」

**Debounce + Max Interval 的優勢**：
1. **立即回饋**：停止操作 10 秒後立即儲存 → 資料遺失降到 10 秒
2. **最大間隔保證**：連續操作超過 2 分鐘 → 強制儲存 → 避免長時間無備份
3. **更好的 UX**：符合「自動儲存」的預期行為（Word、Google Docs 都是這樣）

**參數選擇**：
- **Debounce**: 10 秒（平衡「即時性」與「避免過度頻繁」）
- **Max Interval**: 2 分鐘（比舊版 3 分鐘更安全，且不會造成過大負載）
- **最差情況**：連續點擊 2 分鐘 → 強制儲存 → 繼續點擊 9 秒後崩潰 → 損失 9 秒數據

**Edge Case**：
- 使用者點擊一次後離開（不關閉分頁）→ 10 秒後自動儲存 → ✅
- 使用者瘋狂點擊 10 分鐘 → 第 2/4/6/8/10 分鐘各觸發一次 → ✅
- 瀏覽器崩潰 → 最多損失 10 秒（debounce 尚未觸發）→ ✅ 可接受

---

### **為什麼用專用 Hook 而非通用 Hook？**

**問題**：
- 只有 Sorter 需要「debounce + max interval」邏輯
- 其他地方用基本的 `useDebounce` / `useThrottle` 就夠了
- 通用 Hook 需要考慮重用性 → 增加抽象層級 → 更複雜

**專用 Hook 的優勢**：
1. **直接整合**：內建 `saveDraft` action 和 `setSaveStatus`，無需外部傳入
2. **型別安全**：直接綁定 `SorterState`，不需要泛型
3. **更簡單**：~80 行 vs 通用版的 ~100 行（含泛型 + 文件）
4. **更好維護**：邏輯集中在 `features/sorter/hooks/`，符合功能內聚原則

**YAGNI 原則**：
- 不為「未來可能的重用」而過度設計
- 如果未來真的需要（例如其他功能也要類似邏輯）→ 屆時再抽象
- 現在保持簡單 → 更容易理解和修改

**檔案位置**：
- ❌ `src/lib/hooks/useDebouncedAutoSave.ts`（通用，需要考慮重用性）
- ✅ `src/features/sorter/hooks/useAutoSave.ts`（專用，直接整合業務邏輯）

---

### **為什麼 beforeunload 基於 saveStatus？**

**原因**：
1. **不需要 localStorage**：狀態已在 SorterContext 中
2. **更準確**：反映真實的儲存狀態（`"idle" | "pending" | "saved" | "failed"`）
3. **更簡單**：不需要比較時間戳或 React state vs localStorage

**Edge Case 處理**：
- 使用者剛載入頁面，`saveStatus === "idle"` → **會觸發警告**（Bug）
- **已修正**：在 useSorter 初始化時將 `saveStatus` 設為 `"saved"`（見 Line 978-985）

---

## 🚀 實施順序建議

**建議按照 Phase 順序執行**，每個 Phase 完成後執行測試：

1. **Phase 1** → 刪除檔案 → 執行 `tsc --noEmit` 確認型別錯誤位置
2. **Phase 2** → 修復 CreateRankingButton → 測試導航是否正常（`npm run dev`）
3. **Phase 3** → 建立 DraftPrompt → 手動測試 Modal 顯示（無 `useEffect` 延遲）
4. **Phase 4** → 整合到 Page → 測試完整流程：
   - 無草稿 → FilterStage / 自動建立
   - 有草稿 → Modal 詢問
   - 資料損毀 → 錯誤 UI + 刪除按鈕
5. **Phase 5** → 清理 useSorter + 新增 useAutoSave → 測試排名遊戲 + 自動儲存（10 秒 debounce + 2 分鐘 max interval）
6. **Phase 6** → 實作 beforeunload → 測試關閉頁面警告（Chrome、Safari、Firefox）

---

## 💡 後續優化（可選）

完成基本重構後，未來可考慮：

1. **錯誤恢復機制**
   - 如果資料庫儲存失敗 → 顯示錯誤訊息
   - 提供「重試」按鈕

2. **離線支援**
   - 偵測網路狀態
   - 離線時暫存到 localStorage
   - 重新連線後同步

3. **手動儲存按鈕**
   - 讓使用者主動觸發儲存
   - 顯示「上次儲存時間」

4. **樂觀更新 UI**
   - 儲存成功後顯示 Toast 通知
   - 儲存失敗後顯示錯誤提示

---

## 📖 參考資料

### **設計原則**
- **Single Source of Truth**：資料庫是唯一真實來源
- **YAGNI**：不為未來可能的需求過度設計
- **Simplicity**：簡單的解決方案勝過完美但複雜的方案

### **Next.js 最佳實踐**
- [Next.js Link](https://nextjs.org/docs/app/api-reference/components/link)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

### **React Patterns**
- [beforeunload Event](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)
- [useEffect Cleanup](https://react.dev/reference/react/useEffect#cleanup-function)

---

**文件版本**：v2.5
**最後更新**：2025-10-06
**狀態**：待執行

---

## 📋 修訂記錄

### v2.5 (2025-10-06)
- **改用 Debounce + Max Interval**：
  - 新增專用 `useAutoSave` Hook（`features/sorter/hooks/`）
  - 停止點擊 10 秒後自動儲存（取代 throttle 的「定期儲存」）
  - 連續操作超過 2 分鐘強制儲存
  - 資料遺失風險從「最多 3 分鐘」降到「最多 10 秒」
- **簡化 useSorter.ts**：移除 43 行 `autoSave` 函數，改用 Hook
- **專用而非通用**：不考慮重用性，直接整合 `saveDraft` 和 `setSaveStatus`
- **新增技術決策**：解釋為什麼用 Debounce + 為什麼用專用 Hook
- **更新所有相關章節**：影響範圍、預期成果、驗證清單、實施順序

### v2.4 (2025-10-06)
- **回溯 useTransition 修正**（感謝 React 官方文件澄清）：
  - `startTransition` **可以包裹 async 回呼**
  - DraftPrompt: `startTransition(async () => { await deleteSubmission(); router.refresh(); })`
  - CorruptedDraftFallback: `startTransition(async () => { await deleteSubmission(); router.push(); })`
  - `router.refresh()` / `router.push()` 觸發的更新會被 transition 追蹤
  - `isPending` 正確反映整個流程（刪除 + 導航）

### v2.3 (2025-10-06) - **已廢棄**
- ~~修正 useTransition 使用方式~~（誤解了 React 文件，已在 v2.4 回溯）
- **修正 saveStatus 初始化**：改用 `useState` 初始化時判斷 `initialState ? "saved" : "idle"`
- **修正 Album Sorter 註解**：「自動建立 + redirect」→「自動建立 + 賦值並繼續執行」
- **補充 checkDraft 清理時程**：保留時加上 `@deprecated` JSDoc
- **補充 ResultStage 說明**：Submit 成功後自動 unmount，不需檢查提交狀態

### v2.2 (2025-10-05)
- **元件更名**：`CorruptedDraftUI` → `CorruptedDraftFallback`（語意更明確）
- **簡化 ResultStage**：移除自動儲存機制，只保留 beforeunload 警告
- **新增 Phase 6.2**：ResultStage 永遠顯示 beforeunload 警告

### v2.1 (2025-10-05)
- **修正 Album Sorter 死循環風險**：移除 redirect，改為賦值給 submission 並繼續執行
- **加強錯誤處理**：新增 `CorruptedDraftFallback` 元件處理資料損毀情況
- **修正 beforeunload bug**：在 useSorter 初始化時設定 `saveStatus = "saved"`
- **新增技術決策**：解釋為什麼需要 CorruptedDraftFallback

### v2.0 (2025-10-05)
- 初始版本
