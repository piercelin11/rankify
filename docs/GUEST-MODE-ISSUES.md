# Guest 模式待修復問題 - AI 執行指南

> **文件目的**: 提供 AI 可直接執行的問題分析與修復方案
> **最後更新**: 2026-01-04
> **狀態**: 3 個 Critical Bug 待修復

---

## 一、快速導航

### 1.1 問題清單

| ID | 問題 | 嚴重性 | 影響範圍 | 狀態 |
|----|------|--------|----------|------|
| P0-1 | 排名完成後需要手動重新整理 | 🔴 Critical | [useSorter.ts:354](#useSorterts354), [GuestSorterLoader.tsx:51](#GuestSorterLoadertsx51) | ❌ 未修復 |
| P0-2 | 登入後無法自動遷移 Guest 資料 | 🔴 Critical | [page.tsx:59-67](#pagetsx59-67) | ❌ 未修復 |
| P1-3 | beforeunload 警告不一致 | 🟡 Medium | [RankingStage.tsx:139](#RankingStagetsx139), [ResultStage.tsx:115](#ResultStagetsx115) | ❌ 未修復 |

### 1.2 關鍵檔案清單

**核心問題檔案**:
- `src/features/sorter/hooks/useSorter.ts` (line 332-361) - LocalStorage 寫入邏輯
- `src/features/sorter/components/GuestSorterLoader.tsx` (line 30-51) - useEffect 依賴與過期檢查
- `src/app/sorter/album/[albumId]/page.tsx` (line 34-67) - isGuest 分支邏輯

**相關元件**:
- `src/features/sorter/components/RankingStage.tsx` (line 136-147) - beforeunload 警告
- `src/features/sorter/components/ResultStage.tsx` (line 113-122) - beforeunload 警告
- `src/features/sorter/components/MigrationHandler.tsx` - 資料遷移邏輯

### 1.3 資料結構 Schema

```typescript
// src/types/guest.ts
export type GuestResultData = {
  albumId: string;
  artistId: string;
  resultState: {
    rankedList: string[];  // trackId 陣列
    completedAt: number;   // 完成時間戳
  };
  tracks: TrackData[];     // 用於渲染與匯入
  expiresAt: number;       // 過期時間戳 (24 小時後)
};

// LocalStorage Key 格式
const key = `rankify_guest_result_${albumId}`;
```

---

## 二、訪客流程完整說明

### 2.1 狀態機圖 (7 個步驟)

```
┌─────────────────────────────────────────────────────────┐
│ 1. Guest 進入排序器                                        │
│    /sorter/album/[albumId] (不再 requireSession)         │
│    - GuestSorterLoader 檢查 LocalStorage                │
│    - 如果有已完成的資料 → 顯示 ResultStage                │
│    - 如果沒有 → 顯示 RankingStage                         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 2. 開始對決 (RankingStage)                                │
│    - useSorter hook 使用物件策略模式                      │
│    - GuestSaveStrategy: 不自動儲存,不呼叫 API             │
│    - 對決進行中不存 LocalStorage                          │
└─────────────────────────────────────────────────────────┘
                           ↓
           ┌───────────────┴───────────────┐
           │                               │
      Guest 離開                      完成對決
           │                               ↓
           ↓                   ┌───────────────────────┐
   顯示警告確認對話框           │ 3. 進入 ResultStage     │
   「你的進度不會被保存」        │    finishFlag === 1     │
   [取消] [離開]                │    自動存 LocalStorage   │
                               │    (帶 24 小時過期時間)  │
                               └───────────────────────┘
                                          ↓
                               ┌───────────────────────┐
                               │ 4. 顯示最終排名          │
                               │    - 可拖曳微調          │
                               │    - [分享圖片] 按鈕    │
                               │    - [儲存排名] 按鈕    │
                               └───────────────────────┘
                                          ↓
                           Guest 點擊「儲存排名」
                                          ↓
                               ┌───────────────────────┐
                               │ 5. Auth Guard Modal   │
                               │    callbackUrl:       │
                               │    /sorter/album/xxx  │
                               │    ?migrate=true      │
                               └───────────────────────┘
                                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. 登入成功後跳轉回排序器頁面                              │
│    - GuestSorterLoader 檢查 LocalStorage                │
│    - 渲染 MigrationHandler (背景處理)                    │
│    - 同時渲染 ResultStage (顯示結果)                      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 7. MigrationHandler (Client Component)                  │
│    - useEffect 自動執行 (不顯示 Modal)                    │
│    - 檢查 LocalStorage 是否過期                          │
│    - 呼叫 createCompletedSubmission Server Action       │
└─────────────────────────────────────────────────────────┘
                           ↓
           ┌───────────────┴───────────────┐
           │                               │
         成功                             失敗
           ↓                               ↓
   清除 LocalStorage              保留 LocalStorage
   Toast: 「排名已保存!」         Toast: 「保存失敗,請重新整理頁面重試」
   Redirect 到                    (使用者重新整理 → 自動重試)
   /artist/[artistId]
```

### 2.2 React State 與 LocalStorage 同步斷層分析

**問題**: useSorter 寫入 LocalStorage 後,GuestSorterLoader 不知道要更新狀態

```
useSorter (RankingStage 內部)
    ↓ finishFlag === 1
localStorage.setItem(...)  // ✅ LocalStorage 已更新
    ↓ (沒有觸發任何事件)

GuestSorterLoader (Parent Component)
    ↓ useEffect(() => {...}, [albumId])
    ↓ albumId 沒變化,不會重新執行

guestData state 永遠是 null
    ↓
RankingStage 繼續渲染 (finishFlag=1, 對決結束但頁面卡住)
```

**為何子組件無法觸發父組件 re-render?**
- useSorter 在 RankingStage (子組件) 內部執行
- GuestSorterLoader 是 Parent Component
- React 單向資料流: 子組件無法直接修改父組件的 state
- 如果用 Context 或 callback,需要重構整個元件樹

### 2.3 isGuest 分支邏輯圖

```
page.tsx: const isGuest = !user
    │
    ├─ isGuest = true (Guest 模式)
    │      ↓
    │  return <GuestSorterLoader>
    │           {shouldMigrate && <MigrationHandler />}
    │           {guestData ? <ResultStage /> : <RankingStage />}
    │         </GuestSorterLoader>
    │  ✅ 有 MigrationHandler 邏輯
    │
    └─ isGuest = false (User 模式)
           ↓
       line 59-151: User 分支邏輯
           const submission = await getIncompleteRankingSubmission(...)
           ↓ ❌ 沒有檢查 searchParams.get("migrate")
           ↓ ❌ 沒有讀取 LocalStorage
           ↓ ❌ 沒有渲染 MigrationHandler
       return <DraftPrompt />
```

### 2.4 LocalStorage 儲存與清除規則

| 場景 | 清除? | 時機 | 程式碼位置 |
|------|------|------|-----------|
| Guest 完成排名 → 登入成功匯入 | ✅ 清除 | `MigrationHandler` 匯入成功後 | MigrationHandler.tsx:62 |
| Guest 完成排名 → 匯入失敗 | ❌ 保留 | 等重新整理重試 | MigrationHandler.tsx:71 |
| Guest 完成排名 → 重新整理頁面 | ❌ 保留 | 載入資料,顯示結果頁 | GuestSorterLoader.tsx:42 |
| Guest 完成排名 → 離開頁面 | ❌ 保留 | 24 小時內可回來 | 無 beforeunload 清除 |
| Guest 回到頁面 → 資料超過 24 小時 | ✅ 清除 | `GuestSorterLoader` 檢查時 | GuestSorterLoader.tsx:39-40 |

---

## 三、問題 1: 排名完成後需要手動重新整理

### 3.1 現象描述

- Guest 完成排名 (100%) 後,頁面卡住不動
- 資料已成功存入 LocalStorage
- 但頁面沒有自動切換到 ResultStage
- 需要手動重新整理 (F5) 才能看到結果

### 3.2 根本原因分析

**資料流斷層** (4 個步驟):

```
Step 1: useSorter.ts:351-354 寫入 LocalStorage
  localStorage.setItem(`rankify_guest_result_${albumId}`, JSON.stringify(guestData));
    ↓ (沒有任何機制通知 React)

Step 2: GuestSorterLoader.tsx:30-51 的 useEffect
  useEffect(() => {
    const rawData = localStorage.getItem(key);
    if (rawData) { setGuestData(data); }
  }, [albumId]);  // ← 依賴只有 albumId
    ↓ albumId 沒變化,不會重新執行

Step 3: guestData state 永遠是 null
  if (guestData && guestData.resultState.completedAt) {
    return <ResultStage />  ← 永遠不會進入這個分支
  }
    ↓
Step 4: 繼續渲染 RankingStage (finishFlag=1, 對決結束)
```

**現有程式碼**:

```typescript
// src/features/sorter/hooks/useSorter.ts:332-361
if (newState.finishFlag === 1) {
  if (isGuest) {
    // Guest 模式：儲存到 LocalStorage
    const rankedList = newState.namMember.map((trackName) => {
      const track = tracks.find((t) => t.name === trackName);
      return track?.id || "";
    }).filter(Boolean);

    const guestData = {
      albumId: _albumId || "",
      artistId: _artistId || "",
      resultState: {
        rankedList,
        completedAt: Date.now(),
      },
      tracks,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 小時後過期
    };

    localStorage.setItem(
      `rankify_guest_result_${_albumId}`,
      JSON.stringify(guestData)
    );
    // ❌ 沒有後續動作,頁面卡住
  } else if (submissionId) {
    // User 模式：呼叫 server action
    finalizeDraft(newState, submissionId);
  }
}
```

### 3.3 解決方案: 使用 `window.location.reload()`

**修改位置**: `src/features/sorter/hooks/useSorter.ts:354`

**為何選擇 reload 而非 React State?**
- Guest 模式不需要保留編輯中的狀態 (不像 User 模式的草稿)
- reload 會重新執行 GuestSorterLoader.useEffect
- 簡單、可靠,符合 Linus 的「好品味」原則
- 避免重構整個元件樹 (不需要 Context 或 callback)

**修改前**:
```typescript
localStorage.setItem(
  `rankify_guest_result_${_albumId}`,
  JSON.stringify(guestData)
);
// ❌ 沒有後續動作,頁面卡住
```

**修改後**:
```typescript
localStorage.setItem(
  `rankify_guest_result_${_albumId}`,
  JSON.stringify(guestData)
);

// ✅ 觸發 reload,讓 GuestSorterLoader 重新讀取 LocalStorage
window.location.reload();
```

**完整程式碼** (修改後的 line 332-361):
```typescript
if (newState.finishFlag === 1) {
  if (isGuest) {
    // Guest 模式：儲存到 LocalStorage
    const rankedList = newState.namMember.map((trackName) => {
      const track = tracks.find((t) => t.name === trackName);
      return track?.id || "";
    }).filter(Boolean);

    const guestData = {
      albumId: _albumId || "",
      artistId: _artistId || "",
      resultState: {
        rankedList,
        completedAt: Date.now(),
      },
      tracks,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    localStorage.setItem(
      `rankify_guest_result_${_albumId}`,
      JSON.stringify(guestData)
    );

    // ✅ 新增: 觸發頁面 reload
    window.location.reload();
  } else if (submissionId) {
    // User 模式：呼叫 server action
    finalizeDraft(newState, submissionId);
  }
}
```

### 3.4 預期行為

- Guest 完成對決 (finishFlag === 1)
- LocalStorage 寫入成功
- **頁面自動 reload**
- GuestSorterLoader.useEffect 重新執行
- 讀取 LocalStorage,設定 guestData state
- 自動渲染 ResultStage (顯示最終排名)

---

## 四、問題 2: 登入後無法自動遷移 Guest 資料

### 4.1 現象描述

- Guest 完成排名後點擊「Login to Save」
- 登入/註冊成功後跳轉回 `/sorter/album/[albumId]?migrate=true`
- LocalStorage 中的資料沒有被遷移到資料庫
- 使用者需要重新開始排名

### 4.2 根本原因分析

**分支邏輯問題**:

```
登入前: isGuest = true
  ↓ 進入 Guest 分支 (page.tsx:34-57)
  ↓ 渲染 GuestSorterLoader
  ↓ ✅ GuestSorterLoader 會檢查 shouldMigrate
  ↓ ✅ shouldMigrate && <MigrationHandler />

登入後: isGuest = false
  ↓ 進入 User 分支 (page.tsx:59-151)
  ↓ const submission = await getIncompleteRankingSubmission(...)
  ↓ ❌ 完全沒有檢查 migrate 參數
  ↓ ❌ 完全沒有檢查 LocalStorage
  ↓ ❌ MigrationHandler 從未被掛載
  ↓ 渲染 DraftPrompt (顯示空白草稿)
```

**現有程式碼** (page.tsx:34-67):

```typescript
// Guest 分支 (✅ 有 MigrationHandler)
if (isGuest) {
  const initialState = initializeSorterState(tracks);
  return (
    <GuestSorterLoader
      albumId={albumId}
      artistId={album.artistId}
      tracks={tracks}
      initialState={initialState}
    />
  );
  // ✅ GuestSorterLoader 內部會檢查 shouldMigrate 並渲染 MigrationHandler
}

// User 分支 (❌ 沒有檢查 migrate)
const userId = user.id;
const submission = await getIncompleteRankingSubmission({
  artistId: album.artistId,
  userId,
  type: "ALBUM",
  albumId,
});
// ❌ 直接查詢 submission,不管 migrate 參數
// ❌ 不會檢查 LocalStorage
// ❌ 不會渲染 MigrationHandler
```

### 4.3 解決方案: User 分支也要檢查 migrate 參數

**修改位置**: `src/app/sorter/album/[albumId]/page.tsx:60-67`

**修改前**:
```typescript
// User 模式
const userId = user.id;
const submission = await getIncompleteRankingSubmission({
  artistId: album.artistId,
  userId,
  type: "ALBUM",
  albumId,
});
// ❌ 直接查詢 submission,不管 migrate 參數
```

**修改後**:
```typescript
// User 模式
const userId = user.id;

// ✅ 檢查是否需要遷移 Guest 資料
const shouldMigrate = searchParams?.migrate === "true";

if (shouldMigrate) {
  // ✅ 渲染 Client Component 處理遷移 + 顯示結果
  return (
    <Suspense fallback={<div>載入中...</div>}>
      <GuestMigrationHandler
        albumId={albumId}
        artistId={album.artistId}
        tracks={tracks}
      />
    </Suspense>
  );
}

const submission = await getIncompleteRankingSubmission({
  artistId: album.artistId,
  userId,
  type: "ALBUM",
  albumId,
});
// ... 原本的邏輯
```

**需要新增的 Client Component**: `src/features/sorter/components/GuestMigrationHandler.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCompletedSubmission } from '@/features/sorter/actions/createCompletedSubmission';
import { GuestResultData } from '@/types/guest';
import { ResultStage } from './ResultStage';
import { useToast } from '@/hooks/use-toast';

export function GuestMigrationHandler({
  albumId,
  artistId,
  tracks,
}: {
  albumId: string;
  artistId: string;
  tracks: TrackData[];
}) {
  const [guestData, setGuestData] = useState<GuestResultData | null>(null);
  const [isMigrating, setIsMigrating] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const migrate = async () => {
      const key = `rankify_guest_result_${albumId}`;
      const rawData = localStorage.getItem(key);

      if (!rawData) {
        // 沒有資料,跳轉到正常流程
        router.push(`/sorter/album/${albumId}`);
        return;
      }

      try {
        const data = JSON.parse(rawData) as GuestResultData;

        // 檢查是否過期
        if (Date.now() > data.expiresAt) {
          localStorage.removeItem(key);
          router.push(`/sorter/album/${albumId}`);
          return;
        }

        // 設定 guestData (用於渲染 ResultStage)
        setGuestData(data);

        // 呼叫 Server Action 匯入資料
        const result = await createCompletedSubmission({
          albumId,
          artistId,
          rankedList: data.resultState.rankedList,
          tracks: data.tracks,
        });

        if (result.success) {
          // 成功: 清除 LocalStorage
          localStorage.removeItem(key);
          toast({
            title: '排名已保存!',
            description: '正在跳轉至歌手頁面...',
          });
          setTimeout(() => {
            router.push(`/artist/${artistId}`);
          }, 1500);
        } else {
          // 失敗: 保留 LocalStorage
          toast({
            title: '保存失敗',
            description: '請重新整理頁面重試',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Migration failed:', error);
        toast({
          title: '網路錯誤',
          description: '請重新整理頁面重試',
          variant: 'destructive',
        });
      } finally {
        setIsMigrating(false);
      }
    };

    migrate();
  }, [albumId, artistId, router, toast]);

  if (isMigrating || !guestData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>正在保存您的排名...</p>
      </div>
    );
  }

  // 顯示結果 (同時進行背景遷移)
  return (
    <ResultStage
      isGuest={false}  // 已登入,顯示為 User 模式
      albumId={albumId}
      artistId={artistId}
      tracks={tracks}
      initialRankedList={guestData.resultState.rankedList}
    />
  );
}
```

### 4.4 預期行為

- Guest 點擊「Login to Save」
- 登入成功後跳轉回 `/sorter/album/[albumId]?migrate=true`
- **User 分支檢查到 migrate=true**
- **渲染 GuestMigrationHandler**
- 背景自動執行遷移 (呼叫 createCompletedSubmission)
- 成功後清除 LocalStorage,跳轉至 `/artist/[artistId]`

---

## 五、問題 3: beforeunload 警告不一致

### 5.1 現象描述

- Guest 完成排名 (100%) 且資料已存入 LocalStorage
- 重新整理時仍然跳出「尚未儲存」警告
- 但實際上資料已經儲存在 LocalStorage 中

### 5.2 根本原因分析

**策略模式的副作用**:

```typescript
// useSorter.ts:206 - Guest 模式不自動儲存
const saveStrategy = isGuest
  ? { save: () => {}, saveStatus: "idle" }  // ← saveStatus 永遠是 "idle"
  : new UserSaveStrategy(submissionId!, saveDraft);
```

**RankingStage 的警告邏輯** (line 136-147):
```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    // 如果有未儲存的變更，顯示警告
    if (saveStatus !== "saved") {  // ← Guest 永遠是 "idle"
      e.preventDefault();
      e.returnValue = '';  // ✅ 觸發警告
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [saveStatus]);
```

**ResultStage 的警告邏輯** (line 113-122):
```typescript
// beforeunload 警告：ResultStage 永遠顯示警告（因為結果尚未送出）
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();  // ❌ Guest 也會觸發
    e.returnValue = '';
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, []);
```

### 5.3 解決方案: 分離 Guest 與 User 的警告邏輯

**修改 1**: `src/features/sorter/components/RankingStage.tsx:139`

```typescript
// 修改前
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (saveStatus !== "saved") {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  // ...
}, [saveStatus]);

// 修改後
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    // Guest 模式: 不顯示警告 (對決進行中離開也不會遺失資料,因為不保存)
    // User 模式: 只在 saveStatus !== "saved" 時警告
    if (!isGuest && saveStatus !== "saved") {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isGuest, saveStatus]);
```

**修改 2**: `src/features/sorter/components/ResultStage.tsx:115`

```typescript
// 修改前
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();  // ❌ Guest 也會觸發
    e.returnValue = '';
  };
  // ...
}, []);

// 修改後
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    // User 模式: 永遠警告 (因為結果尚未送出)
    // Guest 模式: 不警告 (資料已存 LocalStorage,24 小時內可回來)
    if (!isGuest) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isGuest]);
```

### 5.4 預期行為

**Guest 模式**:
- 對決進行中離開: 不顯示警告 (反正不會保存進度)
- 對決完成後離開: 不顯示警告 (資料已存 LocalStorage)

**User 模式**:
- 對決進行中離開: 顯示警告 (saveStatus !== "saved")
- 對決完成後離開: 顯示警告 (結果尚未送出)

---

## 六、關鍵程式碼片段

### 6.1 useSorter.ts: finishFlag 判斷邏輯

**位置**: `src/features/sorter/hooks/useSorter.ts:332-361`

```typescript
if (newState.finishFlag === 1) {
  if (isGuest) {
    // Guest 模式：儲存到 LocalStorage
    const rankedList = newState.namMember.map((trackName) => {
      const track = tracks.find((t) => t.name === trackName);
      return track?.id || "";
    }).filter(Boolean);

    const guestData = {
      albumId: _albumId || "",
      artistId: _artistId || "",
      resultState: {
        rankedList,
        completedAt: Date.now(),
      },
      tracks,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 小時後過期
    };

    localStorage.setItem(
      `rankify_guest_result_${_albumId}`,
      JSON.stringify(guestData)
    );
  } else if (submissionId) {
    // User 模式：呼叫 server action
    finalizeDraft(newState, submissionId);
  }
} else {
  // 未完成：觸發自動儲存 (Guest 模式下不觸發)
  if (!isGuest) {
    // User auto-save logic
  }
}
```

### 6.2 GuestSorterLoader.tsx: useEffect 依賴分析

**位置**: `src/features/sorter/components/GuestSorterLoader.tsx:30-51`

```typescript
useEffect(() => {
  const key = `rankify_guest_result_${albumId}`;
  const rawData = localStorage.getItem(key);

  if (rawData) {
    try {
      const data = JSON.parse(rawData) as GuestResultData;

      // 檢查是否過期
      if (Date.now() > data.expiresAt) {
        localStorage.removeItem(key);
      } else {
        setGuestData(data);
      }
    } catch (error) {
      console.error("Failed to parse guest data:", error);
      localStorage.removeItem(key);
    }
  }

  setIsLoading(false);
}, [albumId]);  // ← 依賴只有 albumId,不會因 LocalStorage 變化而重新執行
```

**問題**: LocalStorage 更新後,useEffect 不會重新執行 (因為 albumId 沒變)

### 6.3 page.tsx: isGuest 分支邏輯

**位置**: `src/app/sorter/album/[albumId]/page.tsx:34-67`

```typescript
if (isGuest) {
  if (tracks.length === 0) {
    return <div>此專輯無歌曲資料</div>;
  }

  // 直接使用 initializeSorterState 建立初始狀態
  const initialState = initializeSorterState(tracks);

  return (
    <GuestSorterLoader
      albumId={albumId}
      artistId={album.artistId}
      tracks={tracks}
      initialState={initialState}
    />
  );
}

// User 模式
const userId = user.id;
const submission = await getIncompleteRankingSubmission({
  artistId: album.artistId,
  userId,
  type: "ALBUM",
  albumId,
});
// ❌ 沒有檢查 migrate 參數
```

### 6.4 MigrationHandler.tsx: 自動匯入邏輯

**位置**: `src/features/sorter/components/MigrationHandler.tsx:22-79`

```typescript
useEffect(() => {
  const processMigration = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const key = `rankify_guest_result_${albumId}`;
    const rawData = localStorage.getItem(key);

    if (!rawData) {
      setIsProcessing(false);
      return;
    }

    try {
      const data = JSON.parse(rawData) as GuestResultData;

      // 檢查是否過期
      if (Date.now() > data.expiresAt) {
        localStorage.removeItem(key);
        setIsProcessing(false);
        return;
      }

      // 直接匯入 (不顯示確認 Modal)
      const result = await createCompletedSubmission({
        albumId,
        artistId,
        rankedList: data.resultState.rankedList,
        tracks: data.tracks,
      });

      if (result.success) {
        localStorage.removeItem(key);
        toast({
          title: "排名已保存!",
          description: "正在跳轉至歌手頁面...",
          variant: "default",
        });
        router.push(`/artist/${artistId}`);
      } else {
        toast({
          title: "保存失敗",
          description: "請重新整理頁面重試",
          variant: "destructive",
        });
        // 保留 LocalStorage (使用者可重試)
      }
    } catch (error) {
      console.error("Migration failed:", error);
      toast({
        title: "網路錯誤",
        description: "請重新整理頁面重試",
        variant: "destructive",
      });
      // 保留 LocalStorage 資料
    } finally {
      setIsProcessing(false);
    }
  };

  processMigration();
}, [albumId, artistId, isProcessing, toast, router]);
```

---

## 七、驗證清單

### 7.1 問題 1: 排名完成後自動跳轉

**測試步驟**:
1. 以訪客身分進入排序器 `/sorter/album/[albumId]`
2. 完成所有對決 (進度達到 100%)
3. 觀察頁面是否自動 reload 並顯示 ResultStage

**預期行為**:
- ✅ 完成對決後,頁面自動 reload
- ✅ 自動顯示 ResultStage (最終排名)
- ✅ LocalStorage 包含完整的 GuestResultData

**Rollback 策略**:
- 移除 `window.location.reload()` 那一行
- 恢復原本的程式碼 (只有 `localStorage.setItem(...)`)

### 7.2 問題 2: 登入後自動遷移

**測試步驟**:
1. 以訪客身分完成排名
2. 點擊「Login to Save」
3. 登入/註冊成功
4. 觀察是否自動遷移資料並跳轉

**預期行為**:
- ✅ 登入後跳轉回 `/sorter/album/[albumId]?migrate=true`
- ✅ 自動執行 createCompletedSubmission
- ✅ 成功後清除 LocalStorage
- ✅ 跳轉至 `/artist/[artistId]`
- ✅ 在歌手頁面可以看到新完成的排名

**Rollback 策略**:
- 移除 `shouldMigrate` 檢查邏輯
- 移除 `GuestMigrationHandler` 元件
- 恢復原本的 User 分支邏輯

### 7.3 問題 3: beforeunload 警告

**測試步驟**:
1. 以訪客身分完成排名 (進入 ResultStage)
2. 按 F5 重新整理
3. 觀察是否跳出警告

**預期行為**:
- ✅ Guest 模式: 不跳出警告 (資料已存 LocalStorage)
- ✅ User 模式: 跳出警告 (結果尚未送出)

**Rollback 策略**:
- 移除 `if (!isGuest)` 條件判斷
- 恢復原本的 beforeunload 邏輯

---

## 附錄: 相關檔案完整路徑

- `src/features/sorter/hooks/useSorter.ts`
- `src/features/sorter/components/GuestSorterLoader.tsx`
- `src/features/sorter/components/MigrationHandler.tsx`
- `src/features/sorter/components/RankingStage.tsx`
- `src/features/sorter/components/ResultStage.tsx`
- `src/app/sorter/album/[albumId]/page.tsx`
- `src/features/sorter/actions/createCompletedSubmission.ts`
- `src/types/guest.ts`
- `docs/PLAN.md` (參考訪客流程設計)
