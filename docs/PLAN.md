# Sorter UX 優化實作計劃（終稿）

## 目標

統一 Album Sorter 和 Artist Sorter 的導航體驗，**完善 Storage Strategy 封裝**，徹底消除 UI 層的 `if (isGuest)` 或 `if (canAutoSave)` 判斷，提升 Mobile UX。

---

## 核心設計原則

### 1. 完善策略模式封裝
- 將「警告邏輯」封裝進 Storage Strategy，UI 不需要知道 Guest/User 的差異
- 新增 `shouldWarnBeforeLeaving()` 和 `getLeaveWarning()` 方法
- **消除** UI 層的 `if (storage.capabilities.canAutoSave)` 判斷警告條件

### 2. 向後相容
- 保持現有 Storage 方法（save, finalize, quit 等）不變
- 只新增方法，不破壞現有邏輯

### 3. Mobile First
- 所有按鈕 Touch Target ≥ 44x44px（WCAG 標準）
- Previous 按鈕在 Mobile 為全寬

---

## 核心問題診斷

### 問題 1：Capabilities 失去區分能力

**當前狀態**：
- Guest: `canRestart=false`, `needsBeforeUnload=false`
- User: `canRestart=true`, `needsBeforeUnload=true`

**需求變更後**：
- Guest: `canRestart=true` ← 訪客也要能 Restart
- Guest: `needsBeforeUnload=true` ← 訪客也要 beforeunload 警告

**結果**：兩邊都是 `true`，capabilities 無法區分模式 → UI 還是要用 `if (canAutoSave)` 判斷 → **回到 `if (isGuest)` 的老路**

### 問題 2：警告邏輯散落在 UI 層

**當前寫法**（如果按原計劃）：
```typescript
// RankingStage.tsx - beforeunload
const shouldWarn = storage.capabilities.canAutoSave
  ? saveStatus !== "saved"      // User 邏輯
  : finishFlag.current !== 1;   // Guest 邏輯

// QuitButton.tsx - Quit 警告
if (storage.capabilities.canAutoSave) {
  // User 邏輯
} else {
  // Guest 邏輯
}
```

**違背策略模式**：UI 需要知道 Guest/User 的實作細節

---

## Linus 式解決方案

### 核心思想：讓 Storage 自己決定要不要警告

```typescript
// UI 只需要呼叫，不需要判斷
if (storage.shouldWarnBeforeLeaving(state)) {
  e.preventDefault();
}

if (storage.shouldWarnBeforeLeaving(state)) {
  const warning = storage.getLeaveWarning();
  showAlert(warning);
}
```

**優點**：
- ✅ 完全消除 `if (isGuest)` 或 `if (canAutoSave)` 的警告條件判斷
- ✅ UI 不需要知道 Guest 看 finishFlag、User 看 saveStatus
- ✅ 未來加新模式（例如 Premium User）只需新增 Strategy class

---

## 實作步驟

### 第一階段：完善 StorageStrategy 介面

#### 檔案：`src/features/sorter/storage/StorageStrategy.ts`

**修改 1：新增狀態型別**

在檔案開頭新增：
```typescript
/**
 * 用於警告判斷的狀態
 */
export interface WarningContext {
  finishFlag: number;
  saveStatus: "saved" | "pending" | "idle" | "failed";
}
```

**修改 2：在 StorageStrategy 介面新增方法**

在 `quit(): void;` 之後新增：
```typescript
/**
 * 檢查是否需要在離開時警告（beforeunload 和 Quit 按鈕共用）
 *
 * Guest: 檢查 finishFlag !== 1（排名未完成）
 * User: 檢查 saveStatus !== "saved"（有未儲存變更）
 *
 * @param state - 當前狀態（包含 finishFlag 和 saveStatus）
 * @returns true 表示需要警告
 */
shouldWarnBeforeLeaving(state: WarningContext): boolean;

/**
 * 取得離開警告的文字內容
 *
 * Guest: "Your ranking progress will be lost"
 * User: "Your sorting record has not been saved."
 *
 * @returns 警告訊息物件
 */
getLeaveWarning(): {
  title: string;
  description: string;
  confirmText: string;
};
```

---

### 第二階段：實作 GuestStorage 方法

#### 檔案：`src/features/sorter/storage/GuestStorage.ts`

**修改 1：修改 capabilities（第 80-85 行）**

```typescript
readonly capabilities: Capabilities = {
  canRestart: true,              // ← 改為 true（訪客也能 Restart）
  canDelete: false,
  canAutoSave: false,
  needsBeforeUnload: true,       // ← 改為 true（訪客也要警告）
};
```

**修改 2：在 `quit()` 方法之後新增兩個方法**

