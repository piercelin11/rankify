# Guest Mode 訪客模式優化計劃 v2

> **目標**:
> 1. 移除 `window.location.reload()` 改用 React 狀態更新
> 2. 新增獨立 `/migration` 頁面並提供即時進度反饋
> 3. 修正 Quit 按鈕邏輯與重新整理警告問題
>
> **建立日期**: 2026-01-09
> **狀態**: Ready to Execute
> **預計執行時間**: 2-2.5 天
> **影響範圍**: 10 個檔案修改 + 3 個新增檔案

---

## 【核心判斷】🟢 好品味 - 消除不必要的 reload + 完善使用者體驗

### 核心問題分析

**設計問題** 🔴:

1. **`window.location.reload()` 不符合 SPA 設計**:
   - GuestStorage.finalize() 使用 reload 切換到 ResultStage
   - 破壞 React 狀態管理原則
   - 觸發 beforeunload 事件導致警告攔截

2. **MigrationHandler 缺少 UI 反饋**:
   - 批量匯入在背景執行,使用者不知道發生什麼
   - 只有 Toast 通知,無法展示即時進度
   - 錯誤處理不友善 (只能「重新整理重試」)

3. **RankingStage Quit 按鈕邏輯混亂**:
   - Guest 點 Save → 呼叫空函式 (無效操作)
   - Guest 點 Quit → 觸發 AuthGuard (使用者困惑)

4. **ResultStage 缺少操作引導**:
   - Guest 完成後想重新排名 → 需手動清除 LocalStorage
   - Guest 想回首頁 → Quit 按鈕行為不明確

---

## 一、設計方案總覽

### 1.1 核心架構改動

#### 改動 1: GuestStorage 狀態驅動設計

**Before** (reload 方式):
```typescript
finalize() {
  localStorage.setItem(...);
  window.location.reload();  // ❌ 強制重載整個頁面
}
```

**After** (狀態更新):
```typescript
finalize(state, tracks, onComplete) {
  const guestData = { ... };
  localStorage.setItem(...);
  onComplete?.(guestData);   // ✅ 觸發 React 狀態更新
}
```

#### 改動 2: 新增 `/migration` 專屬頁面

**目的**: 提供批量匯入的即時進度與錯誤處理 UI

**路由**: `/migration`

**功能**:
- 顯示「正在匯入排名...」載入畫面
- 即時進度條 (例如: "已匯入 1/3 張專輯")
- 成功後顯示結果清單 + [前往首頁] 按鈕
- 失敗時顯示錯誤清單 + [重試] 按鈕

---

### 1.2 優先級分類

| 項目 | 優先級 | 類型 | 理由 |
|-----|--------|------|------|
| 1. 移除 reload,改用狀態更新 | P0 | 架構改進 | 解決 beforeunload 攔截問題 |
| 2. 新增 /migration 頁面 | P0 | 功能缺失 | 改善批量匯入體驗 |
| 3. 修正 RankingStage Quit 邏輯 | P0 | Bug | 功能完全無效 |
| 4. ResultStage 新增重新排名按鈕 | P1 | UX | 提升操作便利性 |
| 5. DatabaseStorage 改名 UserStorage | P2 | 命名 | 提升可讀性 |
| 6. ESLint Warning 修正 | P3 | 程式碼品質 | 消除警告 |

---

## 二、詳細實作規格

### 2.1 移除 `window.location.reload()` 改用狀態更新

#### 檔案: `src/features/sorter/storage/GuestStorage.ts`

**問題**:
- `finalize()` 使用 `window.location.reload()` 觸發 beforeunload 事件
- 導致 RankingStage 的 beforeunload handler 攔截 reload

**解決方案**: 透過 callback 通知 GuestSorterEntry 更新狀態

