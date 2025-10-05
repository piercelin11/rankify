# Server Actions 錯誤處理統一優化計畫

> **目標：** 確保所有 Server Actions 的錯誤處理一致、類型安全，並提供統一的前端調用介面。

---

## 📋 任務概述

### 現狀問題
1. **Server Actions 錯誤處理不一致**
   - 部分有完整 try-catch，部分缺少
   - `requireAdmin()` / `getUserSession()` 可能 throw unhandled errors
   - 缺少統一的返回型別標註 `Promise<AppResponseType>`

2. **前端調用缺少統一抽象**
   - 部分組件直接調用 actions，無錯誤處理
   - 部分使用自訂 hooks (如 `useProfilePictureUpload`)
   - 缺少簡單的載入狀態與錯誤管理

3. **缺少 Server Components 錯誤邊界** (`error.tsx`)

### 解決方案
採用分層錯誤處理策略，每一層有明確的職責：
- **資料層 (DB)**: 返回原始資料或 `null`
- **業務邏輯層 (Services)**: 違反業務規則時 `throw Error`
- **授權層 (Authorization)**: 失敗時 `throw Error`
- **API 層 (Server Actions)**: 統一返回 `AppResponseType`，捕獲所有可能的 throw
- **UI 層 (Client Components)**: 使用 `useServerAction` hook 處理

---

## 🎯 階段規劃

### **階段 0：盤點現有問題** ✨ 優先級：最高

#### 目的
建立清晰的修復清單，避免遺漏。

#### 做法

##### 0.1 盤點所有 Server Actions (共 22 個)

執行以下指令自動化盤點：
```bash
# 找出所有包含 "use server" 的檔案
grep -r "use server" src --include="*.ts" --include="*.tsx" | cut -d: -f1 | sort -u

# 找出缺少型別標註的 actions (排除 GET 類型的 actions)
grep -r "export.*function" src/features/**/actions/*.ts 2>/dev/null | grep -v "Promise<AppResponseType>"
```

**Server Actions 分類：**

**A. 需要修復的 Actions (20 個) — 修改資料 (POST/PUT/DELETE)**
- `src/features/admin/addContent/actions/` (3 個)
- `src/features/admin/editContent/actions/` (5 個)
- `src/features/admin/user/actions/` (1 個)
- `src/features/auth/actions/` (1 個)
- `src/features/settings/actions/` (5 個)
- `src/features/sorter/actions/` (6 個)

**修復標準：**
- ✅ 有 try-catch + 型別標註 `Promise<AppResponseType>` + 捕獲所有 throw
- ⚠️ 缺少型別標註：無 `Promise<AppResponseType>`
- ⚠️ 缺少 try-catch：`requireAdmin()` / `getUserSession()` 未被捕獲
- ⚠️ 缺少錯誤處理：資料庫操作未被捕獲

**B. 已正確實作的 Actions (2 個) — 讀取資料 (GET)**
- `src/app/(main)/artist/[artistId]/album/[albumId]/actions.ts` (1 個: `getComparisonAlbumsData`)
- `src/app/(main)/artist/[artistId]/track/[trackId]/actions.ts` (1 個: `getComparisonTracksData`)

**已符合標準：**
- ✅ 有 try-catch
- ✅ 錯誤時返回空陣列 (合理的降級策略)
- ✅ `getUserSession()` 已被 catch 包裹
- ℹ️ 不需要返回 `AppResponseType` (因為是 GET,不是表單提交)

##### 0.2 盤點所有調用 Server Actions 的組件

執行以下指令：
```bash
# 搜尋整個 src 目錄,不僅限於 features
grep -r "import.*from.*actions" src --include="*.tsx"
```

分類標準：
- **高優先級：一般組件**
  - Admin 相關操作 (updateTrack, deleteItem 等)
  - Settings 相關操作 (saveProfileSettings, saveRankingSettings)
  - Sorter 相關操作 (completeSubmission 等)

- **低優先級：已有複雜邏輯的組件**
  - `useProfilePictureUpload` (S3 上傳 + 復原邏輯)
  - `useSorter` (throttle + transition + localStorage)
  - 原則：視情況決定是否套用，不強制

##### 0.3 產出修復清單 (Markdown 表格)

格式：
```markdown
| Action 檔案 | 問題 | 影響組件 | 優先級 |
|------------|------|---------|--------|
| updateTrack.ts | requireAdmin 未被 catch | TrackEditingForm.tsx | 高 |
| saveDraft.ts | 缺少型別標註 | useSorter.ts | 高 |
| ... | ... | ... | ... |
```

---