```typescript
shouldWarnBeforeLeaving(state: WarningContext): boolean {
  // Guest 只看 finishFlag（排名是否完成）
  return state.finishFlag !== 1;
}

getLeaveWarning() {
  return {
    title: "Are You Sure?",
    description: "Your ranking progress will be lost",
    confirmText: "Quit",
  };
}
```

**修改 3：新增 import**

在檔案頂部的 import 區塊加入：
```typescript
import { StorageStrategy, Capabilities, WarningContext } from "./StorageStrategy";
```

---

### 第三階段：實作 UserStorage 方法

#### 檔案：`src/features/sorter/storage/UserStorage.ts`

**修改 1：在 `quit()` 方法之後新增兩個方法**

```typescript
shouldWarnBeforeLeaving(state: WarningContext): boolean {
  // User 只看 saveStatus（是否有未儲存變更）
  return state.saveStatus !== "saved";
}

getLeaveWarning() {
  return {
    title: "Are You Sure?",
    description: "Your sorting record has not been saved.",
    confirmText: "Quit",
  };
}
```

**修改 2：新增 import**

在檔案頂部的 import 區塊加入：
```typescript
import { StorageStrategy, Capabilities, WarningContext } from "./StorageStrategy";
```

---

### 第四階段：建立統一的 QuitButton 組件

#### 檔案：`src/features/sorter/components/QuitButton.tsx`（新檔案）

**完整內容**：

```typescript
"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/contexts";
import { useSorterState } from "@/contexts/SorterContext";
import { StorageStrategy } from "../storage/StorageStrategy";
import { useRef } from "react";

type QuitButtonProps = {
  storage: StorageStrategy;
  finishFlag: React.MutableRefObject<number>;
  onSave?: () => Promise<void>; // RankingStage 提供的 handleSave
};

/**
 * 統一的 Quit 按鈕（浮在左上角）
 *
 * 職責：
 * - 統一 Guest/User 的離開邏輯
 * - 依賴 Storage Strategy 決定警告行為
 * - 用 canAutoSave 判斷是否提供 Save 選項（YAGNI 原則）
 */
export function QuitButton({ storage, finishFlag, onSave }: QuitButtonProps) {
  const { showAlert, showConfirm } = useModal();
  const { saveStatus } = useSorterState();
  const isIntentionalNavigation = useRef(false);

  const handleQuit = () => {
    isIntentionalNavigation.current = true;
    storage.quit();
  };

  const handleClick = async () => {
    const state = {
      finishFlag: finishFlag.current,
      saveStatus,
    };

    // 檢查是否需要警告
    if (!storage.shouldWarnBeforeLeaving(state)) {
      handleQuit();
      return;
    }

    const warning = storage.getLeaveWarning();

    // 檢查是否有儲存能力（用 canAutoSave 判斷 - YAGNI 原則）
    // 有自動儲存功能 = 有儲存功能 → 提供 Save 選項
    if (storage.capabilities.canAutoSave) {
      // 有儲存功能 → showConfirm（提供 Save 選項）
      showConfirm({
        title: warning.title,
        description: warning.description,
        confirmText: warning.confirmText,
        cancelText: "Save",
        onConfirm: handleQuit,
        onCancel: async () => {
          await onSave?.(); // 呼叫 RankingStage 提供的 handleSave
          handleQuit();
        },
      });
    } else {
      // 沒有儲存功能 → showAlert（只有 Quit）
      showAlert({
        title: warning.title,
        description: warning.description,
        confirmText: warning.confirmText,
        onConfirm: handleQuit,
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="fixed left-4 top-24 z-40 h-11 w-11 rounded-full bg-background/80 backdrop-blur-sm hover:bg-accent border shadow-lg transition-all hover:scale-105 active:scale-95"
      aria-label="Quit sorter"
    >
      <X className="h-5 w-5" />
    </Button>
  );
}
```

**設計要點**：
- `fixed left-4 top-24`：浮在 Header 下方左上角
- `z-40`：低於 Modal（z-50），確保 Modal 可以覆蓋
- `h-11 w-11`：Touch Target 44x44px（符合 WCAG）
- **完全沒有 `if (isGuest)` 判斷**
- 使用 `canAutoSave` 判斷是否提供 Save 選項（YAGNI 原則）
- 接受 `onSave` callback，避免型別錯誤

---

### 第五階段：修改 RankingStage

#### 檔案：`src/features/sorter/components/RankingStage.tsx`

**修改 1：引入 QuitButton 和新的型別**

在 import 區塊新增：
```typescript
import { QuitButton } from "./QuitButton";
import { WarningContext } from "../storage/StorageStrategy";
```