```typescript
// GuestStorage.ts (修改)
export class GuestStorage implements StorageStrategy {
  private onFinalize?: (data: GuestResultData) => void;

  constructor(
    albumId: string,
    artistId: string,
    showAuthGuard: (params: { callbackUrl: string }) => void,
    onFinalize?: (data: GuestResultData) => void  // ← 新增參數
  ) {
    this.albumId = albumId;
    this.artistId = artistId;
    this.showAuthGuard = showAuthGuard;
    this.onFinalize = onFinalize;  // ← 儲存 callback
  }

  async finalize(state: SorterStateType, tracks: TrackData[]): Promise<void> {
    // 從 state.namMember 生成 trackId 陣列
    const rankedList = state.namMember
      .map((trackName) => tracks.find((t) => t.name === trackName)?.id || "")
      .filter(Boolean);

    // 建立 Guest 結果資料
    const guestData: GuestResultData = {
      albumId: this.albumId,
      artistId: this.artistId,
      resultState: {
        rankedList,
        completedAt: Date.now(),
      },
      tracks,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 小時後過期
    };

    // 寫入 LocalStorage
    localStorage.setItem(
      `rankify_guest_result_${this.albumId}`,
      JSON.stringify(guestData)
    );

    // ✅ 觸發狀態更新 (不需要 reload!)
    this.onFinalize?.(guestData);
  }

  // submitResult 改為導向 /migration 頁面
  async submitResult(_result: RankingResultData[]): Promise<void> {
    this.showAuthGuard({
      callbackUrl: `/migration`,  // ← 改為 /migration
    });
  }
}
```

---

#### 檔案: `src/features/sorter/components/GuestSorterEntry.tsx`

**修改**: 提供 `onFinalize` callback 給 GuestStorage

```typescript
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { GuestResultData } from "@/types/guest";
import ResultStage from "./ResultStage";
import RankingStage from "./RankingStage";
import { SorterStateType } from "@/lib/schemas/sorter";
import { TrackData } from "@/types/data";
import { GuestStorage } from "../storage/GuestStorage";
import { useModal } from "@/contexts";

type GuestSorterEntryProps = {
  albumId: string;
  artistId: string;
  tracks: TrackData[];
  initialState: SorterStateType;
};

export default function GuestSorterEntry({
  albumId,
  artistId,
  tracks,
  initialState,
}: GuestSorterEntryProps) {
  const [guestData, setGuestData] = useState<GuestResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showAuthGuard } = useModal();

  // ✅ 提供 callback 給 GuestStorage (finalize 完成時更新狀態)
  const handleFinalize = useCallback((data: GuestResultData) => {
    setGuestData(data);
  }, []);

  // ✅ 建立 GuestStorage 實例 (傳入 callback)
  const storage = useMemo(
    () => new GuestStorage(albumId, artistId, showAuthGuard, handleFinalize),
    [albumId, artistId, showAuthGuard, handleFinalize]
  );

  useEffect(() => {
    const key = `rankify_guest_result_${albumId}`;
    const rawData = localStorage.getItem(key);

    if (rawData) {
      try {
        const data = JSON.parse(rawData) as GuestResultData;

        // 檢查是否過期 (24 小時)
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
  }, [albumId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>載入中...</p>
      </div>
    );
  }

  // Guest 已完成排名 → 顯示結果頁
  if (guestData && guestData.resultState.completedAt) {
    return (
      <ResultStage
        tracks={tracks}
        storage={storage}
        initialRankedList={guestData.resultState.rankedList}
        albumId={albumId}
      />
    );
  }

  // Guest 尚未完成 → 顯示排序器
  return (
    <RankingStage
      tracks={tracks}
      storage={storage}
      initialState={initialState}
    />
  );
}
```

**改動要點**:
- 使用 `useMemo` 確保 storage 實例穩定 (避免重複建立)
- 使用 `useCallback` 穩定 `handleFinalize` 引用
- finalize 完成後 `setGuestData(data)` → 自動切換到 ResultStage

---

### 2.2 新增獨立 `/migration` 頁面

#### 目標

提供批量匯入的專屬 UI,包含:
1. 即時進度顯示 (已匯入 X/Y 張專輯)
2. 成功/失敗清單
3. 錯誤處理 (重試/略過)

---

#### 檔案: `src/app/migration/page.tsx` (新增)

```typescript
import { getSession } from "@/../auth";
import { redirect } from "next/navigation";
import MigrationPage from "@/features/sorter/components/MigrationPage";

export default async function page() {
  const user = await getSession();

  // 未登入 → 跳轉首頁
  if (!user) {
    redirect("/");
  }

  return <MigrationPage />;
}
```

---

#### 檔案: `src/features/sorter/components/MigrationPage.tsx` (新增)