### **階段 1：修復所有 Server Actions** ✨ 優先級：高

#### 目的
確保所有 Server Actions 都不會拋出 unhandled errors。

#### 做法

##### 1.1 修復檢查清單 (針對每個 Action)

- [ ] 加上明確的返回型別標註 `Promise<AppResponseType>`
- [ ] 確保 `requireAdmin()` / `getUserSession()` 被 try-catch 包裹
- [ ] 確保所有資料庫操作被 try-catch 包裹
- [ ] 確保所有外部 API 呼叫被 try-catch 包裹
- [ ] 錯誤訊息從 `constants/messages` 取得

##### 1.2 修復範本

**❌ 錯誤範例：**
```typescript
export default async function updateTrack(...) {
  await requireAdmin(); // ← 未被 catch！

  const validatedField = updateTrackSchema.safeParse(formData);
  if (!validatedField.success) {
    return { type: "error", message: "..." };
  }

  await db.track.update(...); // ← 未被 catch！
  return { type: "success", message: "..." };
}
```

**✅ 正確範例：**
```typescript
export default async function updateTrack(...): Promise<AppResponseType> {
  try {
    await requireAdmin(); // ← 被 catch 包裹

    const validatedField = updateTrackSchema.safeParse(formData);
    if (!validatedField.success) {
      return { type: "error", message: "..." };
    }

    await db.track.update(...); // ← 被 catch 包裹
    revalidatePath(...);

    return { type: "success", message: "..." };
  } catch (err) {
    console.error(err);
    return { type: "error", message: "操作失敗" };
  }
}
```

##### 1.3 驗證流程

每修改一個 Server Action 後，執行：
```bash
npm run lint
npx tsc --noEmit
```

---

### **階段 2：建立 `useServerAction` Hook** ✨ 優先級：高

#### 目的
提供極簡的 hook，只做核心的事：transition wrapper + 型別安全。

#### 設計哲學
- **只做**：transition + Promise wrapper
- **不做**：不強制管理 error/data state（組件自己決定）
- **理由**：保持簡單，讓使用者自由組合，而非強加策略

#### 做法

##### 2.1 建立 `src/lib/hooks/useServerAction.ts`

```typescript
"use client";

import { useTransition, useCallback } from "react";
import { AppResponseType } from "@/types/response";

export function useServerAction<TArgs extends any[], TData>(
  action: (...args: TArgs) => Promise<AppResponseType<TData>>
) {
  const [isPending, startTransition] = useTransition();

  const execute = useCallback(
    (...args: TArgs) => {
      return new Promise<AppResponseType<TData>>((resolve) => {
        startTransition(async () => {
          resolve(await action(...args));
        });
      });
    },
    [action]
  );

  return { execute, isPending };
}
```

##### 2.2 使用範例

**簡單場景（Admin 表單）：**
```typescript
"use client";

import { useServerAction } from "@/lib/hooks/useServerAction";
import { updateTrack } from "@/features/admin/actions/updateTrack";
import { useState } from "react";
import { toast } from "sonner";

export function TrackEditingForm() {
  const { execute, isPending } = useServerAction(updateTrack);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await execute(formData);

    if (result.type === "error") {
      setError(result.message);
    } else {
      toast.success(result.message);
      onClose();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500">{error}</p>}
      <button disabled={isPending}>
        {isPending ? "處理中..." : "送出"}
      </button>
    </form>
  );
}
```

**複雜場景（組合其他邏輯）：**
```typescript
// useSorter 可以這樣用
const { execute } = useServerAction(saveDraft);
const throttledSave = useThrottle(execute, 500);

// 自己組合 throttle + localStorage，清楚明瞭
```

#### 優點
- **極簡**：只有 20 行，沒有複雜邏輯
- **通用**：所有場景都適用（因為什麼都不假設）
- **彈性**：組件自己決定要不要存 error/data state
- **TypeScript 友善**：完整的型別推導

---

---

### **階段 3：遷移前端組件** ✨ 優先級：高

#### 目的
確保所有調用 Server Actions 的組件都有統一的錯誤處理。

#### 做法

##### 3.1 優先級分類

**高優先級（一般組件）：**
- Admin 操作：`TrackEditingForm.tsx`, `AlbumEditingForm.tsx` 等
- Settings 操作：ProfileSettings, RankingSettings 相關組件
- Sorter 操作：`ResultStage.tsx` (completeSubmission 等)

**低優先級（已有複雜邏輯的組件）：**
- `useProfilePictureUpload` (S3 上傳 + 復原邏輯)
- `useSorter` (throttle + transition + localStorage)
- 原則：視情況決定，不強制統一