**修改 2：移除舊的 handleQuit 函數**

刪除第 69-75 行（`handleQuit` 函數）。

**修改 3：修改 beforeunload 邏輯（第 116-139 行）**

```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    // 如果是有意導航 (Quit/Restart)，不攔截
    if (isIntentionalNavigation.current) {
      return;
    }

    // 完全依賴 Storage 決定
    const state: WarningContext = {
      finishFlag: finishFlag.current,
      saveStatus,
    };

    if (storage.shouldWarnBeforeLeaving(state)) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [storage, finishFlag, saveStatus]);
```

**修改 4：Previous 按鈕 Responsive（第 173-177 行）**

```typescript
<Button
  variant="outline"
  onClick={restorePreviousState}
  className="w-full sm:w-auto min-h-[44px]" // ← 新增 Responsive 樣式
>
  <ChevronLeftIcon />
  <p>Previous</p>
</Button>
```

**修改 5：移除舊的 Quit 按鈕區塊（第 195-227 行）**

刪除整個 Quit 按鈕，保留 Restart 按鈕：
```typescript
<div className="flex justify-between gap-3">
  <Button
    variant="outline"
    onClick={restorePreviousState}
    className="w-full sm:w-auto min-h-[44px]"
  >
    <ChevronLeftIcon />
    <p>Previous</p>
  </Button>

  {/* 只保留 Restart */}
  {storage.capabilities.canRestart && (
    <Button
      variant="outline"
      onClick={() =>
        showAlert({
          title: "Are You Sure?",
          description: "You will clear your sorting record.",
          confirmText: "Clear and Restart",
          onConfirm: () => handleClear(),
        })
      }
    >
      Restart
    </Button>
  )}
</div>
```

**修改 6：渲染新的 QuitButton（第 142 行）**

在 `return` 的最外層 `<section>` 內加入：
```typescript
return (
  <section className="flex h-[calc(100vh-80px)] select-none">
    <QuitButton
      storage={storage}
      finishFlag={finishFlag}
      onSave={handleSave} // ← 傳入 useSorter 提供的 handleSave
    />
    {/* 原有內容 */}
  </section>
);
```

---

### 第六階段：修改 SorterHeader（加入 Logo）

#### 檔案：`src/features/sorter/components/SorterHeader.tsx`

**修改 1：引入 Link**

```typescript
import Link from "next/link";
```

**修改 2：調整 JSX 結構（第 16-34 行）**

```typescript
return (
  <div className="grid h-20 items-center border-b px-4 sm:grid-cols-3">
    {/* 左側: Logo + Save Status */}
    <div className="flex items-center gap-4">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-bold hover:opacity-70 transition-opacity active:opacity-50"
      >
        Rankify
      </Link>

      {/* Save Status */}
      <div className="hidden h-5 justify-end text-muted-foreground lg:flex">
        {saveStatus === "saved" ? (
          <div className="flex items-center gap-1">
            <CheckIcon />
            <p className="text-sm">Saved</p>
          </div>
        ) : saveStatus === "pending" ? (
          <div className="flex items-center gap-2">
            <LoadingAnimation size="small" isFull={false} />
            <p className="text-sm">Saving...</p>
          </div>
        ) : ""}
      </div>
    </div>

    {/* 中間: Title */}
    <div className="hidden justify-self-center sm:block">
      <p className="text-secondary-foreground">{title}&apos;s Sorter</p>
    </div>

    {/* 右側: Progress */}
    <div className="mt-2 w-full justify-self-end sm:w-fit">
      <div className="relative w-full sm:w-[150px] xl:w-[300px]">
        <p
          className="absolute -top-5 -translate-x-full text-right text-sm text-muted-foreground"
          style={{ left: `${percentage}%` }}
        >
          {percentage}%
        </p>
        <Progress value={percentage} className="h-2" />
      </div>
    </div>
  </div>
);
```

**設計要點**：
- Logo 使用 `<Link href="/">`，依賴 beforeunload 自動攔截
- 不需要額外的警告邏輯（RankingStage 的 beforeunload 已處理）

---

### 第七階段：修改 ResultStage（移除 Quit 按鈕）

#### 檔案：`src/features/sorter/components/ResultStage.tsx`

**修改 1：簡化 beforeunload 邏輯（第 107-117 行）**

```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    // ResultStage: finishFlag 已是 1，Guest 不會警告
    // User 模式如果還沒 submit，saveStatus 可能不是 "saved"
    const state = {
      finishFlag: 1,
      saveStatus: "idle", // 假設還沒儲存
    };

    if (storage.shouldWarnBeforeLeaving(state)) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [storage]);
```

**修改 2：移除舊的 Quit 按鈕（第 217-238 行）**

