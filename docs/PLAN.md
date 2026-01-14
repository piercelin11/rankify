# Sorter 狀態管理修復計劃

> **Linus Torvalds 式的「好品味」重構**
>
> 目標：消除 reference 污染、修復 race condition、優化 beforeunload 體驗

---

## 【核心判斷】✅ 值得做，精準打擊

**原因**：這三個問題都是「資料結構設計不當」導致的次生問題。
- **P0/P1**：Reference 污染 → 不必要的重渲染與狀態重置
- **P2**：狀態機時序衝突 → autoSave 覆蓋使用者操作
- **P3**：條件邏輯缺失 → 雙重確認影響 UX

---

## 【關鍵洞察】

### P0：UserStorage 每次 render 都重建
- **位置**：`DraftPrompt.tsx:37-38`
- **問題**：`new UserStorage(...)` 沒有 useMemo 保護 → reference 改變 → useSorter 重新初始化
- **Linus 會說**：「storage 應該是穩定的基礎設施，不該依賴 render cycle」

### P1：SorterContext value object 重建
- **位置**：`SorterContext.tsx:25-30`
- **問題**：value object 每次都重建 → 所有 consumer 重渲染
- **Linus 會說**：「這是 React Context 的『渲染放大器』bug」

### P2：autoSave race condition
- **問題**：
  ```
  T=11s   autoSave 開始
  T=11.5s 使用者點擊 → setSaveStatus("idle")
  T=12s   autoSave 完成 → setSaveStatus("saved") ← 覆蓋了 idle！
  ```
- **Linus 會說**：「經典的 check-then-act 問題，需要 compare-and-set」

### P3：beforeunload 雙重確認
- **問題**：Quit/Restart 已有 Modal，beforeunload 導致雙重確認
- **解決**：加入 `isIntentionalNavigation` flag 區分「意圖導航」與「意外關閉」

---

## Phase 1：穩定 Reference（P0 + P1）

### 目標
消除不必要的 reference 變化，建立清晰的資料流。

---

### Step 1.1：拆分 SorterContext

**檔案**：`src/contexts/SorterContext.tsx`

**策略**：按「變動頻率」拆分
- `SorterStateContext` - 經常變動的 state
- `SorterActionsContext` - 永遠不變的 setters

**修改內容**：

```typescript
// 拆分成兩個 Context
const SorterStateContext = createContext<{
  saveStatus: SaveStatusType;
  percentage: number;
} | undefined>(undefined);

const SorterActionsContext = createContext<{
  setSaveStatus: (status: SaveStatusType) => void;
  setPercentage: (percentage: number) => void;
} | undefined>(undefined);

export function SorterProvider({ children }: { children: ReactNode }) {
  const [saveStatus, setSaveStatus] = useState<SaveStatusType>("idle");
  const [percentage, setPercentage] = useState<number>(0);

  // Actions 永不改變（React 保證 useState 的 setter 穩定）
  // 不需要 useMemo，直接賦值即可
  const actions = { setSaveStatus, setPercentage };

  // State 只在值變化時才改變
  const state = useMemo(
    () => ({
      saveStatus,
      percentage,
    }),
    [saveStatus, percentage]
  );

  return (
    <SorterActionsContext.Provider value={actions}>
      <SorterStateContext.Provider value={state}>
        {children}
      </SorterStateContext.Provider>
    </SorterActionsContext.Provider>
  );
}

// 提供兩個獨立的 Hook
export function useSorterState() {
  const context = useContext(SorterStateContext);
  if (context === undefined) {
    throw new Error("useSorterState must be used within a SorterProvider");
  }
  return context;
}

export function useSorterActions() {
  const context = useContext(SorterActionsContext);
  if (context === undefined) {
    throw new Error("useSorterActions must be used within a SorterProvider");
  }
  return context;
}

// 保留舊 Hook 作為向後相容
export function useSorterContext() {
  return { ...useSorterState(), ...useSorterActions() };
}
```

**需要新增 import**：
```typescript
import { useMemo } from "react";
```

**預期效果**：
- ✅ Actions 消費者不會因為 percentage 變化而重渲染
- ✅ State 消費者不會因為 actions reference 變化而重渲染
- ✅ 保留 `useSorterContext()` 向後相容

---

### Step 1.2：穩定 DraftPrompt 的 UserStorage

> ⚠️ **重要**：必須在 Step 1.1 完成後再執行此步驟，因為需要先確保 `setSaveStatus` 的 reference 穩定。

