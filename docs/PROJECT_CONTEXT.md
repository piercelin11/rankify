# Rankify 專案技術文件

> 本文件旨在協助 AI 助手與開發者快速掌握 Rankify 專案架構、技術堆疊與程式碼撰寫規範，確保程式碼風格一致且符合專案標準。

---

## 1. Project Overview（專案總覽）

**Rankify** 是一個音樂排名系統，讓使用者能夠為藝人的專輯與歌曲進行個人化排序，追蹤音樂喜好並透過視覺化統計深入了解自己的音樂品味。

### 核心功能

- **音樂排序引擎**：使用兩兩比較演算法（基於 Merge Sort）為歌曲/專輯排名
- **草稿自動儲存**：排序過程中自動儲存進度（debounce + max interval 機制）
- **統計視覺化**：提供歌曲統計（TrackStat）與專輯統計（AlbumStat）
- **成就系統**：追蹤使用者的排名里程碑與音樂品味變化
- **探索推薦**：基於使用者行為推薦新藝人與專輯

### 技術基礎

- **框架**: Next.js 15 (App Router)
- **語言**: TypeScript
- **資料庫**: PostgreSQL with Prisma ORM
- **驗證**: NextAuth.js (Google Provider)
- **部署**: 尚未部署（未來可能考慮 Vercel 或 AWS）

---

## 2. Tech Stack & Key Libraries（技術堆疊）

### Core Frameworks

| 技術 | 版本 | 用途 |
|------|------|------|
| Next.js | 15.1.1 | App Router、Server Components、Server Actions |
| React | 18.2.0 | UI 框架 |
| TypeScript | 5.x | 型別安全 |

### UI & Styling

| 技術 | 版本 | 用途 |
|------|------|------|
| Tailwind CSS | 3.4.1 | 樣式框架 |
| Radix UI | 各元件最新版 | 無障礙 UI 元件庫（Dialog、Dropdown、Tooltip 等）|
| Lucide React | 0.544.0 | Icon 庫 |
| Class Variance Authority (CVA) | 0.7.1 | 元件 variants 管理 |
| Tailwind Merge | 2.5.5 | 條件式 className 合併 |

### State Management & Forms

| 技術 | 版本 | 用途 |
|------|------|------|
| React Context | - | 全域狀態（SorterContext）|
| React Hook Form | 7.54.2 | 表單狀態管理 |
| Zod | 3.24.4 | Schema validation |

### Database & ORM

| 技術 | 版本 | 用途 |
|------|------|------|
| Prisma | 6.0.1 | ORM |
| PostgreSQL | - | 資料庫 |

### Authentication

| 技術 | 版本 | 用途 |
|------|------|------|
| NextAuth.js | 5.0.0-beta.25 | OAuth 驗證（Google Provider）|

### External APIs

| API | 用途 |
|-----|------|
| Spotify Web API | 獲取藝人、專輯、歌曲資料 |
| AWS S3 | 使用者頭像上傳 |

### Data Visualization & Interaction

| 技術 | 版本 | 用途 |
|------|------|------|
| Chart.js | 4.4.7 | 統計圖表 |
| @tanstack/react-table | 8.21.3 | 表格元件 |
| @tanstack/react-virtual | 3.13.12 | 虛擬化列表（效能優化）|
| @dnd-kit | 6.3.1/10.0.0 | 拖拽排序 |
| Embla Carousel | 8.6.0 | 輪播元件 |

### Testing

| 技術 | 版本 | 用途 |
|------|------|------|
| Jest | 29.7.0 | 測試框架 |
| React Testing Library | 16.3.0 | React 元件測試 |

---

## 3. Folder Structure & Architecture（目錄結構與架構）

