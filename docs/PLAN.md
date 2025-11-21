# calculateAlbumPoints 遷移計劃

**建立時間**：2025-11-20
**負責人**：Linus AI
**預計工時**：15 分鐘

---

## 執行摘要

統一 `calculateAlbumPoints` 演算法，消除新舊兩版本並存的技術債。

**當前狀況**：
- ✅ **新版**：`src/features/ranking/utils/calculateAlbumPoints.ts`（已被 80% 模組採用）
- ❌ **舊版**：`src/features/sorter/utils/calculateAlbumPoints.ts`（僅 `completeSubmission` 使用）

**目標**：
1. 遷移 `completeSubmission.ts` 到新版演算法
2. 刪除舊版檔案
3. 執行數據遷移腳本統一歷史數據

---

## 問題診斷

### 【當前狀況】

#### 檔案分佈

| 檔案 | 使用者 | 狀態 |
|------|--------|------|
| `src/features/ranking/utils/calculateAlbumPoints.ts` | `updateAlbumStats.ts`<br>`recalculateAlbumScores.ts` | ✅ 新版 |
| `src/features/sorter/utils/calculateAlbumPoints.ts` | `completeSubmission.ts` | ❌ 舊版 |

#### 核心問題

**技術債**：兩套演算法並存，違反「單一真相來源」原則

```typescript
// completeSubmission.ts (舊演算法)
calculateAlbumPoints(trackRankings)

// updateAlbumStats.ts (新演算法)
calculateAlbumPoints(virtualRankings)

// recalculateAlbumScores.ts (新演算法)
calculateAlbumPoints(...)
```

---

## 新舊版本差異分析

### 【函式簽名】

**舊版**：
```typescript
function calculateAlbumPoints(trackRankings: RankingResultData[])
//                                           ^^^^^^^^^^^^^^^^^^
//                                           完整 TrackData + ranking
```

**新版**：
```typescript
function calculateAlbumPoints(trackRankings: TrackRankingsType[])
//                                           ^^^^^^^^^^^^^^^^^^
//                                           {albumId, rank}[]
```

### 【參數差異】

| 特徵 | 舊版 (`RankingResultData`) | 新版 (`TrackRankingsType`) |
|------|---------------------------|---------------------------|
| 型別定義 | `TrackData & {ranking: number}` | `{albumId: string \| null, rank: number}` |
| 繼承關係 | 繼承完整 TrackData | 無繼承，inline 定義 |
| 必要欄位 | `albumId`, `ranking` | `albumId`, `rank` |
| 額外欄位 | name, img, artistId, album, artist, etc. | 無 |
| 欄位名稱 | `ranking` | `rank` |

### 【演算法差異】

#### 1. 分數係數調整（防止神曲主導）

**舊版**：
```typescript
const score =
    percentileRank > 0.75 ? percentileRank * 1000
  : percentileRank > 0.5  ? percentileRank * 950
  : percentileRank > 0.25 ? percentileRank * 650
  :                         percentileRank * 500;
```

**新版**：
```typescript
const score =
    percentileRank > 0.75 ? percentileRank * 900   // ↓ 降低 100
  : percentileRank > 0.5  ? percentileRank * 700   // ↓ 降低 250
  : percentileRank > 0.25 ? percentileRank * 500   // ↓ 降低 150
  :                         percentileRank * 400;  // ↓ 降低 100
```

**目的**：降低頂級歌曲的分數優勢，讓專輯整體品質更重要

#### 2. 短專輯懲罰減輕（給單曲機會）

**舊版**：
```typescript
const smoothingFactor =
    percentileRank > 0.5 && albumTrackCount < 5
        ? albumTrackCount * 0.15 + 0.25  // 1 track: 0.40
        : 1;
```

**新版**：
```typescript
const smoothingFactor =
    percentileRank > 0.5 && albumTrackCount < 5
        ? albumTrackCount * 0.10 + 0.45  // 1 track: 0.55
        : 1;
```