```typescript
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createCompletedSubmission } from "../actions/createCompletedSubmission";
import { getAllGuestResults } from "../utils/guestDataHelpers";
import { GuestResultData } from "@/types/guest";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type MigrationResult = {
  albumId: string;
  albumName: string;
  status: "pending" | "success" | "failed";
  error?: string;
};

export default function MigrationPage() {
  const router = useRouter();
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    const processMigration = async () => {
      const allGuestResults = getAllGuestResults();

      // 沒有資料 → 跳轉首頁
      if (allGuestResults.length === 0) {
        router.push("/");
        return;
      }

      // 初始化結果清單
      const initialResults: MigrationResult[] = allGuestResults.map(
        ({ data }) => ({
          albumId: data.albumId,
          albumName: data.tracks[0]?.albumName || data.albumId,
          status: "pending",
        })
      );
      setResults(initialResults);

      // 逐一匯入
      for (let i = 0; i < allGuestResults.length; i++) {
        const { key, data } = allGuestResults[i];

        setCurrentIndex(i);

        try {
          const result = await createCompletedSubmission({
            albumId: data.albumId,
            artistId: data.artistId,
            rankedList: data.resultState.rankedList,
            tracks: data.tracks,
          });

          if (result.success) {
            // 成功 → 清除 LocalStorage
            localStorage.removeItem(key);
            setResults((prev) =>
              prev.map((item, idx) =>
                idx === i ? { ...item, status: "success" } : item
              )
            );
          } else {
            // 失敗 → 保留 LocalStorage,記錄錯誤
            setResults((prev) =>
              prev.map((item, idx) =>
                idx === i
                  ? { ...item, status: "failed", error: result.error }
                  : item
              )
            );
          }
        } catch (error) {
          console.error("Migration failed for", key, error);
          setResults((prev) =>
            prev.map((item, idx) =>
              idx === i
                ? {
                    ...item,
                    status: "failed",
                    error: "網路錯誤,請重試",
                  }
                : item
            )
          );
        }
      }

      setIsCompleted(true);
    };

    processMigration();
  }, [router]);

  const successCount = results.filter((r) => r.status === "success").length;
  const failedCount = results.filter((r) => r.status === "failed").length;
  const totalCount = results.length;
  const progress = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

  // 載入中
  if (!isCompleted && totalCount > 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <h1 className="text-2xl font-bold">正在匯入排名資料...</h1>
        <Progress value={progress} className="w-full max-w-md" />
        <p className="text-muted-foreground">
          已匯入 {successCount}/{totalCount} 張專輯
        </p>
      </div>
    );
  }

  // 完成
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <h1 className="text-2xl font-bold">
        {failedCount === 0 ? "匯入完成！" : "部分匯入失敗"}
      </h1>

      <div className="w-full max-w-2xl space-y-4">
        {/* 成功清單 */}
        {successCount > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-green-600 mb-2">
              成功匯入 ({successCount} 張)
            </h2>
            <ul className="space-y-2">
              {results
                .filter((r) => r.status === "success")
                .map((r) => (
                  <li key={r.albumId} className="text-sm">
                    ✅ {r.albumName}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* 失敗清單 */}
        {failedCount > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-destructive mb-2">
              匯入失敗 ({failedCount} 張)
            </h2>
            <ul className="space-y-2">
              {results
                .filter((r) => r.status === "failed")
                .map((r) => (
                  <li key={r.albumId} className="text-sm">
                    ❌ {r.albumName} - {r.error || "未知錯誤"}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>

      {/* 操作按鈕 */}
      <div className="flex gap-4">
        {failedCount > 0 ? (
          <>
            <Button
              onClick={() => {
                hasProcessedRef.current = false;
                setResults([]);
                setCurrentIndex(0);
                setIsCompleted(false);
              }}
            >
              重試失敗項目
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              略過並回首頁
            </Button>
          </>
        ) : (
          <Button onClick={() => router.push("/")}>前往首頁</Button>
        )}
      </div>
    </div>
  );
}
```

**改動要點**:
- 使用 `Progress` 元件顯示即時進度
- 區分成功/失敗清單,提供重試功能
- 失敗的資料保留在 LocalStorage,重試時只處理失敗項目

---

#### 修改: `src/app/sorter/album/[albumId]/page.tsx`

**移除** MigrationHandler 的條件渲染 (改為導向 `/migration` 頁面):

```typescript
// ❌ Before
if (shouldMigrate && !isGuest) {
  return <MigrationHandler />;
}

// ✅ After (完全移除,改為在 /migration 頁面處理)
```