**檔案**：`src/features/sorter/components/DraftPrompt.tsx`

**修改位置**：第 13, 35-38 行

**修改內容**：

```typescript
// 修改 import
import { useSorterActions } from "@/contexts/SorterContext";
import { useMemo } from "react";

// 修改 storage 建立邏輯
const { setSaveStatus } = useSorterActions(); // 改用新 Hook

// 使用 useMemo 穩定 reference
const storage = useMemo(
  () => new UserStorage(submissionId, artistId, router, setSaveStatus),
  [submissionId, artistId, router, setSaveStatus]
);
```

**預期效果**：
- ✅ `storage` reference 在整個生命週期內穩定
- ✅ `useSorter` 不會因為 parent render 而重新初始化

---

### Step 1.3：更新所有 Context 消費者

根據使用情況選擇正確的 Hook：

#### 1.3.1 useSorter.ts（Actions only）
**檔案**：`src/features/sorter/hooks/useSorter.ts`
**修改行**：第 1, 41 行

```typescript
import { useSorterActions } from "@/contexts/SorterContext";

const { setSaveStatus, setPercentage } = useSorterActions();
```

---

#### 1.3.2 ResultStage.tsx（Actions only）
**檔案**：`src/features/sorter/components/ResultStage.tsx`
**修改行**：第 28, 47 行

```typescript
import { useSorterActions } from "@/contexts/SorterContext";

const { setPercentage } = useSorterActions();
```

---

#### 1.3.3 FilterStage.tsx（Actions only）
**檔案**：`src/features/sorter/components/FilterStage.tsx`
**修改行**：第 14, 23 行

```typescript
import { useSorterActions } from "@/contexts/SorterContext";

const { setPercentage } = useSorterActions();
```

---

#### 1.3.4 SorterHeader.tsx（State only）
**檔案**：`src/features/sorter/components/SorterHeader.tsx`
**修改行**：第 6, 13 行

```typescript
import { useSorterState } from "@/contexts/SorterContext";

const { saveStatus, percentage } = useSorterState();
```

---

#### 1.3.5 RankingStage.tsx（Mixed）
**檔案**：`src/features/sorter/components/RankingStage.tsx`
**修改行**：第 10, 36-37 行

```typescript
import { useSorterState, useSorterActions } from "@/contexts/SorterContext";

const { setSaveStatus, setPercentage } = useSorterActions();
const { saveStatus } = useSorterState();
```

---

## Phase 2：修復 autoSave race condition（P2）

### 目標
在 `setSaveStatus("saved")` 前檢查是否有新變更，避免覆蓋使用者的 "idle" 狀態。

---

### Step 2.1：修改 useAutoSave 的 executeSave

**檔案**：`src/features/sorter/hooks/useAutoSave.ts`
**修改位置**：第 1, 40-51 行

**需要新增 import（頂部）**：
```typescript
// 在檔案最上方加入
// 只在開發環境啟用 Debug Log
const DEBUG_AUTOSAVE = process.env.NEXT_PUBLIC_DEBUG_AUTOSAVE === 'true';
```

**修改前**：
```typescript
const executeSave = useCallback(async (state: SorterStateType) => {
  setSaveStatus('pending');

  try {
    await onSave(state);
    setSaveStatus('saved');
  } catch (error) {
    console.error('Auto-save error:', error);
    setSaveStatus('failed');
  }
}, [onSave, setSaveStatus]);
```

**修改後**：
```typescript
const executeSave = useCallback(async (stateToSave: SorterStateType) => {
  // ============================================================
  // 開發者模式：追蹤 autoSave 的時序
  // ============================================================
  // 用途：驗證 race condition 修復是否有效
  //
  // 啟用方式：
  //   在 .env.local 加入：
  //   NEXT_PUBLIC_DEBUG_AUTOSAVE=true
  //
  // 輸出範例：
  //   [AutoSave 1736812345678] 🚀 Started with 42 items
  //   [AutoSave 1736812345678] ⏭️ Skipped (new changes detected)
  //
  // 說明：
  //   - "⏭️ Skipped" 表示儲存完成時，使用者又操作了
  //   - "✅ Saved" 表示成功儲存且無新變更
  // ============================================================
  const saveId = DEBUG_AUTOSAVE ? Date.now() : null;

  if (saveId) {
    console.log(
      `[AutoSave ${saveId}] 🚀 Started with ${stateToSave.sortList.length} items`
    );
  }

  setSaveStatus('pending');

  try {
    await onSave(stateToSave);

    // ✅ 儲存完成前檢查：是否有新的變更？
    // 如果 latestStateRef 已經不等於 stateToSave，代表使用者又點擊了
    const hasNewChanges = latestStateRef.current !== stateToSave;

    if (saveId) {
      console.log(
        `[AutoSave ${saveId}] ${
          hasNewChanges
            ? '⏭️ Skipped (new changes detected)'
            : '✅ Saved successfully'
        }`
      );
    }

    if (!hasNewChanges) {
      setSaveStatus('saved');
    }
    // 否則保持當前狀態（由下一次 sortList 設定）
  } catch (error) {
    if (saveId) {
      console.error(`[AutoSave ${saveId}] ❌ Failed:`, error);
    } else {
      console.error('Auto-save error:', error);
    }
    setSaveStatus('failed');
  }
}, [onSave, setSaveStatus]);
```

