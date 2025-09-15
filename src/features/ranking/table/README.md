# RankingTable 使用指南

基於 @tanstack/react-table 的響應式排名表格元件，支援排序、搜尋、分頁等功能。

## 🚀 快速開始

### 最簡單使用
```typescript
import { RankingTable } from "@/features/ranking/table";

const data = [
  {
    id: "1",
    ranking: 1,
    name: "Love Story",
    img: "/images/song1.jpg",
    artistId: "taylor-swift",
    album: { name: "Fearless" },
    points: 95,
    rankChange: 2,
    weeks: 12
  },
  // ... 更多資料
];

<RankingTable data={data} />
```

### 完整功能使用
```typescript
<RankingTable
  data={data}
  features={{
    sort: true,           // 點擊表頭排序
    search: true,         // 全域搜尋
    pagination: true,     // 分頁功能
    header: true          // 顯示表頭
  }}
  appearance={{
    showImages: true,     // 顯示專輯圖片
    showRankChange: true, // 顯示排名變化
    variant: "default"    // 表格樣式
  }}
/>
```

## 📋 Props 參考

### RankingTableProps

| 屬性 | 類型 | 預設值 | 描述 |
|------|------|--------|------|
| `data` | `RankingItem[]` | - | **必需** 表格資料 |
| `columns` | `ColumnDef<RankingItem>[]` | auto | 自定義欄位定義 |
| `features` | `RankingTableFeatures` | `{}` | 功能開關 |
| `appearance` | `RankingTableAppearance` | `{}` | 外觀設定 |
| `className` | `string` | - | 額外 CSS 類名 |

### RankingTableFeatures

```typescript
type RankingTableFeatures = {
  sort?: boolean;                    // 排序功能
  search?: boolean | {               // 搜尋功能
    placeholder?: string;
    fields?: string[];
  };
  filter?: boolean | {               // 過濾功能 (未來實作)
    fields?: string[];
  };
  pagination?: boolean | {           // 分頁功能
    pageSize?: number;
    showPageSizeSelector?: boolean;
  };
  header?: boolean;                  // 顯示表頭
};
```

### RankingTableAppearance

```typescript
type RankingTableAppearance = {
  variant?: 'default' | 'compact' | 'detailed';
  showImages?: boolean;              // 顯示專輯圖片
  showRankChange?: boolean;          // 顯示排名變化
  density?: 'comfortable' | 'compact' | 'spacious';
};
```

## 🎯 使用範例

### 1. 基本排名列表
```typescript
<RankingTable
  data={tracks}
  features={{ sort: true }}
/>
```

### 2. 帶搜尋的完整表格
```typescript
<RankingTable
  data={tracks}
  features={{
    sort: true,
    search: { placeholder: "搜尋歌曲名稱..." },
    pagination: { pageSize: 20 }
  }}
/>
```

### 3. 自定義欄位
```typescript
import { createRankingColumns } from "@/features/ranking/table";

const customColumns = createRankingColumns({
  showImages: true,
  showRankChange: false,
  customColumns: {
    // 覆寫積分欄位
    points: {
      header: "評分",
      cell: ({ getValue }) => (
        <div className="text-green-500 font-bold">
          {getValue()} 分
        </div>
      )
    }
  }
});

<RankingTable
  data={tracks}
  columns={customColumns}
  features={{ sort: true }}
/>
```

### 4. 手機優化版本
```typescript
<RankingTable
  data={tracks}
  features={{
    search: true,
    pagination: { pageSize: 10 }
  }}
  appearance={{
    variant: "compact",
    showImages: true,
    showRankChange: true
  }}
/>
```

## 📱 響應式設計

元件會根據螢幕大小自動調整：

- **桌面版 (lg+)**：完整表格，所有欄位
- **平板版 (md-lg)**：簡化表格，只顯示核心欄位
- **手機版 (-md)**：卡片列表，垂直佈局

**完全無水平滾動** - 每個斷點都有專門優化的佈局！

## 🔧 內建功能

### 排序
- 點擊表頭自動排序
- 支援升序/降序切換
- 視覺化排序指示器

### 搜尋
- 全域搜尋所有欄位
- 即時過濾結果
- 可自定義 placeholder

### 分頁
- 自動分頁控制
- 可設定每頁數量
- 上/下頁導覽

## 🎨 自定義樣式

### 使用 Tailwind 類名
```typescript
<RankingTable
  data={data}
  className="bg-slate-900 rounded-xl"
/>
```

### 自定義欄位渲染
```typescript
const columns = [
  {
    accessorKey: "name",
    header: "歌曲名稱",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-blue-500">🎵</span>
        <span>{row.original.name}</span>
      </div>
    )
  }
];
```

## ⚠️ 注意事項

1. **資料格式**：確保 `data` 符合 `RankingItem` 介面
2. **圖片路徑**：`img` 路徑需要是有效的圖片 URL
3. **效能**：大量資料建議啟用分頁功能
4. **響應式**：測試不同螢幕尺寸的顯示效果

## 🔄 遷移指南

從舊的 RankingList 元件遷移：

```typescript
// 舊版本
<RankingList
  data={data}
  columns={columns}
/>

// 新版本
<RankingTable
  data={data}
  features={{ sort: true, header: true }}
/>
```