---

### 2.3 修正 RankingStage Quit 按鈕邏輯

#### 檔案: `src/features/sorter/components/RankingStage.tsx`

**問題**:
- Guest 點 Save → 呼叫 `GuestStorage.save()` (空函式,無效操作)
- Guest 點 Quit → 呼叫 `GuestStorage.quit()` → `showAuthGuard()` (使用者困惑)

**解決方案**: 根據 `storage.capabilities.canAutoSave` 區分邏輯

```typescript
// RankingStage.tsx (line 177-196, 修改)
<Button
  variant="outline"
  onClick={() => {
    if (storage.capabilities.canAutoSave) {
      // User 模式: 有草稿功能,可以 Save
      if (saveStatus === "idle") {
        showConfirm({
          title: "Are You Sure?",
          description: "Your sorting record has not been saved.",
          confirmText: "Quit",
          cancelText: "Save",
          onConfirm: () => handleQuit(),
          onCancel: async () => {
            await handleSave();
            handleQuit();
          },
        });
      } else {
        handleQuit();
      }
    } else {
      // Guest 模式: 沒有草稿功能,只有確認退出
      showAlert({
        title: "確定離開嗎？",
        description: "你的排名進度將會遺失",
        confirmText: "確定離開",
        onConfirm: () => handleQuit(),
      });
    }
  }}
>
  Quit
</Button>
```

**同步修改 GuestStorage.quit()**:

```typescript
// GuestStorage.ts (line 83-86)
quit(): void {
  // Guest 退出直接回首頁 (Full reload 清空 React 狀態)
  window.location.href = '/';
}
```

**為何用 `window.location.href` 而非 `router.push()`?**

| 方案 | 行為 | 適用情境 |
|-----|------|---------|
| `router.push('/')` | SPA 導航 (狀態保留) | User 模式 (已儲存草稿) |
| `window.location.href = '/'` | Full reload (清空狀態) | Guest 模式 (需清空記憶體) |

Guest 退出應該完全清空 React 狀態,避免殘留資料。

---

### 2.4 ResultStage 新增重新排名按鈕

#### 檔案: `src/features/sorter/components/ResultStage.tsx`

**目標**: Guest 模式新增「重新排名」按鈕

```typescript
// ResultStage.tsx (適當位置加入)
{!storage.capabilities.canAutoSave && albumId && (
  <Button
    variant="outline"
    onClick={() => {
      showAlert({
        title: "確定重新排名嗎？",
        description: "當前排名將被清除,無法復原",
        confirmText: "重新開始",
        onConfirm: () => {
          localStorage.removeItem(`rankify_guest_result_${albumId}`);
          window.location.reload();
        },
      });
    }}
  >
    重新排名
  </Button>
)}
```

**Quit 按鈕邏輯** (Guest 專用):

```typescript
// ResultStage.tsx Quit 按鈕
{!storage.capabilities.canAutoSave ? (
  // Guest 模式
  <Button
    variant="outline"
    onClick={() => {
      showAlert({
        title: "暫不保存,確定回首頁嗎？",
        description: "你的排名還沒登入保存",
        confirmText: "確定離開",
        onConfirm: () => {
          window.location.href = '/';
        },
      });
    }}
  >
    Quit
  </Button>
) : (
  // User 模式 (現有邏輯)
  <Button variant="outline" onClick={() => storage.quit()}>
    Quit
  </Button>
)}
```

---

### 2.5 DatabaseStorage 改名為 UserStorage

**影響檔案**:
- `src/features/sorter/storage/DatabaseStorage.ts` → `UserStorage.ts`
- `src/features/sorter/hooks/useSorter.ts` (import 處)
- 可能的其他引用處

**改名理由**:
- ✅ 對稱性: `GuestStorage` ↔ `UserStorage`
- ✅ 抽象層次統一: 都從「使用者角色」角度命名
- ❌ DatabaseStorage 暴露實作細節 (不符合好品味)

**執行方式**:
1. 使用 `git mv` 重新命名檔案
2. 全域搜尋並替換 `DatabaseStorage` → `UserStorage`
3. 檢查 class 名稱、import 語句

---

### 2.6 修正 use-toast.ts ESLint Warning

#### 檔案: `src/hooks/use-toast.ts` (line 21-26)

**Warning**: `'actionTypes' is assigned a value but only used as a type.`