**預期效果**：
```
T=11s   autoSave 開始 (stateToSave = stateA)
T=11.5s 使用者點擊 → setSaveStatus("idle"), latestStateRef = stateB
T=12s   saveDraft 完成
        → 檢查: latestStateRef !== stateToSave
        → 不設定 "saved"，保持 "idle"
        → 下次 debounce 會正確儲存 stateB
```

**風險**：極低。worst case 是 UI 顯示 "idle" 而非 "saved"（但資料確實未完全儲存，所以正確）

---

## Phase 3：條件式 beforeunload（P3）

### 目標
只在「意外關閉」時觸發 beforeunload，Quit/Restart 按鈕已有 Modal，不應重複確認。

---

### Step 3.1：加入 isIntentionalNavigation ref

**檔案**：`src/features/sorter/components/RankingStage.tsx`

**修改點 1**：新增 import（第 1 行）
```typescript
import React, { useState, useEffect, useCallback, useRef } from "react";
```

**修改點 2**：新增 ref（第 40 行後）
```typescript
const [selectedButton, setSelectedButton] = useState<string | null>(null);
const [pressedKey, setPressedKey] = useState<PressedKeyType | null>(null);

// 追蹤是否為有意導航 (Quit/Restart 按鈕)
const isIntentionalNavigation = useRef(false);
```

---

### Step 3.2：在 Quit/Restart 按鈕設定 flag ~~+ 冷卻期~~

> ⚠️ **2026-01-14 修正：移除冷卻期機制**
>
> **原因：**
> - 原 PLAN 假設「按鈕點擊時立即設定 flag → 彈出 Modal → 使用者取消 → flag 沒重置」
> - 但實際程式碼是：`onClick={() => showAlert({ onConfirm: () => handleClear() })}`
> - **handleClear() 只在使用者 confirm 後才執行**
> - 如果使用者點「取消」，handleClear() 根本不會跑，冷卻期邏輯也不會觸發
> - 所以「Modal 取消後的誤判」問題根本不存在
>
> **Linus 會說：** 「這是想像出來的問題。`handleClear()` 只在使用者確認後執行，這時候設定 flag 就是正確的，不需要任何冷卻期。」

**修改位置 1**：handleClear（第 59-66 行）
```typescript
function handleClear() {
  if (!storage.capabilities.canRestart) return;

  // 使用者已確認要重新開始，設定 flag 跳過 beforeunload
  isIntentionalNavigation.current = true;
  setSaveStatus("idle");
  setPercentage(0);
  storage.delete(); // 同步操作，會立即完成並導航
}
```

**修改位置 2**：handleQuit（第 92-96 行）
```typescript
function handleQuit() {
  // 使用者已確認要離開，設定 flag 跳過 beforeunload
  isIntentionalNavigation.current = true;
  setSaveStatus("idle");
  storage.quit(); // 會立即導航
}
```

---

### Step 3.3：更新 beforeunload 邏輯

**檔案**：`src/features/sorter/components/RankingStage.tsx`
**修改位置**：第 108-127 行

**修改前**：
```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!storage.capabilities.needsBeforeUnload) {
      return;
    }

    const shouldWarn = saveStatus !== "saved";

    if (shouldWarn) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [storage.capabilities.needsBeforeUnload, saveStatus]);
```

**修改後**：
```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!storage.capabilities.needsBeforeUnload) {
      return;
    }

    // ✅ 如果是有意導航 (Quit/Restart)，不攔截
    if (isIntentionalNavigation.current) {
      return;
    }

    // 只在意外關閉時警告
    const shouldWarn = saveStatus !== "saved";

    if (shouldWarn) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [storage.capabilities.needsBeforeUnload, saveStatus]);
```