**目的**：提高單曲基準線（0.40 → 0.55），即使是神曲也能有機會

#### 3. 長專輯懲罰改用冪次（更平滑）

**舊版**（線性懲罰）：
```typescript
const points = Math.floor((score / albumTrackCount) * smoothingFactor);
//                                  ^^^^^^^^^^^^^^
//                                  20 首 → 除以 20
```

**新版**（冪次懲罰）：
```typescript
const points = Math.floor((score / Math.pow(albumTrackCount, 0.8)) * smoothingFactor);
//                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                                  20 首 → 除以 10.99
```

**效果對比**：

| 歌曲數 | 舊版除數 | 新版除數 | 懲罰減輕 |
|--------|---------|---------|---------|
| 5 首   | 5       | 3.62    | 27.6%   |
| 10 首  | 10      | 6.31    | 36.9%   |
| 20 首  | 20      | 10.99   | 45.1%   |

**目的**：讓長專輯不會因為歌曲多而被過度懲罰

---

## Linus 式評估

### 【核心判斷】

✅ **值得做，必須完成**

這不是「要不要遷移」的問題，而是「如何正確完成遷移」的問題。你已經完成了 80% 的工作（`updateAlbumStats` 和 `recalculateAlbumScores` 已遷移），但留下了一個**關鍵的不一致性**：`completeSubmission` 還在用舊演算法。

### 【關鍵洞察】

#### 1️⃣ 資料結構：新版是好品味

**新版型別** (`TrackRankingsType`) 體現了**最小化介面**原則：
- **消除依賴**：不再依賴龐大的 `RankingResultData`
- **只要求需要的欄位**：`albumId`, `rank`
- **去耦合**：`calculateAlbumPoints` 不再綁定 sorter 模組

**舊版的問題**：
```typescript
// 舊版：要求完整的 TrackData，但只用到 2 個欄位
calculateAlbumPoints(trackRankings: RankingResultData[])
//                                  ^^^^^^^^^^^^^^^^^^
//                                  包含 name, img, artist, album...
//                                  但實際只用 albumId 和 ranking
```

這是**過度耦合**。函式應該做一件事，並把它做好。

#### 2️⃣ 複雜度：演算法調整基於真實需求

三個公式改動都有明確目的：

1. **降低分數係數**：防止「一兩首神曲」主導排名
2. **減輕短專輯懲罰**：讓單曲有機會（0.4× → 0.55×）
3. **引入冪次懲罰**：讓長專輯懲罰更平滑

**這不是過度設計，而是基於真實數據的優化。**

#### 3️⃣ 特殊情況：兩套演算法並行

當前狀況：

```
completeSubmission.ts (舊演算法)
    ↓
calculateAlbumPoints (舊版)
    ↓
舊分數計算

updateAlbumStats.ts (新演算法)
    ↓
calculateAlbumPoints (新版)
    ↓
新分數計算
```

這就是**特殊情況**：你有兩套演算法並行。這違反了「單一真相來源」原則。

#### 4️⃣ 破壞性分析：需要數據遷移

**風險點**：
- 新舊演算法會產生**不同的排名結果**
- 如果不處理舊數據，會有**不一致性**

**你已經準備好了**：
- `recalculateAlbumScores.ts` 腳本會重算所有舊數據 ✅
- 採用「刪除後重建」邏輯，確保乾淨狀態 ✅

#### 5️⃣ 實用性驗證：這是真實問題

**你在解決的是**：
- 短專輯被過度懲罰（真實問題）
- 長專輯僅靠數量取勝（真實問題）
- 一兩首神曲主導排名（真實問題）

**不是**：
- 為了重構而重構 ❌
- 純理論的「更優雅」 ❌

### 【品味評分】

🟢 **好品味**（完成遷移後）

這次重構的核心是**簡化**和**統一**，這是好的工程實踐。

---

## 實作步驟

### 【Phase 1：修改程式碼】（10 分鐘）