**修正方案**: 加上 ESLint 忽略註解

```typescript
// line 21-26
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;
```

**為何不刪除?**
- 保留以便未來擴充 (集中定義 action types)
- shadcn/ui 升級時不會產生 merge 衝突

---

## 三、檔案修改清單

### 修改檔案 (10 個)

1. **`src/features/sorter/storage/GuestStorage.ts`**
   - 新增 `onFinalize` callback 參數
   - 修改 `finalize()` 方法 (移除 reload,改為呼叫 callback)
   - 修改 `submitResult()` callbackUrl (改為 `/migration`)
   - 估計修改: ~15 行

2. **`src/features/sorter/components/GuestSorterEntry.tsx`**
   - 新增 `handleFinalize` callback
   - 使用 `useMemo` 建立 GuestStorage 實例
   - 估計修改: ~10 行

3. **`src/features/sorter/components/RankingStage.tsx`**
   - 修改 Quit 按鈕邏輯 (根據 `canAutoSave` 切換)
   - 估計修改: ~30 行

4. **`src/features/sorter/components/ResultStage.tsx`**
   - 新增「重新排名」按鈕 (Guest 專用)
   - 修改 Quit 按鈕邏輯 (Guest 專用)
   - 估計修改: ~40 行

5. **`src/features/sorter/storage/DatabaseStorage.ts` → `UserStorage.ts`**
   - 檔案重新命名 + class 重新命名
   - 估計修改: ~5 行

6. **`src/features/sorter/hooks/useSorter.ts`**
   - 更新 import (`DatabaseStorage` → `UserStorage`)
   - 估計修改: ~2 行

7. **`src/hooks/use-toast.ts`**
   - 加上 ESLint 忽略註解
   - 估計修改: ~1 行

8. **`src/app/sorter/album/[albumId]/page.tsx`**
   - 移除 MigrationHandler 條件渲染
   - 估計修改: ~5 行

9. **`src/features/sorter/components/MigrationHandler.tsx`** (可選刪除)
   - 此檔案功能已被 MigrationPage.tsx 取代
   - 可選擇保留或刪除

10. **`src/types/guest.ts`** (可能需要修改)
    - 檢查 `GuestResultData` 型別是否需要擴充
    - 估計修改: ~0-5 行

### 新增檔案 (3 個)

1. **`src/app/migration/page.tsx`**
   - Server Component,檢查登入狀態
   - 估計新增: ~15 行

2. **`src/features/sorter/components/MigrationPage.tsx`**
   - Client Component,批量匯入 UI
   - 估計新增: ~150 行

3. **`src/components/ui/progress.tsx`** (如果不存在)
   - shadcn/ui Progress 元件
   - 估計新增: ~30 行

---

## 四、測試計劃

### 4.1 GuestStorage 狀態更新測試

| 測試項目 | 預期行為 |
|---------|---------|
| Guest 完成排序 | 呼叫 `onFinalize(guestData)` → GuestSorterEntry 更新狀態 → 切換到 ResultStage |
| Guest 完成排序後重新整理 | 從 LocalStorage 讀取資料 → 顯示 ResultStage |
| Guest 完成排序不觸發 beforeunload | 不顯示瀏覽器警告 (已移除 reload) |

### 4.2 /migration 頁面測試

| 測試項目 | 預期行為 |
|---------|---------|
| Guest 完成 3 張專輯 → 登入 | 顯示「已匯入 1/3」→「已匯入 2/3」→「已匯入 3/3」→「匯入完成！」 |
| Guest 完成 2 張專輯,1 張匯入失敗 → 重新整理 | 顯示成功 2 張、失敗 1 張,提供 [重試] 按鈕 |
| Guest 沒有排名資料 → 登入 → 訪問 `/migration` | 自動跳轉首頁 |
| 未登入訪問 `/migration` | 自動跳轉首頁 |

### 4.3 RankingStage Quit 按鈕測試

| 測試項目 | 預期行為 |
|---------|---------|
| Guest 點擊 Quit | 顯示 Alert (確定離開嗎？) |
| Guest 確認 Alert | 回到首頁 (`/`) |
| User 點擊 Quit (未儲存) | 顯示 Confirm (Save / Quit) |
| User 選擇 Save | 儲存草稿 + 回 artist 頁面 |
| User 選擇 Quit | 直接回 artist 頁面 |