```
src/
├── app/                      # Next.js App Router
│   ├── (main)/              # 需驗證的主要路由
│   │   ├── page.tsx         # 首頁（Dashboard + Hero + Discovery）
│   │   ├── settings/        # 使用者設定
│   │   ├── admin/           # 內容管理後台
│   │   └── artist/          # 藝人頁面
│   │       └── [artistId]/
│   │           ├── (artist)/
│   │           │   ├── my-stats/      # 我的統計
│   │           │   └── community/     # 社群統計
│   │           ├── album/[albumId]/   # 專輯詳情
│   │           └── track/[trackId]/   # 歌曲詳情
│   ├── sorter/              # 排序介面（獨立 layout）
│   │   ├── artist/[artistId]/  # 藝人全曲排序
│   │   └── album/[albumId]/    # 專輯歌曲排序
│   ├── auth/                # 驗證相關頁面（登入/註冊）
│   └── api/                 # API Routes
│       ├── auth/            # NextAuth.js
│       └── spotify/         # Spotify API Proxy
│
├── features/                # Feature-based 模組（功能導向設計）
│   ├── home/               # 首頁功能
│   │   ├── components/     # HeroSection, DashboardSection, GlobalSearch
│   │   └── actions/        # searchArtistsAndAlbums
│   ├── sorter/             # 排序功能
│   │   ├── components/     # SorterBattleCard, ProgressBar
│   │   ├── hooks/          # useSorter, useAutoSave
│   │   ├── actions/        # completeSubmission, saveDraft
│   │   └── utils/          # 排序演算法相關
│   ├── ranking/            # 統計與排名
│   │   ├── chart/          # 圖表元件
│   │   ├── table/          # 表格元件
│   │   ├── stats/          # 統計卡片
│   │   └── utils/          # calculateAlbumPoints
│   ├── auth/               # 驗證
│   │   ├── components/     # LoginForm, SignupForm
│   │   └── actions/        # handleOath
│   ├── admin/              # 後台管理
│   │   ├── addContent/     # 新增內容（藝人/專輯/單曲）
│   │   ├── editContent/    # 編輯內容
│   │   └── user/           # 使用者管理
│   └── settings/           # 使用者設定
│       ├── components/     # ProfileForm, RankingSettingsForm
│       ├── hooks/          # useProfilePictureUpload
│       └── actions/        # saveProfileSettings, saveRankingSettings
│
├── components/              # 通用 UI 元件
│   ├── ui/                 # Shadcn/ui 元件（Button, Dialog, Card 等）
│   ├── sidebar/            # 側邊欄相關元件
│   └── ...                 # 其他共用元件
│
├── lib/                     # 共用函式庫
│   ├── database/           # 資料庫查詢層（分離 data fetching）
│   │   ├── data/           # getAlbumById, getTracksByArtist
│   │   └── user/           # getUserPreference, getUnloggedArtists
│   ├── utils/              # 工具函式
│   │   ├── cn.ts           # Tailwind class merge
│   │   ├── color.utils.ts  # 顏色處理
│   │   ├── score.utils.ts  # 分數計算
│   │   └── ...
│   ├── hooks/              # 共用 Hooks
│   │   ├── useMediaQuery.ts
│   │   ├── useStickyState.ts
│   │   └── useServerAction.ts
│   ├── schemas/            # Zod Schemas
│   │   ├── sorter.ts       # SorterStateType
│   │   ├── settings.ts     # ProfileFormSchema
│   │   └── ...
│   └── upload/             # 檔案上傳相關
│
├── services/                # 業務邏輯層（資料聚合與轉換）
│   ├── home/               # getUserDashboardStats, getHeroItem
│   ├── track/              # getTracksStats, updateTrackStats
│   ├── album/              # getAlbumsStats, updateAlbumStats
│   └── achievement/        # getUserArtistAchievement
│
├── contexts/                # React Context
│   └── SorterContext.tsx   # 排序狀態（saveStatus, percentage）
│
├── types/                   # TypeScript 型別定義
│   ├── data.ts             # TrackData, AlbumData
│   ├── home.ts             # DashboardStatsType, HeroItemType
│   └── ...
│
├── constants/               # 常數定義
│   ├── messages/           # 錯誤訊息、提示文字
│   └── placeholder.constants.ts
│
├── config/                  # 設定檔
│   └── ...
│
└── db/                      # Prisma Client
    └── client.ts
```

### 目錄用途說明

| 目錄 | 用途 |
|------|------|
| `app/` | Next.js 路由與頁面（Server Components）|
| `features/` | 功能模組（components + hooks + actions + utils）|
| `components/` | 跨功能共用的 UI 元件 |
| `lib/` | 純函式工具庫（無副作用）|
| `services/` | 業務邏輯層（資料聚合與轉換）|
| `contexts/` | React Context（全域狀態）|
| `types/` | TypeScript 型別定義 |

---

## 4. Coding Patterns & Conventions（程式碼撰寫模式與規範）

### 4.1 Component Pattern

#### Pattern 1: Simple Function Component

**用途**: 簡單的 Server Component 或 Client Component