#### 步驟 1：修改 completeSubmission.ts 的 import

**檔案**：`src/features/sorter/actions/completeSubmission.ts`

**修改位置**：L8

**當前程式碼**：
```typescript
import { calculateAlbumPoints } from "../utils/calculateAlbumPoints";
```

**修改後**：
```typescript
import { calculateAlbumPoints } from "@/features/ranking/utils/calculateAlbumPoints";
```

---

#### 步驟 2：轉換資料格式

**檔案**：`src/features/sorter/actions/completeSubmission.ts`

**修改位置**：L96（`calculateAlbumPoints` 呼叫處）

**當前程式碼**：
```typescript
const albumStats = calculateAlbumPoints(trackRankings);
```

**修改後**：
```typescript
const albumStats = calculateAlbumPoints(
    trackRankings.map(t => ({
        albumId: t.albumId,
        rank: t.ranking  // 注意：欄位名稱從 ranking 改為 rank
    }))
);
```

**說明**：
- 新版需要 `{albumId, rank}[]`，不是完整的 `RankingResultData[]`
- 欄位名稱：`ranking` → `rank`
- 透過 `.map()` 轉換，保持外部介面不變

---

#### 步驟 3：刪除舊版檔案

**檔案**：`src/features/sorter/utils/calculateAlbumPoints.ts`

**操作**：刪除整個檔案

```bash
rm src/features/sorter/utils/calculateAlbumPoints.ts
```

---

### 【Phase 2：品質檢查】（3 分鐘）

#### 步驟 4：執行 TypeScript 檢查

```bash
npx tsc --noEmit
```

**預期結果**：✅ 無型別錯誤

---

#### 步驟 5：執行 Linting

```bash
npm run lint
```

**預期結果**：✅ 無 lint 錯誤

---

### 【Phase 3：數據遷移】（可選，5 分鐘）

#### 步驟 6：執行遷移腳本

```bash
npx tsx scripts/recalculateAlbumScores.ts
```

**作用**：
- 刪除所有舊的 `AlbumRanking` 資料
- 用新演算法重新計算所有專輯分數
- 確保歷史數據與新演算法一致

**注意**：
- 此步驟可選（如果不在意歷史數據的演算法差異）
- 建議在低流量時段執行
- 腳本已有錯誤處理和事務保護

---

## 測試計畫

### 【測試案例 1：基本功能】

1. 建立新的排序提交
2. 完成排序並提交
3. 檢查 `AlbumRanking` 表的 `points` 欄位
4. **預期結果**：
   - 分數使用新演算法計算
   - 短專輯分數提高（相對於舊版）
   - 長專輯分數提高（相對於舊版）

### 【測試案例 2：型別安全】

1. 檢查 TypeScript 編譯
2. **預期結果**：
   - ✅ 無型別錯誤
   - ✅ `.map()` 轉換正確處理欄位名稱差異

### 【測試案例 3：數據一致性】（如果執行遷移腳本）

1. 執行 `recalculateAlbumScores.ts`
2. 比較遷移前後的 `AlbumRanking` 資料
3. **預期結果**：
   - 所有專輯分數被重新計算
   - 使用新演算法
   - 排名順序可能改變（符合預期）

---

## 風險評估

| 風險 | 影響 | 機率 | 緩解措施 |
|------|------|------|---------|
| 欄位名稱錯誤 (`ranking` vs `rank`) | 高 | 低 | TypeScript 會在編譯時報錯 ✅ |
| 演算法變更導致排名改變 | 中 | 高 | 符合預期，執行遷移腳本統一歷史數據 |
| 遷移腳本執行失敗 | 中 | 低 | 腳本已有錯誤處理和事務保護 |
| 舊版檔案被其他地方引用 | 高 | 極低 | 已確認只有 `completeSubmission` 使用 |

---

## 影響範圍

### 【直接影響】

#### 修改的檔案（2 個）

1. `src/features/sorter/actions/completeSubmission.ts`
   - L8：更新 import
   - L96：新增資料轉換

