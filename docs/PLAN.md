# 排名表格排序與點擊區域優化計畫

**計畫日期**：2025-11-27（v2.0 更新）
**目標**：優化 RankingTable 的排序控制與使用者體驗
**影響範圍**：`src/features/ranking/table/`
**已確認方案**：方案 B（配置驅動）

---

## 一、需求背景

### 使用者需求
1. **可選擇性排序**：`rank` 欄位不應該可以點擊排序（虛擬索引，排序無意義）
2. **精確點擊區域**：Header 的可點擊區域應限縮至「文字 + 圖示」，而非整個格子

### 現況分析

#### 1.1 當前排序機制
- **位置**：[WindowVirtualizedTable.tsx:150-151](src/features/ranking/table/components/WindowVirtualizedTable.tsx#L150-L151)
- **實現**：TanStack Table 預設所有欄位皆可排序
- **判斷邏輯**：
  ```typescript
  const canSort = header.column.getCanSort();  // 目前所有欄位都是 true
  const sortState = header.column.getIsSorted();
  ```

#### 1.2 當前點擊區域
- **位置**：[WindowVirtualizedTable.tsx:163-191](src/features/ranking/table/components/WindowVirtualizedTable.tsx#L163-L191)
- **問題**：整個 `<TableHead>` 都可點擊
  ```typescript
  <TableHead
      className={cn(
          "sticky top-0 z-10",
          isLeftAligned ? "" : "justify-end",
          canSort && "-m-1 cursor-pointer select-none rounded p-1 hover:text-foreground"
      )}
  >
      <div onClick={header.column.getToggleSortingHandler()}>
          {/* ❌ 外層 div 綁定點擊，整個格子都可點 */}
      </div>
  </TableHead>
  ```

---

## 二、技術方案選擇

### ✅ 採用方案 B：配置驅動方案

#### 選擇理由
1. **符合專案架構**：專案已用 `COLUMN_CONFIGS` 統一管理欄位屬性（`size`、`className` 等）
2. **單一真相來源**：一眼看出哪些欄位可排序，配置即文件
3. **易於擴展**：未來加 `filterable`、`resizable` 同理
4. **消除特殊情況**：符合 Linus 的「好品味」哲學

#### 核心思想
```typescript
// 將「排序能力」視為欄位的固有屬性，而非運行時邏輯
const COLUMN_CONFIGS = {
    rank: { sortable: false },   // ✅ 虛擬索引，禁用排序
    name: { /* 省略 sortable */ }, // ✅ 預設 true，可排序
    peak: { /* 省略 sortable */ }, // ✅ 預設 true，可排序
};
```

---

## 三、實現細節

### 3.1 需求一：禁用 `rank` 欄位排序

#### Step 1：擴展型別定義

**修改檔案**：`src/features/ranking/table/utils/columnFactory.tsx`
**修改位置**：L10-16

```typescript
// 原本
export type ColumnConfig = {
  key: string;
  header: string;
  type: ColumnType;
  size?: number;
  className?: string;  // 已存在
};

// 修改後（新增 sortable 屬性）
export type ColumnConfig = {
  key: string;
  header: string;
  type: ColumnType;
  size?: number;
  className?: string;
  sortable?: boolean;  // ✅ 新增：預設 true（可排序）
};
```

---

#### Step 2：更新 COLUMN_CONFIGS

**修改檔案**：`src/features/ranking/table/utils/columnFactory.tsx`
**修改位置**：L21-79

**只需修改 `rank` 欄位**：
```typescript
export const COLUMN_CONFIGS: Record<string, ColumnConfig> = {
  rank: {
    key: "rank",
    header: "",
    type: "rank",
    size: 45,
    sortable: false,  // ✅ 新增：禁用排序
  },
  name: {
    key: "name",
    header: "Track",
    type: "track",
    // ✅ 省略 sortable，預設為 true
  },
  rankChange: {
    key: "rankChange",
    header: "",
    type: "change",
    size: 45,
    // ✅ 保留排序功能（使用者確認很重要）
  },
  peak: {
    key: "peak",
    header: "Peak",
    type: "number",
    size: 140,
    // ✅ 省略 sortable，預設為 true
  },
  // ... 其餘欄位維持現狀，預設可排序
};
```

---

#### Step 3：修改工廠函數（5 個）

**修改檔案**：`src/features/ranking/table/utils/columnFactory.tsx`
**修改位置**：L82-165

**需修改的函數清單**：
1. `createRankingColumn`（L82-88）
2. `createTrackColumn`（L90-96）
3. `createNumberColumn`（L98-107）
4. `createChangeColumn`（L109-140）
5. `createAchievementColumn`（L142-165）

**實際語法**（使用簡化物件語法，非 `columnHelper.accessor()`）：

```typescript
// 1. createRankingColumn
export const createRankingColumn = (
  config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
  accessorKey: config.key,
  header: () => config.header,
  size: config.size,
  enableSorting: config.sortable ?? true,  // ✅ 新增
});

// 2. createTrackColumn
export const createTrackColumn = (
  config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
  accessorKey: config.key,
  header: () => config.header,
  enableSorting: config.sortable ?? true,  // ✅ 新增
  cell: ({ row }) => <TrackCell item={row.original} />,
});

// 3. createNumberColumn
export const createNumberColumn = (
  config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
  accessorKey: config.key,
  header: () => config.header,
  size: config.size,
  enableSorting: config.sortable ?? true,  // ✅ 新增
  cell: ({ row }) => (
    <div className="text-right">
      {row.original[config.key as keyof RankingListDataTypeExtend] ?? "-"}
    </div>
  ),
});

// 4. createChangeColumn
export const createChangeColumn = (
  config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
  accessorKey: config.key,
  header: () => config.header,
  size: config.size,
  enableSorting: config.sortable ?? true,  // ✅ 新增
  cell: ({ row }) => {
    // ... 現有實現保持不變
  },
});

// 5. createAchievementColumn
export const createAchievementColumn = (
  config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
  accessorKey: config.key,
  header: () => config.header,
  size: config.size,
  enableSorting: config.sortable ?? true,  // ✅ 新增
  cell: ({ row }) => {
    // ... 現有實現保持不變
  },
});
```

---

### 3.2 需求二：縮小點擊區域（選項 A：純內容）

**修改檔案**：`src/features/ranking/table/components/WindowVirtualizedTable.tsx`
**修改位置**：L163-191

#### Before（整個格子可點擊）
```typescript
<TableHead
    key={header.id}
    style={header.getSize() !== 150 ? { width: `${header.getSize()}px` } : {}}
    className={cn(
        "sticky top-0 z-10",
        isLeftAligned ? "" : "justify-end",
        canSort && "-m-1 cursor-pointer select-none rounded p-1 hover:text-foreground"
    )}
>
    {header.isPlaceholder ? null : (
        <div
            className="flex items-center gap-2 text-secondary-foreground"
            onClick={header.column.getToggleSortingHandler()}  // ❌ 外層點擊
        >
            {flexRender(header.column.columnDef.header, header.getContext())}
            {canSort && (
                <div>
                    {sortState === "asc" && <ArrowUp className="size-3.5" />}
                    {sortState === "desc" && <ArrowDown className="size-3.5" />}
                    {!sortState && <ArrowUpDown className="size-3.5 opacity-50" />}
                </div>
            )}
        </div>
    )}
</TableHead>
```

#### After（只有「文字 + 圖示」可點擊）
```typescript
<TableHead
    key={header.id}
    style={header.getSize() !== 150 ? { width: `${header.getSize()}px` } : {}}
    className={cn(
        "sticky top-0 z-10",
        isLeftAligned ? "" : "justify-end"
        // ✅ 移除外層的 cursor-pointer 和 hover 樣式
    )}
>
    {header.isPlaceholder ? null : (
        <div className="flex items-center gap-2 text-secondary-foreground">
            {canSort ? (
                // ✅ 可排序：用 <button> 包裹，精確控制點擊區域
                <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                        "flex items-center gap-1.5",
                        "appearance-none bg-transparent border-0 p-0",
                        "cursor-pointer hover:text-foreground transition-colors"
                    )}
                >
                    <span>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                    </span>
                    {sortState === "asc" && <ArrowUp className="size-3.5" />}
                    {sortState === "desc" && <ArrowDown className="size-3.5" />}
                    {!sortState && <ArrowUpDown className="size-3.5 opacity-50" />}
                </button>
            ) : (
                // ✅ 不可排序：純文字，無點擊事件
                <span>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                </span>
            )}
        </div>
    )}
</TableHead>
```

---

### 3.3 關鍵技術細節

#### TanStack Table 自動處理機制
```typescript
// 欄位定義時設定 enableSorting: false
const column = { enableSorting: false };

// ↓ TanStack Table 內部自動處理

header.column.getCanSort()              // → 回傳 false
header.column.getToggleSortingHandler() // → 回傳 undefined
```

**渲染邏輯**：
```typescript
const canSort = header.column.getCanSort();  // rank 欄位會是 false

{canSort ? <button onClick={...} /> : <span />}
// ✅ rank 欄位直接渲染 <span>，無點擊事件
```

---

#### Button Reset 樣式說明

**Tailwind CSS 類別**：
```typescript
"appearance-none"    // 移除瀏覽器預設樣式
"bg-transparent"     // background: transparent
"border-0"           // border: none
"p-0"                // padding: 0（純內容，無額外 padding）
```

**為什麼需要 reset**：
```css
/* 瀏覽器預設 button 樣式 */
button {
    background-color: ButtonFace;
    border: 2px outset ButtonBorder;
    padding: 1px 6px;
}

/* Reset 後變成透明按鈕 */
button.appearance-none.bg-transparent.border-0.p-0 {
    background: transparent;
    border: none;
    padding: 0;
}
```

---

## 四、影響評估

### 4.1 修改範圍

| 項目 | 修改檔案 | 修改行數 | 風險等級 |
|------|---------|---------|---------|
| 型別定義 | `columnFactory.tsx` | +1 行 | 🟢 低 |
| COLUMN_CONFIGS | `columnFactory.tsx` | +1 行 | 🟢 低 |
| 工廠函數（5 個） | `columnFactory.tsx` | +5 行 | 🟢 低 |
| Header 渲染邏輯 | `WindowVirtualizedTable.tsx` | ~30 行 | 🟡 中 |
| **總計** | **2 個檔案** | **~37 行** | 🟢 **低風險** |

### 4.2 破壞性分析

#### ✅ 零破壞性變更
- `enableSorting` 是 TanStack Table 原生 API
- 只禁用 `rank` 欄位排序，其餘欄位維持原功能
- 不影響虛擬化列表渲染
- 不影響搜尋與過濾功能

#### ⚠️ 使用者體驗變化
1. **點擊熱區縮小**：
   - Before：整個格子（150px+）
   - After：文字 + 圖示（60-80px）
   - 影響：減少誤觸，但需要使用者適應

2. **視覺回饋調整**：
   - Before：整個格子 hover 變色
   - After：只有按鈕區域 hover 變色
   - 影響：更精確的視覺提示

---

## 五、確認事項（已完成）

### ✅ 5.1 禁用欄位清單
| 欄位 | Config Key | 決定 | 理由 |
|------|-----------|------|------|
| Rank | `rank` | ❌ **禁用** | 虛擬索引（`row.index + 1`），排序無意義 |
| Track | `name` | ✅ 保留 | 核心排序需求 |
| Change | `rankChange` | ✅ **保留** | 使用者確認很重要（排序變化量有價值） |
| Peak | `peak` | ✅ 保留 | 統計數據排序 |
| Average | `average` | ✅ 保留 | 統計數據排序 |
| Weeks | `weeks` | ✅ 保留 | 統計數據排序 |
| Points | `points` | ✅ 保留 | 統計數據排序 |

### ✅ 5.2 點擊熱區選擇
- **選項 A**：`p-0`（純內容，約 60-80px）✅ 已採用

### ✅ 5.3 實現方案選擇
- **方案 B**：配置驅動 ✅ 已採用

### ⏭️ 5.4 無障礙性（後續優化）
- `aria-label` 和 `aria-sort`：暫不處理，列入後續優化

---

## 六、實現步驟

### Step 1：修改型別定義
**檔案**：`src/features/ranking/table/utils/columnFactory.tsx` (L10-16)
```typescript
// 在 ColumnConfig 中新增 sortable?: boolean
```

### Step 2：更新 COLUMN_CONFIGS
**檔案**：`src/features/ranking/table/utils/columnFactory.tsx` (L21-79)
```typescript
// 只在 rank 欄位加入 sortable: false
```

### Step 3：修改工廠函數
**檔案**：`src/features/ranking/table/utils/columnFactory.tsx` (L82-165)
```typescript
// 在 5 個 create*Column 函數中加入：
enableSorting: config.sortable ?? true,
```

### Step 4：重構 Header 渲染
**檔案**：`src/features/ranking/table/components/WindowVirtualizedTable.tsx` (L163-191)
```typescript
// 1. 移除外層 cursor-pointer 和 hover 樣式
// 2. 用 <button> 包裹可排序欄位
// 3. 不可排序欄位渲染 <span>
```

### Step 5：測試驗證
1. ✅ `rank` 欄位無法點擊排序
2. ✅ 其他欄位只有文字 + 圖示區域可點擊
3. ✅ hover 樣式只在可點擊區域生效
4. ✅ 排序功能正常（升序 → 降序 → 無排序）

---

## 七、預期效果

### 7.1 使用者體驗提升

**Before：**
- 所有欄位都可排序，包含無意義的 `rank` 欄位
- 整個格子都可點擊，容易誤觸
- 點擊 `rank` 欄位排序後，使用者困惑（排序結果永遠是 1, 2, 3...）

**After：**
- `rank` 欄位無法排序，符合邏輯預期
- 點擊區域精確（純內容），減少誤觸
- 視覺回饋清晰（hover 只在可點擊區域生效）

---

### 7.2 程式碼品質提升

**配置驅動的優勢**：
1. **單一真相來源**：`COLUMN_CONFIGS` 即文件，一眼看出欄位能力
2. **易於擴展**：未來加 `filterable`、`resizable` 同理
3. **消除特殊情況**：不用在渲染階段寫 `if/else`
4. **型別安全**：TypeScript 自動檢查配置完整性

---

## 八、品味評分

### 🟢 好品味之處

1. **利用型別系統**：使用 TanStack Table 原生 API（`enableSorting`），而非自己寫邏輯
2. **關注點分離**：排序能力在配置階段定義，渲染階段只負責呈現
3. **零破壞性**：不影響現有功能，純增強體驗
4. **語義化 HTML**：用 `<button>` 替代 `<div onClick>`，符合無障礙標準

### 🟡 後續優化空間

1. **無障礙性**：加入 `aria-label`、`aria-sort` 提升螢幕閱讀器支援
2. **觸控裝置**：使用 `@media (pointer: coarse)` 增加熱區
3. **鍵盤導航**：確保 Tab 鍵可聚焦按鈕

---

## 九、後續建議（非本次範圍）

### 9.1 進一步優化

1. **欄位可見性控制**：使用者可選擇顯示/隱藏欄位
2. **欄位寬度調整**：拖曳調整欄位寬度
3. **多欄位排序**：按住 Shift 點擊進行多欄位排序
4. **排序狀態持久化**：記住使用者的排序偏好（localStorage）

### 9.2 潛在風險

1. **使用者習慣**：若原本習慣點擊整個格子，可能需要 1-2 週適應期
   - 緩解：保留明顯的 hover 效果（`transition-colors`）

2. **觸控裝置**：小螢幕上 60-80px 的點擊區域可能偏小
   - 緩解：後續可用 CSS 媒體查詢增加行動版熱區

---

## 十、總結

### 核心洞察

這是一個典型的「資料驅動 UI」問題：

```
欄位的排序能力 = 欄位的固有屬性（Like size, className）
↓
應該在資料層（COLUMN_CONFIGS）定義
↓
而非在視圖層（WindowVirtualizedTable）判斷
```

### Linus 式評價

**【品味評分】**：🟢 好品味
**【關鍵洞察】**：將互動能力視為欄位屬性，而非運行時邏輯
**【實用性驗證】**：解決真實的 UX 問題（誤觸、無意義排序）
**【破壞性分析】**：零破壞性，向後相容

---

**文件版本**：v2.0（已確認需求，可執行）
**計畫者**：Linus AI
**狀態**：✅ 已確認，待執行
**確認事項**：
- ✅ 只禁用 `rank` 欄位
- ✅ 採用方案 B（配置驅動）
- ✅ 點擊熱區選項 A（`p-0` 純內容）
- ⏭️ 無障礙性後續優化