```tsx
// Server Component
export default async function HomePage() {
  const data = await getData();

  return (
    <div className="space-y-4">
      <Title>{data.title}</Title>
      <Content>{data.content}</Content>
    </div>
  );
}
```

```tsx
// Client Component
"use client";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

#### Pattern 2: forwardRef + CVA（Shadcn/ui Pattern）

**用途**: 可重用的 UI 元件（支援 ref 與 variants）

```tsx
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/index";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/70",
        outline: "border bg-field hover:bg-accent",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

#### Pattern 3: Client Component + Custom Hook

**用途**: 複雜邏輯的分離（UI 與業務邏輯解耦）

```tsx
// Component
"use client";

import { useSorter } from "../hooks/useSorter";

export default function SorterBattle({ tracks, submissionId }) {
  const { leftField, rightField, sortList } = useSorter({
    initialState,
    tracks,
    submissionId,
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card onClick={() => sortList(-1)}>{leftField.name}</Card>
      <Card onClick={() => sortList(1)}>{rightField.name}</Card>
    </div>
  );
}
```

```tsx
// Hook
import { useState, useCallback } from "react";

export function useSorter({ initialState, tracks, submissionId }) {
  const [state, setState] = useState(initialState);

  const sortList = useCallback((flag: number) => {
    const newState = processSortChoice(state, flag);
    setState(newState);
  }, [state]);

  return {
    leftField: tracks[state.currentLeftIndex],
    rightField: tracks[state.currentRightIndex],
    sortList,
  };
}
```

#### Pattern 4: React Hook Form + Zod

**用途**: 表單處理（型別安全 + 驗證）

```tsx
// Schema
import { z } from "zod";

export const ProfileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export type ProfileFormData = z.infer<typeof ProfileFormSchema>;
```

```tsx
// Component
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function ProfileForm() {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: { name: "", email: "" },
  });

  const onSubmit = async (data: ProfileFormData) => {
    await saveProfile(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("name")} />
      {form.formState.errors.name && <span>{form.formState.errors.name.message}</span>}
    </form>
  );
}
```

---

### 4.2 Data Fetching

#### ✅ 推薦做法

**1. Server Components 直接查詢**

```tsx
// app/(main)/page.tsx
export default async function HomePage() {
  const user = await getCurrentSession();
  const stats = await getUserDashboardStats({ userId: user.id });

  return <DashboardSection stats={stats} />;
}
```

**2. Service Layer（資料聚合）**

```tsx
// services/home/getUserDashboardStats.ts
import { db } from "@/db/client";

export async function getUserDashboardStats({ userId }: { userId: string }) {
  const [rankingCount, songCount] = await Promise.all([
    db.rankingSubmission.count({ where: { userId, status: "COMPLETED" } }),
    db.trackRanking.count({ where: { userId } }),
  ]);

  return { rankingCount, songCount };
}
```

> **Note**: 專案未來會使用 Next.js 的 `use cache` 或 `unstable_cache` 進行快取優化（目前暫不使用 React `cache()`，因為物件參數會有 reference equality 問題）

**3. Server Actions**

```tsx
// features/sorter/actions/completeSubmission.ts
"use server";

import { db } from "@/db/client";
import { revalidatePath } from "next/cache";

export default async function completeSubmission({ trackRankings, submissionId }) {
  try {
    await db.$transaction(async (tx) => {
      await tx.trackRanking.createMany({ data: trackRankings });
      await tx.rankingSubmission.update({
        where: { id: submissionId },
        data: { status: "COMPLETED" },
      });
    });

    revalidatePath("/artist/[artistId]");
    return { type: "success", message: "Submission completed" };
  } catch (error) {
    return { type: "error", message: "Failed to complete submission" };
  }
}
```

#### ❌ 不使用的技術

- **SWR / React Query**: 專案採用 Server Components + Server Actions，不使用客戶端資料獲取庫
- **Redux / Zustand**: 全域狀態使用 React Context
- **React cache()**: 目前不使用（物件參數會有 reference equality 問題），未來會使用 Next.js 的 `use cache` 或 `unstable_cache`

---

### 4.3 Styling

#### 1. 使用 `cn()` Utility

```tsx
import { cn } from "@/lib/utils/index";

<div className={cn(
  "base-class",
  isActive && "active-class",
  props.className
)} />
```

#### 2. 使用 CVA（Class Variance Authority）

