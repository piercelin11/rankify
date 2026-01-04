# Guest Mode 程式碼審查報告
> Linus Torvalds 視角的程式碼品味分析

## 【執行狀態】
✅ **已完成基礎改進**（Phase 1-2）
⚠️ **進階優化待評估**（Phase 3-4）

---

## ✅ 一、已完成的改進

### ✅ 問題 1：刪除備份檔案（已完成）
**刪除**: `src/features/sorter/hooks/useSorter.ts.bak`

**效果**：
- ✅ 清理版本控制
- ✅ 移除縮排錯誤的檔案

---

### ✅ 問題 2：合併 Auth 頁面（已完成）

**新增**: `src/app/auth/components/AuthPage.tsx`
**修改**:
- `src/app/auth/signin/page.tsx`（從 34 行簡化為 9 行）
- `src/app/auth/signup/page.tsx`（從 35 行簡化為 9 行）

**效果**：
- ✅ 消除 60 行重複程式碼
- ✅ 未來新增 Provider（如 Spotify）只需改一處
- ✅ 更容易維護

---

### ✅ 問題 3：修復 MigrationHandler 邏輯（已完成）

**檔案**: `src/features/sorter/components/MigrationHandler.tsx`

**修改內容**：
- 當 LocalStorage 無資料時：導向首頁（`router.push('/')`）
- 當資料過期時：清除資料並導向首頁

**效果**：
- ✅ 修復 User 模式下仍以 Guest 模式運作的 Bug
- ✅ 符合 YAGNI 原則（靜默處理）

---

## 二、待評估的優化項目

### 🟡 可選優化：檔案結構簡化

**重複程度**：99%

#### 完全相同的部分
```typescript
// 1. Props 型別定義
type LoginPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 2. searchParams 解析邏輯
const params = await searchParams;
const callbackUrl = typeof params.callbackUrl === 'string' ? params.callbackUrl : '/';

// 3. Layout 結構
<div className="rounded-xl border  p-24">
  <div className="space-y-10">
    {/* ... */}
  </div>
</div>
```

#### 唯一的差異
| 欄位 | SignIn | SignUp |
|------|--------|--------|
| 標題 | "Welcome back" | "Join rankify.fm" |
| 描述 | "Sign in and ranked..." | "Sign up and ranked..." |
| 連結文字 | "Don't have an account yet?" | "Already have an account?" |
| 連結目標 | `/auth/signup` | `/auth/signin` |

**這是典型的 Copy-Paste Programming**。

#### 改進方案：合併為單一元件

**新檔案結構**：
```
src/app/auth/
├── signin/
│   └── page.tsx  → 調用 AuthPage({ mode: "signin" })
├── signup/
│   └── page.tsx  → 調用 AuthPage({ mode: "signup" })
└── components/
    └── AuthPage.tsx  (共用元件)
```

**AuthPage.tsx 範例**：
```typescript
type AuthMode = "signin" | "signup";

const authConfig = {
  signin: {
    title: "Welcome back",
    description: "Sign in and ranked your favorite artist.",
    linkText: "Don't have an account yet?",
    linkTarget: "/auth/signup",
    linkLabel: "Sign up",
  },
  signup: {
    title: "Join rankify.fm",
    description: "Sign up and ranked your favorite artist.",
    linkText: "Already have an account?",
    linkTarget: "/auth/signin",
    linkLabel: "Sign in",
  },
};

export default async function AuthPage({
  mode,
  searchParams
}: {
  mode: AuthMode;
  searchParams: Promise<{...}>;
}) {
  const config = authConfig[mode];
  // ... 共用邏輯
}
```

**效益**：
- 節省 ~60 行程式碼
- 未來新增 Provider (如 Spotify) 只需修改一處
- 消除重複的型別定義

---

### 🔴 問題 4：useSorter Hook 的複雜度爆炸

**檔案**: `src/features/sorter/hooks/useSorter.ts`
**行數**: 401 行