##### 3.2 遷移範本

**Before：**
```typescript
const onSubmit = async (data: FormData) => {
  const response = await updateTrack({ ... });
  if (response.type === "success") {
    onClose();
  }
  // 無錯誤處理、無 loading 狀態
};
```

**After：**
```typescript
const { execute, isPending } = useServerAction(updateTrack);
const [error, setError] = useState<string | null>(null);

const onSubmit = async (data: FormData) => {
  setError(null);
  const result = await execute({ ... });

  if (result.type === "error") {
    setError(result.message);
  } else {
    toast.success(result.message);
    onClose();
  }
};

// 在 UI 中顯示錯誤與載入狀態
{error && <p className="text-red-500">{error}</p>}
<Button disabled={isPending}>{isPending ? "處理中..." : "送出"}</Button>
```

##### 3.3 複雜邏輯組件處理

**有特殊業務邏輯的組件（如 `useSorter`, `useProfilePictureUpload`）：**
- 可以選擇使用 `useServerAction` 的 `execute`，搭配自己的狀態管理
- 也可以選擇直接調用 action（如果已有完整的錯誤處理）
- 原則：根據實際情況選擇最簡單的做法

**一般組件（如 `ResultStage.tsx`, Admin 表單等）：**
- 使用 `useServerAction` 統一處理 transition
- 自己決定是否需要存 error/data state

##### 3.4 驗證流程

每遷移一個組件後：
```bash
npm run lint
npx tsc --noEmit
npm run test  # 如果有相關測試
```

---

### **階段 4：建立 Server Components 錯誤邊界** ✨ 優先級：中

#### 目的
處理 Server Components 中未預期的錯誤，提供友善的錯誤 UI。

#### 做法

##### 4.1 建立 `src/app/(main)/error.tsx`

```typescript
"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Server Component Error:", error);

  return (
    <div>
      <h2>發生錯誤</h2>
      <p>{error.message || "系統錯誤"}</p>
      <button onClick={reset}>重試</button>
    </div>
  );
}
```

**說明：** 樣式交給 Tailwind 或 UI 元件處理,核心邏輯保持極簡。

##### 4.2 建立 `src/app/(main)/not-found.tsx` (如果尚未建立)

```typescript
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h2>404</h2>
      <p>找不到此頁面</p>
      <Link href="/">返回首頁</Link>
    </div>
  );
}
```

##### 4.3 在需要的 Server Component 中使用 `notFound()`

```typescript
// src/app/(main)/artist/[id]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/db/client";

export default async function ArtistPage({ params }: { params: { id: string } }) {
  const artist = await db.artist.findUnique({
    where: { id: params.id },
  });
  
  if (!artist) {
    notFound(); // 觸發 not-found.tsx
  }
  
  // ... 其他邏輯
}
```

#### 原因
- **使用者體驗**：提供友善的錯誤訊息，而非白屏或技術錯誤
- **除錯方便**：錯誤會被 console.error 記錄
- **Next.js 最佳實踐**：利用框架內建機制

---

### **階段 5：制定錯誤處理規範文件** ✨ 優先級：中

#### 目的
讓團隊成員清楚知道在不同層級該如何處理錯誤。

#### 做法

##### 5.1 建立 `docs/ERROR_HANDLING.md` (精簡版)