2. `src/features/sorter/utils/calculateAlbumPoints.ts`
   - **刪除整個檔案**

### 【間接影響】

#### 演算法變更的影響

所有未來建立的 `AlbumRanking` 都會使用新演算法：

**分數變化預期**：
- **短專輯**（1-4 首）：分數**提高**（懲罰減輕）
- **長專輯**（10+ 首）：分數**提高**（懲罰更平滑）
- **神曲專輯**（1-2 首頂級歌）：分數**降低**（係數降低）

**排名變化**：
- 原本靠神曲主導的專輯可能排名下降
- 整體品質高的專輯可能排名上升

### 【不受影響】

- `src/features/sorter/types.ts`（`RankingResultData` 型別保持不變）
- `src/features/sorter/components/ResultStage.tsx`（UI 不變）
- `src/features/sorter/utils/convertResult.ts`（轉換邏輯不變）

---

## 驗收標準

### 【必須達成】

- ✅ `completeSubmission.ts` 使用新版 `calculateAlbumPoints`
- ✅ 舊版檔案已刪除
- ✅ `npx tsc --noEmit` 通過
- ✅ `npm run lint` 通過
- ✅ 新建立的排序提交使用新演算法

### 【可選達成】

- ✅ 執行 `recalculateAlbumScores.ts` 重算歷史數據
- ✅ 所有 `AlbumRanking` 使用統一演算法

---

## 回滾計畫

### 【如果遷移失敗】

#### 回滾步驟

1. 還原 `completeSubmission.ts` 的修改
2. 從 git history 恢復舊版 `calculateAlbumPoints.ts`

```bash
git restore src/features/sorter/actions/completeSubmission.ts
git restore src/features/sorter/utils/calculateAlbumPoints.ts
```

#### 替代方案

**方案 A**：保留兩個版本，但重命名以區分

```typescript
// 舊版改名
import { calculateAlbumPoints as calculateAlbumPointsLegacy } from "../utils/calculateAlbumPointsLegacy";

// 新版
import { calculateAlbumPoints } from "@/features/ranking/utils/calculateAlbumPoints";
```

**方案 B**：在 `completeSubmission` 中內聯舊版邏輯

（不推薦，增加維護成本）

---

## 後續優化建議

### 【短期】（本次遷移完成後）

1. **監控分數變化**：
   - 記錄遷移前後的分數分佈
   - 確認變化符合預期

2. **使用者回饋**：
   - 觀察使用者對新排名的反應
   - 收集關於專輯排名的意見

### 【中期】（1 個月內）

1. **定期執行遷移腳本**：
   - 如果發現有遺漏的舊數據
   - 腳本設計為冪等，可重複執行

2. **演算法微調**：
   - 根據真實數據調整係數
   - 考慮引入更多因素（如專輯類型、發行年份）

### 【長期】（3 個月內）

1. **統一計分系統**：
   - 將 `calculateAlbumPoints` 移至 `src/lib/utils/ranking/`
   - 成為所有模組共用的標準函式

2. **加入單元測試**：
   - 測試邊界情況（1 首歌、100 首歌）
   - 測試分數計算公式
   - 測試冪次懲罰邏輯

---

## 附錄

### A. 檔案清單

#### 需要修改

1. `src/features/sorter/actions/completeSubmission.ts`（135 行）
2. `src/features/sorter/utils/calculateAlbumPoints.ts`（69 行，**刪除**）

#### 參考檔案

1. `src/features/ranking/utils/calculateAlbumPoints.ts`（新版演算法）
2. `scripts/recalculateAlbumScores.ts`（數據遷移腳本）
3. `src/services/album/updateAlbumStats.ts`（已使用新版）

### B. 相關技術文件

- **TypeScript Handbook**: [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- **Prisma Docs**: [Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)

---

**文件版本**：v2.0
**最後更新**：2025-11-20
**下次審查**：遷移完成後