#### 問題分析

##### 1. `processSortChoice` 函式過長
```typescript
function processSortChoice(
  state: SorterStateType,
  flag: SortChoice
): SorterStateType {
  // 40-188 行，共 148 行
  // 縮排層級達到 4 層
}
```

**Linus 標準**：
> 如果縮排超過 3 層，代表設計有問題。

**改進**：拆分成獨立的 `sorter-algorithm.ts` 檔案。

##### 2. `sortList` 回調中的 Guest 特殊處理
```typescript
const sortList = useCallback((flag: number) => {
  // ...
  if (newState.finishFlag === 1) {
    if (isGuest) {
      // Guest 模式：儲存到 LocalStorage (333-357 行，共 25 行)
      const rankedList = newState.namMember.map(/* ... */);
      const guestData = { /* ... */ };
      localStorage.setItem(`rankify_guest_result_${_albumId}`, JSON.stringify(guestData));
      window.location.reload();
    } else if (submissionId) {
      // User 模式：呼叫 server action
      finalizeDraft(newState, submissionId);
    }
  }
}, [/* 長達 12 個依賴 */]);
```

**問題**：
- Guest/User 邏輯混在同一個回調中
- 依賴陣列過長 (12 個)，容易產生閉包問題

**改進方向**：
```typescript
// 抽取成獨立函式
function saveGuestResult(state: SorterStateType, albumId: string, tracks: TrackData[]) {
  const rankedList = state.namMember.map(/* ... */);
  const guestData = { /* ... */ };
  localStorage.setItem(`rankify_guest_result_${albumId}`, JSON.stringify(guestData));
}

// Hook 中只需調用
if (newState.finishFlag === 1) {
  isGuest ? saveGuestResult(newState, _albumId, tracks) : finalizeDraft(newState, submissionId);
}
```

---

### 🔴 問題 5：RankingStage/ResultStage 的職責混淆

**問題**：這兩個元件充斥著 `if (isGuest)` 的分支邏輯。

#### RankingStage.tsx 的 Guest 分支
```typescript
// 73-90 行：Guest 模式不能清除
function handleClear() {
  if (isGuest || !submissionId) return;
  // ...
}

// 83-95 行：Guest 模式的離開邏輯
function handleQuit() {
  if (isGuest) {
    showAuthGuard({ callbackUrl: `/sorter/album/${albumId}` });
    return;
  }
  // ...
}

// 136-148 行：Guest 模式不顯示 beforeunload 警告
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!isGuest && saveStatus !== "saved") {
      e.preventDefault();
    }
  };
  // ...
}, [isGuest, saveStatus]);

// 189-203 行：Guest 模式不顯示 Restart 按鈕
{!isGuest && (
  <Button onClick={/* ... */}>Restart</Button>
)}
```

#### ResultStage.tsx 的 Guest 分支
```typescript
// 74-88 行：Guest 模式使用 initialRankedList
if (isGuest && initialRankedList) {
  const guestResult = initialRankedList.map(/* ... */);
  setResult(guestResult);
}

// 113-126 行：Guest 模式不顯示 beforeunload 警告
if (!isGuest) {
  e.preventDefault();
}

// 169-180 行：Guest 模式觸發登入
if (isGuest) {
  showAuthGuard({ callbackUrl: `/sorter/album/${albumId}?migrate=true` });
  return;
}

// 214-218 行：Guest 模式不顯示 Delete 按鈕
{!isGuest && (
  <Button onClick={handleDelete}>Delete</Button>
)}
```

**這違反了單一職責原則**：一個元件不應該處理兩種完全不同的資料流。

#### 改進方案：統一資料結構

**核心概念**：Guest 和 User 應該使用**相同的資料結構**，只在**儲存層**區分。

