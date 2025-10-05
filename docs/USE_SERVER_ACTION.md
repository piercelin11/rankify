# useServerAction Hook 使用指南

> 為 Server Actions 提供極簡的 transition wrapper + 型別安全

---

## 📦 基本用法

### 1. 簡單場景 (Admin 表單)

```typescript
"use client";

import { useServerAction } from "@/lib/hooks/useServerAction";
import { updateTrack } from "@/features/admin/editContent/actions/updateTrack";
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

---

## 🔧 進階用法

### 2. 組合其他 Hook (Sorter)

```typescript
import { useServerAction } from "@/lib/hooks/useServerAction";
import { saveDraft } from "@/features/sorter/actions/saveDraft";
import { useDebounce } from "@/lib/hooks/useDebounceAndThrottle";

export function useSorter() {
  const { execute } = useServerAction(saveDraft);
  const debouncedSave = useDebounce(execute, 500);

  // 自己組合 debounce + localStorage,清楚明瞭
  const handleSave = (data: SorterState) => {
    localStorage.setItem("draft", JSON.stringify(data));
    debouncedSave(data, submissionId);
  };

  return { handleSave };
}
```

### 3. 處理返回資料 (Settings)

```typescript
import { useServerAction } from "@/lib/hooks/useServerAction";
import { saveProfileSettings } from "@/features/settings/actions/saveProfileSettings";

export function ProfileForm() {
  const { execute, isPending } = useServerAction(saveProfileSettings);

  async function handleSubmit(formData: ProfileSettingsType) {
    const result = await execute(formData);

    if (result.type === "success") {
      // 可以訪問 result.data (如果有的話)
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## ✨ 設計哲學

### 只做核心的事

**✅ 做:**
- `useTransition` wrapper (React 18 並發特性)
- Promise wrapper (確保 `execute` 返回 Promise)
- 型別安全 (完整的 TypeScript 推導)

**❌ 不做:**
- 不強制管理 `error` state (組件自己決定)
- 不強制管理 `data` state (組件自己決定)
- 不內建 toast (組件自己選擇通知方式)

### 為什麼這樣設計?

**理由:**
- **簡單**: 只有 20 行,沒有複雜邏輯
- **通用**: 所有場景都適用 (因為什麼都不假設)
- **彈性**: 組件自己決定要不要存 error/data state
- **可組合**: 可以跟其他 hooks 自由組合 (debounce, throttle, localStorage)

---

## 📋 API 參考

### `useServerAction<TArgs, TData>(action)`

**參數:**
- `action`: Server Action 函式 `(...args: TArgs) => Promise<AppResponseType<TData>>`

**返回值:**
```typescript
{
  execute: (...args: TArgs) => Promise<AppResponseType<TData>>,
  isPending: boolean
}
```

**型別推導:**
```typescript
// 自動推導參數與返回值型別
const { execute, isPending } = useServerAction(updateTrack);
//    ^? execute: (formData: FormData) => Promise<AppResponseType>
//       isPending: boolean
```

---

## 🎯 使用場景

### 適合使用 `useServerAction` 的場景

✅ **一般表單提交** (Admin、Settings)
- 簡單的 CRUD 操作
- 需要 loading 狀態與錯誤處理

✅ **需要 transition 的操作** (Sorter)
- 需要 React 18 並發特性
- 需要非阻塞式 UI 更新

### 不一定需要使用的場景

⚠️ **已有複雜邏輯的組件**
- `useProfilePictureUpload` (S3 上傳 + 復原邏輯)
- `useSorter` (throttle + transition + localStorage)
- 原則:可以選擇使用 `execute`,也可以直接調用 action

---

## 🔍 常見問題

### Q1: 為什麼不內建 `error` state?

**A:** 讓組件自己決定如何處理錯誤:
- 有些組件用 `useState` 存 error
- 有些組件直接 `toast.error()`
- 有些組件用 form library 的錯誤處理

### Q2: 可以跟 React Hook Form 一起用嗎?

**A:** 可以!
```typescript
const { execute, isPending } = useServerAction(updateTrack);
const { handleSubmit } = useForm();

const onSubmit = handleSubmit(async (data) => {
  const result = await execute(data);
  if (result.type === "error") {
    setError("root", { message: result.message });
  }
});
```

### Q3: 為什麼要用 `useCallback`?

**A:** 確保 `execute` 函式的引用穩定,避免無限重渲染。

---

## 📚 延伸閱讀

- [React useTransition](https://react.dev/reference/react/useTransition)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)

---

**Generated by Claude Code** 🤖
