# Rankify Auth Refactoring Plan - Linus Review 修正版

> **目標**: 修正 TypeScript 型別錯誤、重構驗證架構、啟用 Middleware 驗證

**建立日期**: 2025-12-19
**修正日期**: 2025-12-19
**預計執行時間**: 2 小時
**影響範圍**: 24 個檔案

---

## 【Linus Review 核心判斷】

### ✅ 值得做,採用黑名單策略

**原計劃評估結果**:
1. ✅ 使用黑名單策略(privateRoutes)符合專案特性
2. ✅ Phase 4 元件拆分可延後(當前 160 行,未超過 200 行門檻)
3. ❌ 未優先修復 [proxy.ts:32](../src/proxy.ts#L32) 的 Syntax Error

**路由分布分析**:
- 公開路由: 2 個 (當前) - `/`, `/artist/:id`
- 私密路由: 8 個 - `/settings`, `/sorter/*`, `/artist/:id/album/:id`, `/artist/:id/track/:id`, `/artist/:id/community`, `/artist/:id/:submissionId`
- Admin 路由: 4 個 - `/admin/*`

**使用黑名單的理由**:
1. Rankify 本質是「音樂瀏覽平台」,公開內容是主體
2. 未來新增公開頁面(如 `/artist/:id/biography`)時無需維護路由配置
3. 私密路由清單明確(Settings, Sorter, Community, Album, Track, 快照頁面)

**修正後的優先級**:
- 🔴 **P0+**: 修復 proxy.ts:32 的 Syntax Error(阻塞編譯)
- 🔴 **P0**: 使用黑名單策略(privateRoutes)重構 Middleware
- 🔴 **P0**: 修正 TypeScript 型別錯誤
- 🟢 **P1**: Admin Layout 保護
- ⚪ **P2**: Guest/User 拆分(延後執行,當前不需要)

---

## 一、執行計劃

### Phase 1: 緊急修復 Syntax Error (🔴 P0+ - 5 分鐘)

**檔案**: [src/proxy.ts:32](../src/proxy.ts#L32)

**問題**: 孤立的 `return` 導致編譯失敗

**修改**:
```typescript
// ❌ Before (line 30-35)
    return;
}
return  // ← 移除這行
if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/signin", nextUrl.origin));
}

// ✅ After
    return;
}

if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/signin", nextUrl.origin));
}
```

**驗證**: `npx tsc --noEmit` 應該能編譯成功

---

### Phase 2: Auth 函式重構 (🔴 P0 - 15 分鐘)

**檔案**: [auth.ts](../auth.ts)

**目標**: 建立型別安全且語意清晰的驗證函式

**修改內容**:

```typescript
// 1. 重新命名: getCurrentSession() → getSession()
export async function getSession() {
    const session = await auth();
    if (!session?.user?.id || !session.user.role || !session.user.name) {
        return null;
    }
    return session.user;
}

// 2. 新增 requireSession() - 型別安全 + Fail-safe
export async function requireSession() {
    const user = await getSession();
    if (!user) {
        // 理論上不會發生(Middleware 已保護)
        // 如果發生,代表 Middleware 配置錯誤,直接重導而非拋錯
        redirect("/auth/signin");
    }
    return user;
}

// 3. requireAdmin() 維持不變(已經正確)
export async function requireAdmin() {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Forbidden: Admin access required");
    }
    return session;
}
```

**關鍵設計決策**:
- `requireSession()` 使用 `redirect()` 而非 `throw Error`,避免觸發 Error Boundary
- 提供雙層防護: Middleware 負責主要驗證,`requireSession()` 作為 Fail-safe
- 型別安全: 回傳保證是 `User`,無需在 Page 中寫 Type Guard

**影響範圍**: 23 個檔案需要更新 import

---

### Phase 3: Middleware 黑名單重構 (🔴 P0 - 30 分鐘)

#### 3.1 定義私密路由黑名單

**檔案**: [src/config/route.ts](../src/config/route.ts)

**策略**: 使用**黑名單**(privateRoutes),預設所有路由公開

**修改內容**:

```typescript
/**
 * 私密路由黑名單(需要驗證)
 * 預設策略: 所有路由公開,除非明確列在此清單
 * @type {string[]}
 */
export const privateRoutes: string[] = [
    "/settings",                            // 個人設定
    "/settings/ranking",                    // 排名設定
    "/sorter/album/:albumId",               // Album Sorter (未來會公開)
    "/sorter/artist/:artistId",             // Artist Sorter (未來會公開)
    "/artist/:artistId/album/:albumId",     // Album 詳情 (未來會公開)
    "/artist/:artistId/track/:trackId",     // Track 詳情 (未來會公開)
    "/artist/:artistId/community",          // 社群頁面
    "/artist/:artistId/:submissionId",      // 快照頁面
];

/**
 * Admin 路由(需要 ADMIN 角色)
 * @type {string[]}
 */
export const adminRoutes: string[] = [
    "/admin",
];

// authRoutes, apiAuthPrefix, DEFAULT_LOGIN_REDIRECT 保持不變
```

**設計理由**:
1. **符合專案定位**: Rankify 是音樂瀏覽平台,公開內容是主體
2. **未來擴展性**: 新增公開頁面(如 `/artist/:id/biography`)時無需維護路由配置
3. **私密路由明確**: Settings, Sorter, Album, Track, Community, 快照頁面清單清晰

---

#### 3.2 簡化 Middleware 邏輯

**檔案**: [src/proxy.ts](../src/proxy.ts)

**依賴**: 安裝 `path-to-regexp`
```bash
pnpm add path-to-regexp
```

**修改內容**:

```typescript
import authConfig from "../auth.config";
import NextAuth from "next-auth";
import { privateRoutes, adminRoutes, authRoutes, apiAuthPrefix, DEFAULT_LOGIN_REDIRECT } from "./config/route";
import { NextResponse } from "next/server";
import { match } from "path-to-regexp";

const { auth } = NextAuth(authConfig);

export default auth(async function proxy(req) {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    // 1. API Auth 路由直接放行
    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    if (isApiAuthRoute) return;

    // 2. Auth 路由: 已登入者重導到首頁
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);
    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl.origin));
        }
        return;
    }

    // 3. 檢查是否為私密路由(黑名單)
    const isPrivateRoute = privateRoutes.some((route) => {
        const matcher = match(route, { decode: decodeURIComponent });
        return matcher(nextUrl.pathname);
    });

    // 4. 未登入且訪問私密路由 → 重導到登入頁
    if (!isLoggedIn && isPrivateRoute) {
        return Response.redirect(new URL("/auth/signin", nextUrl.origin));
    }

    // 5. Admin 路由保護
    const isAdminRoute = adminRoutes.some(route => nextUrl.pathname.startsWith(route));
    if (isAdminRoute && isLoggedIn && req.auth?.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/", nextUrl.origin));
    }

    // 6. Server Action 請求直接放行
    const isServerAction = req.headers.get("Next-Action") !== null;
    if (isServerAction) {
        return NextResponse.next();
    }

    // 7. 正常請求: 加入自訂 header
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-current-path", nextUrl.pathname);
    return NextResponse.next({
        request: { headers: requestHeaders },
    });
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

**移除內容**:
- ❌ 刪除 `isPublicRoute = true` 註解(line 20)
- ❌ 刪除孤立的 `return`(line 32)
- ❌ 刪除整個 TODO 註解(line 19)

**關鍵修改**:
- 將 `publicRoutes` 改為 `privateRoutes` import
- 將 `isPublicRoute` 檢查改為 `isPrivateRoute` 檢查
- 邏輯反轉: `!isLoggedIn && !isPublicRoute` → `!isLoggedIn && isPrivateRoute`

---

### Phase 4: 更新所有 getCurrentSession() 呼叫 (🔴 P0 - 45 分鐘)

#### 策略分類

| 檔案類型 | 使用函式 | 範例 |
|---------|---------|------|
| **需要驗證的 Pages** | `requireSession()` | Settings, Sorter, Album, Track |
| **條件渲染的 Pages** | `getSession()` | 首頁, Artist 頁面 |
| **Server Actions** | `requireSession()` | 所有 actions/* |

#### 4.1 需要驗證的 Pages (9 個檔案)

**清單**:
1. `src/app/(main)/settings/page.tsx`
2. `src/app/(main)/settings/ranking/page.tsx`
3. `src/app/(main)/artist/[artistId]/(artist)/[submissionId]/page.tsx`
4. `src/app/(main)/artist/[artistId]/album/[albumId]/page.tsx`
5. `src/app/(main)/artist/[artistId]/track/[trackId]/page.tsx`
6. `src/app/sorter/album/[albumId]/page.tsx`
7. `src/app/sorter/artist/[artistId]/page.tsx`
8. `src/app/(main)/artist/[artistId]/album/[albumId]/actions.ts`
9. `src/app/(main)/artist/[artistId]/track/[trackId]/actions.ts`

**修改範例**:
```typescript
// ❌ Before (型別錯誤)
import { getCurrentSession } from "@/../auth";
const { id: userId } = await getCurrentSession();

// ✅ After (型別安全)
import { requireSession } from "@/../auth";
const { id: userId } = await requireSession();
```

---

#### 4.2 條件渲染的 Pages (3 個檔案)

**清單**:
1. `src/app/(main)/layout.tsx`
2. `src/app/(main)/page.tsx`
3. `src/app/(main)/artist/[artistId]/(artist)/page.tsx`

**修改範例**:
```typescript
// ❌ Before
import { getCurrentSession } from "@/../auth";
const user = await getCurrentSession();

// ✅ After
import { getSession } from "@/../auth";
const user = await getSession();

if (!user) {
    return <GuestView />;
}
return <UserView userId={user.id} />;
```

---

#### 4.3 Server Actions (10 個檔案)

**清單**:
1. `src/features/settings/actions/saveProfileSettings.ts`
2. `src/features/settings/actions/saveRankingSettings.ts`
3. `src/features/settings/actions/generatePresignedUploadUrl.ts`
4. `src/features/settings/actions/updateUserProfileImage.ts`
5. `src/features/settings/actions/deleteUserImageOnS3.ts`
6. `src/features/sorter/actions/createSubmission.ts`
7. `src/features/sorter/actions/saveDraft.ts`
8. `src/features/sorter/actions/completeSubmission.ts`
9. `src/features/sorter/actions/finalizeDraft.ts`
10. `src/features/sorter/actions/deleteSubmission.ts`

**修改範例**:
```typescript
// ❌ Before
import { getCurrentSession } from "@/../auth";
try {
    const { id: userId } = await getCurrentSession();
    // ...
} catch (error) {
    return { type: "error", message: "Failed" };
}

// ✅ After
import { requireSession } from "@/../auth";
try {
    const { id: userId } = await requireSession();
    // ...
} catch (error) {
    return { type: "error", message: "Failed" };
}
```

---

### Phase 5: Admin Layout 保護 (🟢 P1 - 10 分鐘)

**檔案**: `src/app/(main)/admin/layout.tsx` (需新建或修改)

**目標**: 在 Layout 層級加入 `requireAdmin()` 驗證

**內容**:

```typescript
import { requireAdmin } from "@/../auth";

type AdminLayoutProps = {
    children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
    await requireAdmin();
    return <>{children}</>;
}
```

**影響**: 所有 `/admin/*` 路由自動受保護(雙層防護: Middleware + Layout)

---

### Phase 6: Guest/User 元件拆分 (⚪ P2 - 延後執行)

**執行條件**: 只有在以下情況才執行
1. 單一 Page 檔案超過 200 行
2. Guest/User 邏輯各自有 3+ 層巢狀
3. 需要在多個地方重用元件

**當前狀況**: `artist/[artistId]/page.tsx` 約 160 行,**不需要拆分**

**理由**:
- Guest 邏輯: 44 行(單純的相冊網格)
- User 邏輯: 70 行(統計功能)
- `if (!user)` early return 已經很清晰
- 拆分後會增加心智負擔(需要在 3 個檔案間跳轉)

---

### Phase 7: 驗證與測試 (🟢 P2 - 20 分鐘)

#### 7.1 TypeScript 編譯檢查
```bash
npx tsc --noEmit
```
**預期**: 0 errors

#### 7.2 Linting 檢查
```bash
pnpm lint
```
**預期**: 0 warnings

#### 7.3 手動測試清單

| 測試項目 | 路由 | 預期行為 |
|---------|------|----------|
| Guest 訪問首頁 | `/` | 顯示 Guest 首頁 |
| Guest 訪問 Artist | `/artist/[id]` | 顯示相冊網格 |
| Guest 訪問 Album | `/artist/[id]/album/[id]` | 重導到 `/auth/signin` |
| Guest 訪問 Track | `/artist/[id]/track/[id]` | 重導到 `/auth/signin` |
| Guest 訪問 Settings | `/settings` | 重導到 `/auth/signin` |
| Guest 訪問 Sorter | `/sorter/artist/[id]` | 重導到 `/auth/signin` |
| Guest 訪問 Community | `/artist/[id]/community` | 重導到 `/auth/signin` |
| User 訪問 Artist | `/artist/[id]` | 顯示統計資料 |
| User 訪問 Settings | `/settings` | 正常顯示 |
| User 訪問 Admin | `/admin` | 重導到 `/` |
| Admin 訪問 Admin | `/admin` | 正常顯示 |

---

## 二、未來規劃與當前範圍

### 使用者確認的未來規劃:
- ✅ Album/Track 詳情頁未來會改成**公開**
- ✅ Sorter 頁面未來也會改成**公開**

### 當前執行範圍(此次重構):
**只處理當前的型別錯誤和 Middleware 問題,不改變現有的頁面存取權限**

**具體做法**:
1. Album/Track 詳情頁**保持需登入**(因為當前沒有 Guest 邏輯)
2. Sorter 頁面**保持需登入**(未來才會開放)
3. `privateRoutes` 包含所有當前需要登入的路由

**理由**:
- 此次重構專注於「修復型別錯誤」和「啟用 Middleware 驗證」
- Guest 邏輯的實作是另一個獨立任務,不應混在一起
- 未來開放 Album/Track/Sorter 時,只需:
  1. 從 `privateRoutes` 移除對應路由
  2. 為這些頁面加入 Guest 顯示邏輯

---

## 三、檔案修改清單總覽

### 🔴 P0+ (緊急修復 - 5 分鐘)
- `src/proxy.ts` - 修復 Syntax Error

### 🔴 P0 (核心重構 - 90 分鐘)
1. `auth.ts` - 重新命名 + 新增 `requireSession()`
2. `src/config/route.ts` - 新增 `privateRoutes`
3. `src/proxy.ts` - 重構 Middleware 邏輯
4. 23 個檔案 - 更新 `getCurrentSession()` → `getSession()` / `requireSession()`

### 🟢 P1 (安全加固 - 10 分鐘)
- `src/app/(main)/admin/layout.tsx` - 新增 Admin Layout 保護

### ⚪ P2 (可選優化 - 延後)
- Phase 6: Guest/User 元件拆分(目前不需要)

---

## 四、關鍵設計決策總結

### 1. 路由策略: 黑名單(privateRoutes) ✅
**理由**:
- Rankify 是音樂瀏覽平台,公開內容是主體
- 私密路由清單清晰且數量有限
- 未來新增公開頁面時無需維護路由配置

### 2. requireSession() 使用 redirect() 而非 throw Error ✅
**理由**:
- 避免觸發 Error Boundary(使用者體驗差)
- Middleware 已保護私密路由,`requireSession()` 只是 Fail-safe
- 型別安全: 回傳保證是 `User`,無需 Type Guard

### 3. 元件拆分延後執行 ✅
**理由**:
- 當前檔案 160 行,未超過 200 行門檻
- `if (!user)` early return 已經很清晰
- 拆分後會增加維護成本

### 4. Syntax Error 優先修復 ✅
**理由**:
- [proxy.ts:32](../src/proxy.ts#L32) 阻塞編譯,必須立即修復
- 不應該讓編譯失敗的程式碼留在 codebase

---

## 五、成功指標

- [ ] proxy.ts:32 的 Syntax Error 已修復
- [ ] TypeScript 編譯 0 errors
- [ ] ESLint 0 warnings
- [ ] Guest 可以瀏覽 `/`, `/artist/[id]`
- [ ] Guest 訪問私密路由會重導到登入頁
- [ ] User 可以訪問所有功能
- [ ] Admin 可以訪問後台

---

**總時間**: 2 小時
**程式碼變化**: 淨減少 50 行
**新增檔案數**: 1 個(admin layout)

**計劃完成** ✅