第 184-239 行改為：
```typescript
<div className="sticky top-0 flex items-center justify-between py-10">
  <h3>Your ranking result</h3>
  <div className="flex gap-5">
    {/* Submit/Login 按鈕 */}
    <Button onClick={handleSubmit}>
      {storage.capabilities.canAutoSave ? "Submit" : "Login to Save"}
    </Button>

    {/* User 模式: Delete */}
    {storage.capabilities.canDelete && (
      <Button variant="secondary" onClick={handleDelete}>
        <p className="w-full">Delete</p>
      </Button>
    )}
  </div>
</div>
```

**設計理由**：
- ResultStage 是完成狀態，finishFlag=1，不需要警告
- 依賴 Header 的 Logo 返回首頁（減少視覺雜訊）
- 符合 Linus 的簡潔原則

---

## 關鍵改進總結

### Before（原計劃 - 違背策略模式）
```typescript
// UI 層需要判斷
if (storage.capabilities.canAutoSave) {
  // User 邏輯
} else {
  // Guest 邏輯
}
```

### After（重構版 - 完美封裝）
```typescript
// UI 層完全不需要判斷警告條件
if (storage.shouldWarnBeforeLeaving(state)) {
  const warning = storage.getLeaveWarning();
  showAlert(warning);
}

// 只在決定 UI 選項時使用 canAutoSave（YAGNI 原則）
if (storage.capabilities.canAutoSave) {
  showConfirm({ cancelText: "Save", ... });
} else {
  showAlert({ ... });
}
```

---

## 關鍵檔案清單

1. `src/features/sorter/storage/StorageStrategy.ts` - 新增介面方法
2. `src/features/sorter/storage/GuestStorage.ts` - 實作 2 個方法 + 修改 capabilities
3. `src/features/sorter/storage/UserStorage.ts` - 實作 2 個方法
4. `src/features/sorter/components/QuitButton.tsx` - 新建統一的 Quit 按鈕
5. `src/features/sorter/components/RankingStage.tsx` - 整合 QuitButton + 修改 beforeunload
6. `src/features/sorter/components/ResultStage.tsx` - 移除 Quit 按鈕（依賴 Header Logo）
7. `src/features/sorter/components/SorterHeader.tsx` - 加入 Logo

---

## 測試計劃

### 測試矩陣

| 模式 | Stage | 測試點 |
|------|-------|--------|
| **Guest** | RankingStage | 1. Quit 按鈕（未完成）→ 警告 "進度會遺失"<br>2. Logo 點擊 → beforeunload 攔截<br>3. Restart 按鈕 → 清除 localStorage → reload<br>4. Previous 按鈕（Mobile）→ 全寬 + 最小高度 44px |
| **Guest** | ResultStage | 5. Logo 點擊 → 直接離開，不警告 |
| **User** | RankingStage | 6. Quit 按鈕（未儲存）→ 雙按鈕 Modal（Quit/Save）<br>7. Quit 按鈕（已儲存）→ 直接離開<br>8. Logo 點擊（未儲存）→ beforeunload 攔截 |
| **User** | ResultStage | 9. Logo 點擊 → 直接離開<br>10. Delete 按鈕 → 警告 → 刪除草稿 |

---

## 完成標準

- [ ] StorageStrategy 新增 2 個方法定義
- [ ] GuestStorage 實作 2 個方法 + capabilities 改為 `true`
- [ ] UserStorage 實作 2 個方法
- [ ] QuitButton 在 RankingStage 統一顯示（左上角）
- [ ] RankingStage 的 beforeunload 使用 `storage.shouldWarnBeforeLeaving()`
- [ ] Logo 在 Header 左側，點擊可回首頁
- [ ] Previous 按鈕在 Mobile 為全寬
- [ ] ResultStage 不渲染 QuitButton（依賴 Header Logo）
- [ ] **UI 層完全沒有 `if (isGuest)` 判斷**
- [ ] **警告條件判斷完全封裝在 Storage Strategy**
- [ ] 通過測試矩陣的所有測試點

---

## 實作順序建議

1. **StorageStrategy.ts** - 新增介面定義（最簡單）
2. **GuestStorage.ts** - 實作方法 + 修改 capabilities
3. **UserStorage.ts** - 實作方法
4. **QuitButton.tsx** - 建立新組件（依賴上述完成）
5. **SorterHeader.tsx** - 加入 Logo（獨立修改）
6. **RankingStage.tsx** - 整合 QuitButton + 修改 beforeunload
7. **ResultStage.tsx** - 移除 Quit 按鈕 + 簡化 beforeunload

**原因**：由底層到上層，逐步驗證邏輯正確性。