```typescript
// 統一的 Sorter 資料型別
type SorterData = {
  state: SorterStateType;
  storage:
    | { type: "database"; submissionId: string }
    | { type: "localStorage"; key: string };
};

// RankingStage 不需要知道 isGuest
function RankingStage({ data, tracks }: { data: SorterData; tracks: TrackData[] }) {
  const canClear = data.storage.type === "database";
  const canRestart = data.storage.type === "database";

  // 儲存邏輯統一
  const handleSave = () => {
    if (data.storage.type === "database") {
      saveToDB(data.state, data.storage.submissionId);
    } else {
      saveToLocalStorage(data.state, data.storage.key);
    }
  };
}
```

**效益**：
- 消除所有 `if (isGuest)` 分支
- UI 元件完全不需要知道資料來源
- 更容易測試（mock `storage` 即可）

---

### 🔴 問題 6：不必要的 Props 傳遞與推導

**問題程式碼**：
```typescript
// RankingStage.tsx (52-53 行)
const finalArtistId = artistId || tracks[0]?.artistId;

// ResultStage.tsx (136 行)
const finalArtistId = artistId || tracks[0].artistId;
```

**問題分析**：
1. `artistId` 是 optional，但實際上應該是 required
2. fallback 到 `tracks[0]?.artistId` 是**防禦性程式設計過度**
3. 如果 `tracks` 是空陣列，這行程式碼會直接失敗

**Linus 的標準**：
> 信任內部程式碼和框架保證。只在系統邊界 (使用者輸入、外部 API) 驗證資料。

**改進**：
```typescript
// Props 應該明確標示 required
type RankingStageProps = {
  // ...
  artistId: string;  // 不是 optional
};

// page.tsx 確保 artistId 永遠存在
if (!album || !album.artistId) notFound();

return (
  <RankingStage
    artistId={album.artistId}
    // ...
  />
);
```

---

### 🔴 問題 7：page.tsx 的邏輯分支過多

**檔案**: `src/app/sorter/album/[albumId]/page.tsx`

#### 問題結構
```typescript
export default async function page({ params, searchParams }) {
  // 1. Guest 模式 (35-58 行)
  if (isGuest) {
    return <GuestSorterLoader />;
  }

  // 2. User + 遷移模式 (64-80 行)
  if (shouldMigrate) {
    return (
      <>
        <MigrationHandler />
        <GuestSorterLoader />
      </>
    );
  }

  // 3. User + 無草稿 (90-147 行)
  if (!submission) {
    // 自動建立 submission
    // 驗證 draftState
    return <DraftPrompt />;
  }

  // 4. User + 有草稿 (150-171 行)
  return <DraftPrompt />;
}
```

**問題**：
- 4 個 early return，邏輯分支過多
- `shouldMigrate` 時仍渲染 `GuestSorterLoader`，職責混淆

**改進方向**：
```typescript
export default async function page({ params, searchParams }) {
  const user = await getSession();

  if (!user) {
    return <GuestSorterPage albumId={albumId} tracks={tracks} />;
  }

  // 處理 Guest 資料遷移
  if (searchParams?.migrate === "true") {
    await migrateGuestData(albumId, user.id);
  }

  // User 正常流程
  const submission = await getOrCreateSubmission(/* ... */);
  return <DraftPrompt submission={submission} tracks={tracks} />;
}
```

---

## 二、YAGNI 原則違反分析

### 過度設計 1：MigrationHandler 的獨立性

**現況**：
```typescript
// GuestSorterLoader.tsx
{shouldMigrate && (
  <MigrationHandler albumId={albumId} artistId={artistId} />
)}
```

**問題**：
- `MigrationHandler` 是一個 Client Component，在 `useEffect` 中處理遷移
- 遷移成功後 redirect，但仍渲染 `GuestSorterLoader`
- 使用者會看到短暫的「載入中」畫面

**YAGNI 審查**：
> 這個功能需要一個獨立的 Component 嗎？

**答案**：不需要。遷移邏輯應該在 Server 端完成。