### 4.4 ResultStage 按鈕測試

| 測試項目 | 預期行為 |
|---------|---------|
| Guest 點擊「重新排名」 | 顯示 Alert → 確認 → 清除 LocalStorage + reload |
| Guest 點擊 Quit | 顯示 Alert (暫不保存?) → 確認 → 回首頁 |
| User 點擊 Quit | 回 artist 頁面 (現有行為) |

---

## 五、成功指標

### 核心功能

- [ ] Guest 完成排序不觸發 `window.location.reload()`
- [ ] Guest 完成排序自動切換到 ResultStage (狀態驅動)
- [ ] `/migration` 頁面顯示即時進度條
- [ ] `/migration` 頁面成功匯入後跳轉首頁
- [ ] `/migration` 頁面部分失敗時提供重試功能
- [ ] Guest RankingStage Quit 按鈕正常運作
- [ ] Guest ResultStage 有「重新排名」和 Quit 按鈕
- [ ] DatabaseStorage → UserStorage 改名成功

### 程式碼品質

- [ ] TypeScript 編譯 0 errors
- [ ] ESLint 0 warnings (use-toast.ts 已修正)
- [ ] 所有 import 正確 (UserStorage)
- [ ] 移除所有 `window.location.reload()` 呼叫 (除了必要的 full reload 場景)

---

## 六、風險評估

| 風險項目 | 等級 | 影響 | 緩解策略 |
|---------|------|------|---------|
| GuestStorage callback 導致循環依賴 | 🟡 中 | 型別錯誤 | 使用 `useCallback` 穩定引用 |
| MigrationPage 重試邏輯複雜 | 🟡 中 | 使用者困惑 | 提供清晰的錯誤訊息與操作引導 |
| DatabaseStorage 改名漏改引用處 | 🟢 低 | 編譯錯誤 | 使用 VSCode 全域重新命名 |
| Progress 元件不存在 | 🟢 低 | UI 缺失 | 使用 shadcn/ui 安裝 Progress 元件 |

---

## 七、執行時間估計

| 項目 | 預估時間 |
|-----|---------|
| GuestStorage 狀態更新改造 | 1-2 小時 |
| 新增 /migration 頁面 | 2-3 小時 |
| RankingStage Quit 邏輯修正 | 1 小時 |
| ResultStage 按鈕 | 1 小時 |
| DatabaseStorage 改名 | 30 分鐘 |
| ESLint Warning 修正 | 5 分鐘 |
| 測試與驗證 | 3 小時 |
| **總計** | **2-2.5 天** |

---

## 八、關鍵技術決策總結

### 決策 1: 移除 `window.location.reload()` 改用狀態更新

**理由**:
- ✅ 符合 React SPA 設計原則
- ✅ 避免觸發 beforeunload 事件
- ✅ 不需要複雜的 beforeunload 攔截邏輯
- ✅ 為未來的狀態管理優化鋪路

**Trade-off**:
- ❌ 需要修改 GuestStorage 介面 (新增 callback 參數)
- ❌ GuestSorterEntry 需要使用 `useMemo` 穩定 storage 實例

### 決策 2: 新增獨立 `/migration` 頁面

**理由**:
- ✅ 批量匯入是**流程**,不是**通知** (Toast 不合適)
- ✅ 提供即時進度反饋 (使用者清楚知道發生什麼)
- ✅ 錯誤處理更友善 (重試/略過按鈕)
- ✅ 語義正確 (`/migration` 專門處理資料遷移)

**Trade-off**:
- ❌ 需要新增路由與頁面元件
- ❌ 複雜度增加 (進度管理、錯誤處理)

### 決策 3: GuestStorage.quit() 使用 `window.location.href` 而非 `router.push()`

**理由**:
- ✅ Guest 退出需要清空所有 React 狀態 (避免殘留資料)
- ✅ Full page reload 可確保乾淨的初始狀態
- ✅ GuestStorage 不需要依賴注入 router instance (保持簡潔)

### 決策 4: ResultStage 重新排名使用 `window.location.reload()` 而非狀態更新

**理由**:
- ✅ 重新排名需要重置所有狀態 (包括 useSorter 內部狀態)
- ✅ reload 是最簡單且安全的重置方式
- ✅ 不需要複雜的狀態重置邏輯

---

**計劃完成** ✅

**準備開始執行**