```tsx
const cardVariants = cva("rounded-lg border", {
  variants: {
    variant: {
      default: "bg-card",
      ghost: "bg-transparent",
    },
    size: {
      sm: "p-2",
      md: "p-4",
    },
  },
});

<div className={cardVariants({ variant: "default", size: "md" })} />
```

#### 3. 使用 CSS Variables

```tsx
// Tailwind config
colors: {
  primary: "hsl(var(--primary))",
  foreground: "hsl(var(--foreground))",
}

// Component
<div className="bg-primary text-foreground" />
```

---

### 4.4 State Management

| 狀態類型 | 解決方案 | 範例 |
|----------|----------|------|
| 全域狀態 | React Context | `SorterContext`（saveStatus, percentage）|
| 表單狀態 | React Hook Form | `useForm<ProfileFormData>()` |
| 伺服器狀態 | Server Components + Services | `getUserDashboardStats` |
| URL 狀態 | useSearchParams | `useUrlState` |
| 本地持久化 | localStorage + useState | `useStickyState` |

**❌ 不使用 Redux**

---

### 4.5 Error Handling

#### 1. Next.js Error Boundary

```tsx
// app/error.tsx
"use client";

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

#### 2. Server Actions 統一回傳格式

```tsx
type ActionResult =
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export async function saveProfile(data: ProfileFormData): Promise<ActionResult> {
  try {
    await db.user.update({ where: { id }, data });
    return { type: "success", message: "Profile updated" };
  } catch (error) {
    return { type: "error", message: "Failed to update profile" };
  }
}
```

---

## 5. Database & Schema Highlights（資料庫與 Schema 重點）

### 核心 Models

```prisma
model User {
  id              String   @id @default(cuid())
  name            String
  email           String?  @unique
  role            Role     @default(USER)

  submissions     RankingSubmission[]
  albumStats      AlbumStat[]
  trackStats      TrackStat[]
}

model Artist {
  id               String   @id
  name             String
  spotifyUrl       String   @unique
  img              String?

  albums           Album[]
  tracks           Track[]
  submissions      RankingSubmission[]
}

model Album {
  id            String     @id
  name          String
  artistId      String
  releaseDate   DateTime
  type          AlbumType  // ALBUM | EP

  artist        Artist     @relation(...)
  tracks        Track[]
  albumStats    AlbumStat[]
}

model Track {
  id          String     @id
  name        String
  albumId     String?
  artistId    String
  trackNumber Int?
  type        TrackType  // STANDARD | REISSUE

  artist      Artist     @relation(...)
  album       Album?     @relation(...)
  trackStats  TrackStat[]
}

model RankingSubmission {
  id          String            @id @default(cuid())
  status      SubmissionStatus  // IN_PROGRESS | DRAFT | COMPLETED
  type        SubmissionType    // ALBUM | ARTIST
  draftState  Json?             // 排序進度（SorterStateType）
  resultState Json?             // 最終結果
  userId      String
  artistId    String
  albumId     String?

  trackRanks  TrackRanking[]
  albumRanks  AlbumRanking[]
}

model TrackRanking {
  id             String   @id @default(cuid())
  rank           Int      // 使用者本次排名
  rankPercentile Float    // 百分位
  rankChange     Int?     // 與上次排名的變化
  submissionId   String
  trackId        String
}

model TrackStat {
  id                   String   @id @default(cuid())
  userId               String
  trackId              String

  // 綜合排名（基於所有提交計算）
  overallRank          Int
  previousOverallRank  Int?
  overallRankChange    Int?

  // 趨勢統計
  hotStreak            Int      @default(0)  // 連續上升次數
  coldStreak           Int      @default(0)  // 連續下降次數
  cumulativeRankChange Int      @default(0)  // 累計排名變化

  // 歷史統計
  highestRank          Int
  lowestRank           Int
  averageRank          Float
  submissionCount      Int      @default(0)
}