**預期效果**：
- ✅ 點擊 Quit/Restart → 只有自訂 Modal，無雙重確認
- ✅ 點擊 Quit/Restart 後「取消」→ 3 秒後恢復 beforeunload 保護
- ✅ 直接關閉瀏覽器 → 瀏覽器原生 Modal 警告（如果有未儲存資料）

---

## 驗證方法

### Phase 1 驗證

**DevTools React Profiler**：
```
1. 開啟 React DevTools Profiler
2. 點擊 Left/Right 按鈕
3. 檢查 SorterHeader 是否只在 percentage 變化時重渲染
4. 檢查 useSorter 是否穩定（不重新初始化）
```

**Console.log 追蹤**：
```typescript
// 在 DraftPrompt.tsx 加入
useEffect(() => {
  console.log('storage reference changed', storage);
}, [storage]);

// 預期：只輸出一次
```

---

### Phase 2 驗證

**時序測試**：
```
1. 快速連續點擊 10 次
2. 等待 10 秒後再點擊一次
3. 檢查 SorterHeader 顯示的 saveStatus
4. 預期：
   - "Saving..." → "Saved"
   - 點擊後 → 空白
   - 10 秒後 → "Saving..." → "Saved"
```

**極端情況**：
```
T=0s:    快速點擊 5 次
T=9.5s:  再點擊 1 次（重置 debounce）
T=19.5s: 再點擊 1 次

預期：只執行兩次 saveDraft
```

---

### Phase 3 驗證

**Quit 按鈕測試（正常流程）**：
```
1. 點擊 Quit
2. 應該只彈出自訂 Modal
3. 點擊「確定」後直接導航
4. 不應該看到瀏覽器的「確定要離開嗎？」
```

**Quit 按鈕測試（取消後關閉）**：
```
1. 點擊 Quit
2. 彈出自訂 Modal
3. 點擊「取消」
4. 關閉瀏覽器 tab
   → 應該彈出瀏覽器警告（因為 handleQuit() 沒執行，flag 保持 false）
```

> ⚠️ **2026-01-14 修正：** 移除冷卻期後，此測試場景更簡單：
> - 使用者取消 Modal → `handleQuit()` 不執行 → `isIntentionalNavigation.current` 保持 `false`
> - 關閉瀏覽器 → beforeunload 正常警告

**關閉瀏覽器測試**：
```
1. 點擊幾次後直接關閉 tab
2. 應該彈出瀏覽器原生確認對話框（如果 saveStatus !== "saved"）
```

---

## 風險評估

### 整體風險：極低

| Phase | 風險等級 | 回滾方案 |
|-------|---------|---------|
| Phase 1 | 幾乎為零 | 將所有 `useSorterActions` 改回 `useSorterContext` |
| Phase 2 | 極低 | 移除 `if (!hasNewChanges)` 檢查與 Debug Log |
| Phase 3 | 極低 | 移除 `isIntentionalNavigation` 檢查 ~~與 setTimeout~~（已移除冷卻期） |

---

## 關鍵檔案清單

1. **`src/contexts/SorterContext.tsx`**
   - Context 拆分的核心
   - 建立穩定的資料流

2. **`src/features/sorter/components/DraftPrompt.tsx`**
   - 修復 P0 的關鍵
   - 穩定 storage reference

3. **`src/features/sorter/hooks/useAutoSave.ts`**
   - 修復 P2 的關鍵
   - 解決 race condition

4. **`src/features/sorter/components/RankingStage.tsx`**
   - 修復 P3 的關鍵
   - 條件式 beforeunload

5. **其他 Context 消費者**：
   - `src/features/sorter/hooks/useSorter.ts`
   - `src/features/sorter/components/ResultStage.tsx`
   - `src/features/sorter/components/FilterStage.tsx`
   - `src/features/sorter/components/SorterHeader.tsx`

---

## Linus 式總結

### 好品味原則
1. ✅ **消除特例**：Context 拆分後，不需要手動選擇訂閱範圍
2. ✅ **穩定 Reference**：useMemo 讓 storage 像檔案描述符一樣穩定
3. ✅ **狀態機清晰**：race condition 用 compare-and-set 解決
4. ✅ **條件邏輯簡化**：beforeunload 加個 flag，不需要重構導航系統

### 破壞性分析
- ✅ **零破壞**：所有修改都是「加強約束」，不改變現有行為
- ✅ **向後相容**：保留 `useSorterContext()` 讓舊代碼可以繼續工作