**改進方案**：
```typescript
// page.tsx (Server Component)
if (shouldMigrate) {
  const guestData = await getGuestDataFromLocalStorage(); // 不可行，需要 Client 端協助
  // ...
}
```

**更好的方案**：使用 Route Handler
```typescript
// app/api/migrate-guest-data/route.ts
export async function POST(req: Request) {
  const { albumId, guestData } = await req.json();
  // 處理遷移
  return Response.json({ success: true });
}

// Client 端直接呼叫
await fetch("/api/migrate-guest-data", {
  method: "POST",
  body: JSON.stringify({ albumId, guestData }),
});
```

### 過度設計 2：GuestSorterLoader 的存在

**檔案內容分析**：
```typescript
export default function GuestSorterLoader({ albumId, tracks, initialState }) {
  const [guestData, setGuestData] = useState<GuestResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 從 LocalStorage 讀取資料
  useEffect(() => { /* ... */ }, [albumId]);

  // 條件渲染
  if (isLoading) return <div>載入中...</div>;
  if (guestData) return <ResultStage />;
  return <RankingStage />;
}
```

**問題**：
- 90 行的檔案只做了「讀取 LocalStorage + 條件渲染」
- 完全可以內聯到 `page.tsx` 中

**改進**：刪除此檔案，邏輯移到 `page.tsx`
```typescript
// page.tsx (Client Component 或使用 use client)
"use client";

export default function GuestSorterPage({ albumId, tracks, initialState }) {
  const guestData = useLocalStorage<GuestResultData>(`rankify_guest_result_${albumId}`);

  if (guestData?.resultState.completedAt) {
    return <ResultStage isGuest initialRankedList={guestData.resultState.rankedList} />;
  }

  return <RankingStage isGuest initialState={initialState} />;
}
```

---

## 三、複雜度根源分析

### 核心問題：參數化 vs 資料結構統一

**你目前的做法**（參數化）：
```typescript
function RankingStage({ isGuest, submissionId, albumId, tracks, ... }) {
  if (isGuest) {
    // Guest 邏輯
  } else {
    // User 邏輯
  }
}
```

**更好的做法**（資料結構統一）：
```typescript
type StorageStrategy = {
  save: (state: SorterStateType) => Promise<void>;
  load: () => Promise<SorterStateType | null>;
  canRestart: boolean;
};

function RankingStage({ storage, tracks }: { storage: StorageStrategy; tracks: TrackData[] }) {
  const handleSave = () => storage.save(state);
  const canRestart = storage.canRestart;
  // 不需要任何 if (isGuest) 分支
}
```

**使用時**：
```typescript
// Guest 模式
const guestStorage: StorageStrategy = {
  save: (state) => saveToLocalStorage(state, albumId),
  load: () => loadFromLocalStorage(albumId),
  canRestart: false,
};

<RankingStage storage={guestStorage} tracks={tracks} />

// User 模式
const userStorage: StorageStrategy = {
  save: (state) => saveToDB(state, submissionId),
  load: () => loadFromDB(submissionId),
  canRestart: true,
};

<RankingStage storage={userStorage} tracks={tracks} />
```

**效益**：
- 消除所有 `if (isGuest)` 分支
- 更容易測試（mock `StorageStrategy`）
- 未來新增第三種儲存方式（如 IndexedDB）無需修改 UI 元件

---

## 四、改進計畫

### 🟡 Phase 2：可選優化（低風險）

1. **內聯 GuestSorterLoader**
   - 將 90 行的檔案邏輯移到 `page.tsx`
   - **效益**：減少 1 個 component boundary，提升可讀性
   - **狀態**：⚠️ 待評估

2. **拆分 processSortChoice**
   - 建立 `src/features/sorter/utils/sorterAlgorithm.ts`
   - 將 148 行的純函式獨立出來
   - **效益**：降低 Hook 複雜度，更容易測試
   - **狀態**：⚠️ 待評估