model AlbumStat {
  id                   String   @id @default(cuid())
  userId               String
  albumId              String

  // 專輯分數（基於 TrackStats.overallRank 計算）
  points               Int
  previousPoints       Int?
  pointsChange         Int?

  // 專輯排名（基於 points 排序）
  overallRank          Int
  previousOverallRank  Int?
  overallRankChange    Int?

  // 百分位統計（前 5%/10%/25%/50% 歌曲數量）
  top5PercentCount     Int
  top10PercentCount    Int
  top25PercentCount    Int
  top50PercentCount    Int

  // 輔助統計
  averageTrackRank     Float
  trackCount           Int
  submissionCount      Int
}
```

### 關鍵關聯

1. **User → RankingSubmission**: 一個使用者可以有多次排名提交
2. **RankingSubmission → TrackRanking**: 一次提交包含多個歌曲排名
3. **TrackStat**: 綜合統計（基於該使用者對該歌曲的所有排名計算）
4. **AlbumStat**: 基於 TrackStat 聚合計算（專輯分數 = 歌曲排名總和）

---

## 6. Development Guidelines（開發準則）

### 6.1 Naming Conventions

| 類型 | 命名規則 | 範例 |
|------|----------|------|
| Component 檔名 | PascalCase.tsx | `GlobalSearch.tsx` |
| Hook 檔名 | camelCase.ts | `useSorter.ts` |
| Server Action 檔名 | camelCase.ts | `completeSubmission.ts` |
| Utility 檔名 | camelCase.utils.ts | `color.utils.ts` |
| Type 檔名 | camelCase.ts | `data.ts` |
| 常數 | UPPER_SNAKE_CASE | `PLACEHOLDER_PIC` |
| CSS Class | kebab-case | `bg-primary` |
| 資料庫 Model | PascalCase | `TrackStat` |

### 6.2 Do's and Don'ts

#### ✅ DO（必須做）

1. **Server Components 優先**: 能用 Server Component 就不用 Client Component
2. **使用 TypeScript**: 所有檔案使用 `.ts` / `.tsx`
3. **使用 Zod**: 所有表單與資料驗證使用 Zod
4. **使用 Prisma**: 所有資料庫操作使用 Prisma
5. **優化資料查詢**: 使用 `Promise.all` 並行查詢（未來會使用 Next.js `use cache` 進行快取）
6. **使用 Promise.all**: 並行查詢優化效能
7. **使用 revalidatePath**: Server Actions 執行後清除快取
8. **使用 cn()**: 合併 className
9. **使用 CVA**: UI 元件支援 variants
10. **使用 forwardRef**: 可重用元件支援 ref

#### ❌ DON'T（禁止做）

1. **不使用 any**: 除非極端情況，否則禁止使用 `any`
2. **不使用 CSS Modules**: 統一使用 Tailwind CSS
3. **不使用 Inline Styles**: 禁止使用 `style` 屬性
4. **不使用 Redux**: 全域狀態使用 React Context
5. **不使用 SWR/React Query**: 使用 Server Components + Services
6. **不使用 React cache()**: 物件參數會有 reference 問題（未來使用 Next.js `use cache`）
7. **不省略 Error Handling**: Server Actions 必須包含 try-catch
8. **不省略 Loading State**: 非同步操作必須提供 Loading UI
9. **不省略 Empty State**: 列表必須處理空資料情況
10. **不移除 TODO 註解**: 保留開發者標記的 TODO

### 6.3 TypeScript 使用準則

#### 1. 避免使用 `any`

```tsx
// ❌ Bad
const data: any = await fetchData();

// ✅ Good
const data: UserData = await fetchData();
```

#### 2. 使用 Zod 推斷型別

```tsx
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

type User = z.infer<typeof UserSchema>;  // ✅ 從 Schema 推斷
```

#### 3. 使用 Prisma 推斷型別

```tsx
import { Prisma } from "@prisma/client";

// ✅ 使用 Prisma 生成的型別
type UserWithStats = Prisma.UserGetPayload<{
  include: { trackStats: true }
}>;
```

#### 4. 使用泛型

```tsx
// ✅ Good
function cache<T>(fn: () => Promise<T>): () => Promise<T> {
  let cachedValue: T | null = null;
  return async () => {
    if (!cachedValue) cachedValue = await fn();
    return cachedValue;
  };
}
```

### 6.4 效能優化準則

#### 1. 資料查詢優化

**✅ Service Layer 模式**

```tsx
// services/home/getUserDashboardStats.ts
import { db } from "@/db/client";

export async function getUserDashboardStats({ userId }: { userId: string }) {
  // 使用 Promise.all 並行查詢
  const [stats, drafts] = await Promise.all([
    db.rankingSubmission.count({ where: { userId, status: "COMPLETED" } }),
    db.user.findUnique({ where: { id: userId } }),
  ]);

  return { stats, drafts };
}
```

**⚠️ 關於快取策略**

目前專案**不使用** React `cache()`，原因：
- React `cache()` 使用 **reference equality** 判斷參數
- 物件參數會導致快取失效：`{ userId: "123" } !== { userId: "123" }`
- 未來會使用 Next.js 的 **`use cache`** 或 **`unstable_cache`**（支援物件參數）

```tsx
// ❌ 目前不使用（reference equality 問題）
import { cache } from "react";
export const getStats = cache(async ({ userId }) => { ... });

