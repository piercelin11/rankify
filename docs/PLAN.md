# Code Review - feat/sorter-optimization 分支

**審查日期**：2025-11-21
**審查範圍**：當前分支相對於 main 的所有變更

---

## 變更摘要

### Commits
1. `9651181` - fix(sorter): 修復排序系統流程與拖曳功能的關鍵問題
2. `2ede6a8` - refactor(ranking): 統一 calculateAlbumPoints 演算法

### 變更檔案
- `src/features/sorter/actions/completeSubmission.ts`
- `src/features/sorter/components/DraftPrompt.tsx`
- `src/features/sorter/components/ResultStage.tsx`
- `src/app/(main)/artist/[artistId]/(artist)/my-stats/page.tsx`

---

## 【品味評分】 🟡 湊合

變更解決了真實問題（演算法統一、流程修復），但有幾個技術細節需要調整。

---

## 需要調整的項目

### 1. ❌ ResultStage.tsx - `handleSubmit` 缺少 await

**檔案**：`src/features/sorter/components/ResultStage.tsx`
**行號**：~L128

**當前程式碼**：
```typescript
const handleSubmit = () => {
    completeSubmission({ trackRankings: result, submissionId });
    router.push(`/artist/${tracks[0].artistId}/my-stats/${submissionId}`)
};
```

**問題**：
- `completeSubmission` 是 async server action，但沒有 `await`
- 導航可能在資料庫寫入完成前就發生
- 可能導致使用者看到舊資料或錯誤

**建議修復**：
```typescript
const handleSubmit = async () => {
    await completeSubmission({ trackRankings: result, submissionId });
    router.push(`/artist/${tracks[0].artistId}/my-stats/${submissionId}`)
};
```

**優先級**：🔴 高

---

### 2. ❌ ResultStage.tsx - `tracks[0]` 無防禦性檢查

**檔案**：`src/features/sorter/components/ResultStage.tsx`
**行號**：L129, L143

**當前程式碼**：
```typescript
router.push(`/artist/${tracks[0].artistId}/my-stats/${submissionId}`)
// ...
router.push(`/artist/${tracks[0].artistId}/my-stats`)
```

**問題**：
- 如果 `tracks` 為空陣列，`tracks[0]` 會是 `undefined`
- 會導致 `Cannot read property 'artistId' of undefined` 錯誤

**建議修復**：
```typescript
// 在 component 入口處加 fail-fast 檢查
if (tracks.length === 0) {
    console.error('ResultStage: tracks array is empty - this should not happen');
    router.push('/');
    return null;
}

// 提取 artistId 常數，避免重複存取
const artistId = tracks[0].artistId;

// 之後統一使用
router.push(`/artist/${artistId}/my-stats/${submissionId}`)
router.push(`/artist/${artistId}/my-stats`)
```

**說明**：
- 理論上不會發生，但加上防禦性檢查
- 使用 console.error 在開發時能快速發現問題
- 導回首頁避免使用者卡在錯誤狀態

**優先級**：🔴 高

---

### 3. ✅ ResultStage.tsx - beforeunload handler 需加回 returnValue

**檔案**：`src/features/sorter/components/ResultStage.tsx`
**行號**：L89-91

**當前程式碼**：
```typescript
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
};
```

**修復方案**：
```typescript
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = ''; // 跨瀏覽器相容，值會被忽略但設值動作必要
};
```

**說明**：VSCode 標示「廢除」是指自訂訊息功能，但設值動作仍是觸發警告的必要條件。

**優先級**：🟢 確認修復

---

### 4. ✅ DraftPrompt.tsx - percent === 0 時跳過 Modal 的邏輯

**檔案**：`src/features/sorter/components/DraftPrompt.tsx`
**行號**：L47-55

**背景**：
- 使用者從 FilterStage 進入 RankingStage 時，草稿 percent = 0
- 原本會跳出「是否繼續？」的 Modal，流程不直觀
- 現在改為直接進入排序