---

### 🟢 Phase 3：推薦優化（中風險，需要測試）

1. **統一資料結構（StorageStrategy 模式）**
   - 建立 `StorageStrategy` 介面
   - 重構 `RankingStage` 和 `ResultStage` 移除 `isGuest` prop
   - **效益**：消除所有 `if (isGuest)` 分支邏輯，提升可維護性
   - **狀態**：⭐ **強烈推薦**（Linus 最在意的改進）

---

### 🔴 Phase 4：不推薦執行

1. **❌ 重構 MigrationHandler 為 Route Handler**
   - 原建議：改為 `/api/migrate-guest-data`
   - **不推薦原因**：
     - 專案已有 Server Actions，不需要 Route Handler
     - 增加複雜度，效益不明顯
     - Server Component 無法讀取 LocalStorage，需要從 URL 傳遞資料
   - **狀態**：❌ **不建議執行**

2. **⚠️ 重構 useSorter Hook**
   - 原建議：拆分成 `useSorterState` + `useSorterActions` + `useSorterPersistence`
   - **不推薦原因**：
     - 工作量大（3-4 小時）
     - 效益中等（降低複雜度，但 Hook 功能正常）
     - 可能引入新 Bug，需要全面測試
   - **狀態**：⚠️ **可選，優先級低**

---

## 五、品味評分（更新後）

| 檔案 | 評分 | 狀態 | 備註 |
|------|------|------|------|
| `signin/page.tsx` | 🟢 好品味 | ✅ 已改進 | 使用共用元件，9 行 |
| `signup/page.tsx` | 🟢 好品味 | ✅ 已改進 | 使用共用元件，9 行 |
| `AuthPage.tsx` | 🟢 好品味 | ✅ 新增 | 統一 Auth 邏輯 |
| `handleOath.ts` | 🟢 好品味 | - | 簡潔明瞭 |
| `SocialButton.tsx` | 🟢 好品味 | - | 職責單一 |
| `MigrationHandler.tsx` | 🟢 好品味 | ✅ 已改進 | 修復邏輯混亂，導向首頁 |
| `GuestSorterLoader.tsx` | 🟡 湊合 | ⚠️ 待評估 | 可內聯到 page.tsx |
| `initializeSorterState.ts` | 🟡 湊合 | ⚠️ 待評估 | 可併入其他檔案 |
| `useSorter.ts` | 🟡 湊合 | ⚠️ 待評估 | 401 行，可拆分 |
| `RankingStage.tsx` | 🟡 湊合 | ⚠️ 待評估 | 太多 `isGuest` 分支 |
| `ResultStage.tsx` | 🟡 湊合 | ⚠️ 待評估 | 太多 `isGuest` 分支 |

---

## 六、最終建議

### ✅ 已完成（最小改進集）
1. ✅ 刪除 `.bak` 檔案
2. ✅ 合併 Auth 頁面
3. ✅ 修復 MigrationHandler Bug

**目前狀態**：程式碼已達到「可接受」水準，可以停在這裡。

---

### 🎯 如果想進一步改善

**推薦優先級**：

| 優先級 | 任務 | 效益 | 工作量 | 建議 |
|--------|------|------|--------|------|
| ⭐⭐⭐⭐⭐ | 統一資料結構（StorageStrategy） | 極高 | 2-3 小時 | **強烈推薦** |
| ⭐⭐⭐ | 內聯 GuestSorterLoader | 中 | 30 分鐘 | 可選 |
| ⭐⭐ | 拆分 processSortChoice | 中 | 1 小時 | 可選 |
| ⭐ | 拆分 useSorter Hook | 中 | 3-4 小時 | 優先級低 |
| ❌ | Route Handler | 低 | 2 小時 | **不推薦** |

### Linus 的忠告：
> "好品味的本質是消除特殊情況。如果你的程式碼充斥著 `if (isGuest)`，那就代表你的資料結構設計有問題。"