```markdown
# 錯誤處理規範

## 核心原則：每一層只做一件事

| 層級 | 職責 | 錯誤處理策略 |
|------|------|------------|
| **DB 層** (`src/db/*`) | 返回資料 | 只在資料完整性錯誤時 `throw` |
| **Services 層** | 業務邏輯 | 違反規則時 `throw` |
| **Actions 層** (`src/features/**/actions/*`) | API 介面 | **永不 throw**,統一返回 `AppResponseType` |
| **Auth 層** | 權限檢查 | 失敗時 `throw` |
| **Server Components** | 渲染 | 404 → `notFound()`, 500 → 讓它 throw |
| **Client Components** | 互動 | 使用 `useServerAction` |

---

## 修復 Server Action 範例

**Before (❌ 錯誤):**
\`\`\`typescript
export default async function updateTrack(...) {
  await requireAdmin(); // 未被 catch
  await db.track.update(...); // 未被 catch
  return { type: "success", message: "..." };
}
\`\`\`

**After (✅ 正確):**
\`\`\`typescript
export default async function updateTrack(...): Promise<AppResponseType> {
  try {
    await requireAdmin();
    await db.track.update(...);
    revalidatePath(...);
    return { type: "success", message: "..." };
  } catch (err) {
    console.error(err);
    return { type: "error", message: "操作失敗" };
  }
}
\`\`\`

---

## Server Components 錯誤處理

**404 → 使用 `notFound()`:**
\`\`\`typescript
import { notFound } from 'next/navigation';

export default async function ArtistPage({ params }) {
  const artist = await db.artist.findUnique({ where: { id: params.id } });
  if (!artist) notFound();
  return <ArtistView artist={artist} />;
}
\`\`\`

**500 → 讓它 throw 給 error.tsx:**
\`\`\`typescript
export default async function DashboardPage() {
  const stats = await db.trackRanking.groupBy(...); // 失敗會自動 throw
  return <StatsDisplay stats={stats} />;
}
\`\`\`

---

## 檢查清單

- [ ] 所有 POST/PUT/DELETE Actions 都有 `Promise<AppResponseType>` 型別標註
- [ ] 所有可能 throw 的函式都被 try-catch 包裹
- [ ] Client Components 使用 `useServerAction`
- [ ] 主要路由都有 `error.tsx` 與 `not-found.tsx`
\`\`\`

#### 原因
- **知識傳承**：新成員可以快速了解專案規範
- **減少錯誤**：明確的指引減少不一致的實作
- **可維護性**：統一的模式讓程式碼更容易理解

---

---

## 📝 實作順序建議

### **第一階段：盤點與基礎建設** (優先執行)

1. **執行階段 0：盤點**
   - 產出所有 Server Actions 的問題清單
   - 產出所有前端組件的遷移清單
   - 建立 Markdown 表格，明確修復順序

2. **執行階段 2：建立 useServerAction hook**
   - 實作 `src/lib/hooks/useServerAction.ts`
   - 撰寫使用範例文件

### **第二階段：修復 Server Actions** (核心任務)

3. **執行階段 1：修復所有 Server Actions**
   - 按照盤點清單，逐一修復 21 個 actions
   - 每修復一個，執行 lint + tsc 驗證
   - 優先順序：
     - 高：Admin 相關、Settings 相關
     - 中：Sorter 相關
     - 低：其他

### **第三階段：前端遷移** (確保統一調用)

4. **執行階段 3：遷移前端組件**
   - 優先遷移一般組件：Admin、Settings、Sorter 等
   - 複雜邏輯組件（useSorter、useProfilePictureUpload）視情況決定

### **第四階段：完善基礎設施** (降低未來風險)

5. **執行階段 4：建立錯誤邊界**
   - 建立 `error.tsx` 與 `not-found.tsx`
   - 在現有 Server Components 加入 `notFound()` 處理

6. **執行階段 5：文件化**
   - 撰寫 `docs/ERROR_HANDLING.md`
   - 提供清晰的範例與檢查清單

---

## ✅ 成功指標

- [ ] **階段 0 完成**：產出完整的修復清單 (Markdown 表格)
- [ ] **階段 1 完成**：所有 20 個 POST/PUT/DELETE Actions 都有 `Promise<AppResponseType>` 型別標註 + 完整 try-catch (GET Actions 已正確實作,無需修改)
- [ ] **階段 2 完成**：`useServerAction` hook 建立並有使用範例
- [ ] **階段 3 完成**：一般組件都使用 `useServerAction`（複雜邏輯組件視情況決定）
- [ ] **階段 4 完成**：所有主要路由都有 `error.tsx` 與 `not-found.tsx`
- [ ] **階段 5 完成**：`ERROR_HANDLING.md` 文檔完成，包含清晰的 Before/After 範例
- [ ] **最終驗證**：執行 `npm run lint` 與 `npx tsc --noEmit` 無錯誤

---

## 🎓 延伸閱讀

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [React useTransition](https://react.dev/reference/react/useTransition)
- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions)

---

---

## 📌 重要提醒

### **為什麼不引入 `Result<T>` 型別？**

雖然 `Result<T>` 是更類型安全的選擇（使用 discriminated union），但在當前情境下：

1. **`AppResponseType` 已經足夠**
   - 專案已廣泛使用 `AppResponseType`
   - 型別標註 `Promise<AppResponseType>` 已能強制開發者處理錯誤
   - 引入新型別會造成「該用哪個？」的困惑

2. **避免過度設計**
   - 當前問題是「缺少統一的錯誤處理」，而非「型別不夠安全」
   - 先解決實際問題（unhandled errors），再評估是否需要更強的型別

3. **可在未來引入**
   - 如果未來發現 `AppResponseType` 不夠用，可以漸進式遷移
   - 但目前不是優先任務

---

**文件版本：** 2.0
**最後更新：** 2025-10-04
**維護者：** Development Team