**問題**：
- 如果使用者過濾完成後離開，再重新進入同歌手排名，應該要詢問是否有草稿
- 需要區分「剛從 FilterStage 進來」vs「離開後重新進入」

**解決方案：sessionStorage flag**

```typescript
// FilterStage.tsx - 進入排序時設置 flag
const handleStartRanking = () => {
    sessionStorage.setItem('justFiltered', 'true');
    // ... 建立草稿並導向
};

// DraftPrompt.tsx - 檢查並清除 flag
const justFiltered = sessionStorage.getItem('justFiltered');
if (justFiltered) {
    sessionStorage.removeItem('justFiltered');
}

if (draftState.percent === 0 && justFiltered) {
    // 剛從 FilterStage 來，直接進入排序
    return <RankingStage ... />;
}
// 否則顯示 Modal 詢問
```

**優點**：
- 直接表達意圖：「我剛從 FilterStage 來」
- 不依賴時間計算，避免 magic number 和時鐘問題
- 頁面重整或關閉後 flag 自動清除

**優先級**：🟢 確認修復

---

### 5. 🔵 my-stats/page.tsx - return null（暫不處理）

**檔案**：`src/app/(main)/artist/[artistId]/(artist)/my-stats/page.tsx`

**狀態**：已有 TODO 標記，使用者確認之後再處理。

**優先級**：🔵 延後

---

### 6. 💭 ResultStage.tsx - useOptimistic 被移除的決策

**檔案**：`src/features/sorter/components/ResultStage.tsx`

**變更**：
```typescript
// 舊版
const [initialResult, setInitialResult] = useState<RankingResultData[]>([]);
const [optimisticResult, setOptimisticResult] = useOptimistic(
    initialResult,
    (_, newResult: RankingResultData[]) => newResult
);

// 新版
const [result, setResult] = useState<RankingResultData[]>([]);
```

**分析**：
- 拖曳操作目前是純本地狀態，不需要 `useOptimistic`
- 移除是合理的簡化
- ✅ 這是好品味

**但要注意**：
- 如果未來要加入「拖曳後自動儲存」功能，需要重新考慮

**優先級**：✅ 已是好的決策

---

## 好的變更（不需調整）

### ✅ calculateAlbumPoints 演算法統一

```typescript
// 從
import { calculateAlbumPoints } from "../utils/calculateAlbumPoints";

// 改為
import { calculateAlbumPoints } from "@/features/ranking/utils/calculateAlbumPoints";
```

**評價**：
- 消除技術債
- 單一真相來源
- 資料轉換乾淨：`.map(t => ({ albumId: t.albumId, rank: t.ranking }))`

### ✅ DraftPrompt 處理 finishFlag 的邏輯

```typescript
if (draftState.finishFlag === 1) {
    return <ResultStage ... />
}
```

**評價**：
- 處理「排序完成但未提交」的草稿
- 直接進入結果頁面，合理

### ✅ Modal 顯示進度百分比

```typescript
Progress: {Math.round(draftState.percent)}%. Would you like to continue?
```

**評價**：
- 使用者可以看到上次進度
- 幫助決策是否繼續

---

## 建議的修復優先級

| # | 問題 | 優先級 | 估計時間 |
|---|------|--------|---------|
| 1 | handleSubmit 缺少 await | 🟢 確認 | 2 分鐘 |
| 2 | tracks[0] 無防禦性檢查 | 🟢 確認 | 3 分鐘 |
| 3 | beforeunload 加回 returnValue | 🟢 確認 | 1 分鐘 |
| 4 | percent === 0 加時間戳檢查 | 🟢 確認 | 5 分鐘 |
| 5 | return null 改為友善 UI | 🔵 延後 | - |

**本次修復**：#1, #2, #3, #4（約 11 分鐘）

---

## 後續建議

1. **修復高優先級問題後再 merge**
2. **考慮加入 loading 狀態**：handleSubmit 執行時顯示 loading
3. **統一 artistId 的取得方式**：考慮從 props 或 context 取得，而非 `tracks[0]`

---

**文件版本**：v1.0
**審查者**：Linus AI
**狀態**：待修復