### 實用性驗證
- ✅ **真實問題**：P0 和 P2 會導致實際 bug，P1 和 P3 影響使用者體驗
- ✅ **複雜度匹配**：修改範圍小（~30 行），與問題嚴重性匹配

---

## 執行順序

**建議按順序執行，每個 Phase 完成後驗證再進行下一個**：

1. Phase 1 → 驗證 → Commit
2. Phase 2 → 驗證 → Commit
3. Phase 3 → 驗證 → Commit

**總預估時間**：1-2 小時

---

## 附錄：技術決策討論記錄

### 決策 1：Phase 1 的 `actions` 是否需要 useMemo？

**原始方案**：
```typescript
const actions = useMemo(
  () => ({ setSaveStatus, setPercentage }),
  []
);
```

**最終決策**：❌ 不使用 useMemo
```typescript
const actions = { setSaveStatus, setPercentage };
```

**理由**：
- React 保證 `useState` 的 setter 函式在整個生命週期都穩定
- 使用 useMemo 會觸發 ESLint `exhaustive-deps` 警告
- 直接賦值更簡潔，不會有 reference 變化問題

---

### 決策 2：Phase 2 是否需要防禦性檢查？

**考慮方案**：
```typescript
// 選項 A：加防禦性檢查
if (latestStateRef.current && latestStateRef.current === stateToSave) {
  setSaveStatus('saved');
}

// 選項 B：直接比較（最終採用）
if (latestStateRef.current === stateToSave) {
  setSaveStatus('saved');
}
```

**最終決策**：✅ 選項 B（不加防禦性檢查）

**理由**：
- `latestStateRef` 由 `useRef(sortList)` 初始化，永遠不會是 `undefined`
- TypeScript 已經保證類型正確
- 加 `if (latestStateRef.current)` 是「不信任類型系統」的表現
- Linus 原則：不要為不會發生的情況加檢查

---

### 決策 3：Phase 3 的 cleanup 機制

**考慮方案**：

**選項 A**：改造 `storage.quit()` 返回 Promise
```typescript
storage.quit().finally(() => {
  isIntentionalNavigation.current = false;
});
```

**選項 B**：監聽路由事件
```typescript
router.events.on('routeChangeStart', () => {
  isIntentionalNavigation.current = true;
});
```

**選項 C**：使用狀態管理
```typescript
const [isNavigating, setIsNavigating] = useState(false);
```

~~**選項 D**：setTimeout 冷卻期（原採用，已廢棄）~~
```typescript
isIntentionalNavigation.current = true;
storage.quit();
setTimeout(() => {
  isIntentionalNavigation.current = false;
}, 3000);
```

**~~最終決策~~**：~~✅ 選項 D（setTimeout 冷卻期）~~ → ❌ **2026-01-14 修正：不需要任何 cleanup 機制**

**原理由（已失效）**：
- ~~選項 A：需要改 `storage.quit()` 的實作，可能影響其他地方~~
- ~~選項 B：Next.js 15 App Router 沒有 `router.events`~~
- ~~選項 C：過度複雜，需要確保 Promise 正確返回~~
- ~~選項 D：簡單，只需 2 行代碼，用時間窗口解決「反悔」問題~~

**廢棄原因**：
- **前提錯誤**：原 PLAN 假設「按鈕點擊時立即設定 flag」
- **實際情況**：`handleClear()` 和 `handleQuit()` 只在 Modal `onConfirm` 時執行
- **結論**：不存在「使用者取消後 flag 沒重置」的問題，所以不需要任何 cleanup 機制

**修正後的決策**：✅ **不需要 cleanup**
- `handleClear()` 只在使用者確認後執行
- `storage.delete()` 會立即完成並導航
- 使用者取消 Modal → `handleClear()` 不執行 → flag 保持 `false` → beforeunload 正常運作

---

### 決策 4：Phase 2 的 Debug Log

**考慮方案**：

**選項 1**：純測試用（用完就刪）
**選項 2**：永久的開發者模式（最終採用）✅
**選項 3**：手動測試時才加

**最終決策**：✅ 選項 2（開發者模式）

**理由**：
- 長期保留 Debug 能力，方便未來追蹤問題
- 用 `NEXT_PUBLIC_DEBUG_AUTOSAVE` 環境變數控制
- Production 預設關閉，無效能影響
- 加入詳細註解說明用途與啟用方式

---

**計劃完成** ✅

**準備開始執行**