---

## 附錄：重構範例

### 範例 1：統一的 Storage 策略

```typescript
// src/features/sorter/storage/types.ts
export interface StorageStrategy {
  save(state: SorterStateType): Promise<void>;
  load(): Promise<SorterStateType | null>;
  finalize(state: SorterStateType): Promise<void>;
  delete(): Promise<void>;
  canRestart: boolean;
  canDelete: boolean;
}

// src/features/sorter/storage/guest-storage.ts
export class GuestStorage implements StorageStrategy {
  constructor(private albumId: string) {}

  async save(state: SorterStateType) {
    localStorage.setItem(`rankify_guest_result_${this.albumId}`, JSON.stringify(state));
  }

  async load() {
    const data = localStorage.getItem(`rankify_guest_result_${this.albumId}`);
    return data ? JSON.parse(data) : null;
  }

  async finalize(state: SorterStateType) {
    await this.save(state);
    window.location.reload();
  }

  async delete() {
    localStorage.removeItem(`rankify_guest_result_${this.albumId}`);
  }

  canRestart = false;
  canDelete = false;
}

// src/features/sorter/storage/database-storage.ts
export class DatabaseStorage implements StorageStrategy {
  constructor(private submissionId: string) {}

  async save(state: SorterStateType) {
    await saveDraft(state, this.submissionId);
  }

  async load() {
    return await loadDraft(this.submissionId);
  }

  async finalize(state: SorterStateType) {
    await finalizeDraft(state, this.submissionId);
  }

  async delete() {
    await deleteSubmission(this.submissionId);
  }

  canRestart = true;
  canDelete = true;
}

// 使用時
<RankingStage
  storage={isGuest ? new GuestStorage(albumId) : new DatabaseStorage(submissionId)}
  tracks={tracks}
/>
```

### 範例 2：簡化的 Auth 元件

```typescript
// src/app/auth/components/AuthPage.tsx
type AuthMode = "signin" | "signup";

const config: Record<AuthMode, {
  title: string;
  description: string;
  footer: { text: string; linkText: string; href: string };
}> = {
  signin: {
    title: "Welcome back",
    description: "Sign in and ranked your favorite artist.",
    footer: {
      text: "Don't have an account yet?",
      linkText: "Sign up",
      href: "/auth/signup",
    },
  },
  signup: {
    title: "Join rankify.fm",
    description: "Sign up and ranked your favorite artist.",
    footer: {
      text: "Already have an account?",
      linkText: "Sign in",
      href: "/auth/signin",
    },
  },
};

export default async function AuthPage({
  mode,
  searchParams,
}: {
  mode: AuthMode;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : "/";
  const { title, description, footer } = config[mode];

  return (
    <div className="rounded-xl border p-24">
      <div className="space-y-10">
        <div>
          <h2 className="text-center">{title}</h2>
          <p className="text-description text-center">{description}</p>
        </div>

        <SocialButton callbackUrl={callbackUrl} />

        <p className="text-center text-secondary-foreground">
          {footer.text}{" "}
          <span className="text-foreground underline">
            <Link href={`${footer.href}?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
              {footer.linkText}
            </Link>
          </span>
        </p>
      </div>
    </div>
  );
}

// src/app/auth/signin/page.tsx
import AuthPage from "../components/AuthPage";

export default function SignInPage({ searchParams }) {
  return <AuthPage mode="signin" searchParams={searchParams} />;
}

// src/app/auth/signup/page.tsx
import AuthPage from "../components/AuthPage";

export default function SignUpPage({ searchParams }) {
  return <AuthPage mode="signup" searchParams={searchParams} />;
}
```

---

**總結**：你的程式碼能動，但不夠優雅。問題的根源在於「用參數化來處理差異」而非「用資料結構來統一差異」。花點時間重構，你會感謝現在的自己。