// ✅ 未來使用（Next.js 官方快取）
import { unstable_cache } from "next/cache";
export const getStats = unstable_cache(
  async ({ userId }) => { ... },
  ["user-stats"],
  { revalidate: 60 }
);
```

#### 2. 使用 `Promise.all` 並行查詢

```tsx
// ✅ Good（並行）
const [stats, drafts, history] = await Promise.all([
  getUserDashboardStats({ userId }),
  getUserDrafts({ userId }),
  getUserHistory({ userId }),
]);

// ❌ Bad（串行）
const stats = await getUserDashboardStats({ userId });
const drafts = await getUserDrafts({ userId });
const history = await getUserHistory({ userId });
```

#### 3. 使用 Next.js Image

```tsx
import Image from "next/image";

<Image
  src={artist.img}
  alt={artist.name}
  width={300}
  height={300}
  className="rounded-full"
/>
```

#### 4. 使用虛擬化列表

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

const virtualizer = useVirtualizer({
  count: tracks.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});
```

---

## 7. 常見問題與解決方案

### Q1: 如何新增 Server Action？

```tsx
// 1. 建立檔案: features/[feature]/actions/actionName.ts
"use server";

import { db } from "@/db/client";
import { revalidatePath } from "next/cache";

export default async function actionName(data: DataType) {
  try {
    await db.model.create({ data });
    revalidatePath("/path");
    return { type: "success", message: "Success" };
  } catch (error) {
    return { type: "error", message: "Failed" };
  }
}

// 2. 在 Component 中使用
import actionName from "../actions/actionName";

const result = await actionName(data);
if (result.type === "success") {
  // Handle success
}
```

### Q2: 如何新增 Page？

```tsx
// 1. 建立檔案: app/(main)/[route]/page.tsx
export default async function Page() {
  const data = await getData();  // Server Component 直接查詢

  return (
    <div className="p-content">
      <Component data={data} />
    </div>
  );
}

// 2. 如需 Client Component
"use client";

export default function ClientPage() {
  const [state, setState] = useState();

  return <div>...</div>;
}
```

### Q3: 如何新增 Feature？

```bash
# 1. 建立目錄結構
features/
└── newFeature/
    ├── components/       # UI 元件
    ├── hooks/           # Custom Hooks
    ├── actions/         # Server Actions
    └── utils/           # 工具函式

# 2. 在 app/ 中建立對應路由
app/
└── (main)/
    └── newFeature/
        └── page.tsx      # 使用 features/newFeature/components
```

### Q4: 如何處理表單？

```tsx
// 1. 定義 Schema
import { z } from "zod";

export const FormSchema = z.object({
  name: z.string().min(1, "Required"),
});

export type FormData = z.infer<typeof FormSchema>;

// 2. 建立 Component
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function Form() {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (data: FormData) => {
    const result = await submitAction(data);
    if (result.type === "success") {
      form.reset();
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("name")} />
      {form.formState.errors.name && (
        <span>{form.formState.errors.name.message}</span>
      )}
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 8. 結語

### 核心原則

1. **Server-First**: 優先使用 Server Components，減少客戶端 JavaScript
2. **型別安全**: TypeScript + Zod + Prisma 確保型別安全
3. **效能優化**: Promise.all 並行查詢 + 虛擬化列表 + Next.js Image
4. **一致性**: 統一的命名規範、檔案結構、程式碼風格

### 開發檢查清單

- [ ] 使用 Server Components（除非需要互動）
- [ ] 使用 TypeScript（不使用 `any`）
- [ ] 使用 Zod 驗證資料
- [ ] 使用 Prisma 操作資料庫
- [ ] 使用 Promise.all 並行查詢
- [ ] Server Actions 包含 Error Handling
- [ ] 使用 cn() 合併 className
- [ ] 使用 CVA 定義 variants
- [ ] 使用 forwardRef 支援 ref
- [ ] 提供 Loading / Empty State
- [ ] 執行 `npm run lint` 與 `npx tsc --noEmit` 檢查

---

**文件版本**: 1.0.0
**最後更新**: 2025-12-09
**維護者**: Rankify Development Team
