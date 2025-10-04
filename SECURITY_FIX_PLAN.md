# 🛡️ Rankify 資安修復計劃 (Security Fix Plan)

> **建立日期**: 2025-10-04
> **專案**: Rankify - 音樂排名應用程式
> **目標**: 修復 OWASP Top 10 資安漏洞,確保應用程式達到上線標準

---

## 📋 目錄 (Table of Contents)

1. [執行摘要 (Executive Summary)](#執行摘要)
2. [需解決的核心問題 (Core Issues)](#需解決的核心問題)
3. [修復優先級矩陣 (Priority Matrix)](#修復優先級矩陣)
4. [詳細修復計劃 (Detailed Fix Plan)](#詳細修復計劃)
5. [測試檢查清單 (Testing Checklist)](#測試檢查清單)
6. [上線前檢查 (Pre-Launch Checklist)](#上線前檢查)

---

## 執行摘要 (Executive Summary)

### 🎯 專案目標
修復應用程式中的權限控制漏洞與輸入驗證不足問題,確保符合資安最佳實踐。

### 📊 風險評估結果
- **🔴 Critical (嚴重)**: 3 項 - 權限控制完全失效
- **🟠 High (高)**: 1 項 - 檔案上傳驗證不足
- **🟡 Medium (中)**: 3 項 - 缺乏速率限制、依賴套件漏洞、searchParams 驗證
- **⚪ Low (低)**: 0 項

### ⏱️ 預估時程
- **Phase 1 (Critical)**: 2.5 小時
- **Phase 2 (High)**: 2 小時
- **Phase 3 (Medium)**: 1 小時
- **Phase 4 (Testing)**: 1.5 小時
- **總計**: 7 小時

---

## 需解決的核心問題 (Core Issues)

### 問題 1: 垂直權限提升 (Vertical Privilege Escalation)
**OWASP 分類**: A01:2021 - Broken Access Control

**現況描述**:
```typescript
// src/middleware.ts (Line 13-33)
export default auth(async function middleware(req) {
  const isLoggedIn = !!req.auth;

  // ❌ 只檢查是否登入,沒有檢查角色
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/signin", nextUrl.origin));
  }
  // ⚠️ /admin 路由完全沒有角色驗證!
});
```

**攻擊情境**:
1. 攻擊者註冊一個普通帳號 (role: USER)
2. 手動在瀏覽器輸入 `/admin/user`
3. 成功進入管理後台,可以看到所有使用者資料
4. 呼叫 Server Actions 修改/刪除任何資料

**影響範圍**:
- `/admin/user` - 使用者管理頁面
- `/admin/artist` - 藝人管理頁面
- `/admin/album/[id]` - 專輯編輯頁面
- 所有 Admin Server Actions (8 個檔案)

---

### 問題 2: Server Actions 缺乏權限檢查
**OWASP 分類**: A01:2021 - Broken Access Control

**現況描述**:
```typescript
// src/features/admin/editContent/actions/deleteItem.ts
export default async function deleteItem({ type, id }: DeleteItemProps) {
  // ❌ 沒有檢查呼叫者的角色
  await db.artist.delete({ where: { id } }); // 任何人都能刪除!
}
```

**攻擊情境**:
即使修復了 middleware,攻擊者仍可透過瀏覽器開發者工具:
1. 打開 Network 面板,觀察正常操作時的請求
2. 複製請求的 headers 與 body
3. 使用 `fetch()` 直接向 Server Action 發送請求
4. 繞過前端介面,成功執行管理員操作

**受影響的檔案** (9 個):
- `src/features/admin/addContent/actions/addAlbum.ts`
- `src/features/admin/addContent/actions/addArtist.ts`
- `src/features/admin/addContent/actions/addSingle.ts`
- `src/features/admin/editContent/actions/deleteItem.ts`
- `src/features/admin/editContent/actions/updateAlbum.ts`
- `src/features/admin/editContent/actions/updateArtist.ts`
- `src/features/admin/editContent/actions/updateInfo.ts`
- `src/features/admin/editContent/actions/updateTrack.ts`
- `src/features/admin/user/actions/updateUser.ts`

---

### 問題 3: 檔案上傳驗證不足
**OWASP 分類**: A08:2021 - Software and Data Integrity Failures

**現況描述**:
```typescript
// src/features/settings/actions/generatePresignedUploadUrl.ts (Line 53-58)
if (!fileType.startsWith("image/")) {
  return { type: "error", message: "Invalid type" };
}
// ❌ 只檢查 MIME type 字串,攻擊者可以偽造
// ❌ 沒有檔案大小限制
```

**攻擊情境**:
1. 攻擊者偽造請求: `{ fileName: "huge.jpg", fileType: "image/jpeg" }`
2. 後端產生 S3 上傳 URL
3. 攻擊者上傳一個 1GB 的惡意檔案 (實際上是偽裝成 .jpg 的 .exe)
4. 產生高額 S3 儲存費用 + 潛在的安全風險

**缺失的驗證**:
- ✅ MIME type 驗證 (已有,但不夠嚴格)
- ❌ 檔案大小限制
- ❌ 檔案副檔名白名單
- ❌ 上傳頻率限制

---

### 問題 4: searchParams 輸入驗證不足
**OWASP 分類**: A03:2021 - Injection

**現況描述**:
```typescript
// src/app/(main)/artist/[artistId]/(artist)/history/[dateId]/page.tsx (Line 16)
const queryString = view ? `?view=${view}` : "";
redirect(`/artist/${artistId}/my-stats/${dateId}${queryString}`);
// ❌ 直接將 searchParams 拼接到 URL,沒有驗證
```

**風險**:
雖然不會導致 XSS (React 會 escape),但可能造成:
1. **Open Redirect**: `?view=../../evil.com` (需檢查是否可能)
2. **UI 錯誤**: 非預期的 view 值導致介面崩潰
3. **邏輯錯誤**: 條件判斷失效,執行不必要的資料庫查詢

**受影響的檔案** (3 個):
- `src/app/(main)/artist/[artistId]/(artist)/my-stats/page.tsx` (✅ 已驗證)
- `src/app/(main)/artist/[artistId]/(artist)/my-stats/[sessionId]/page.tsx` (✅ 已驗證)
- `src/app/(main)/artist/[artistId]/(artist)/history/[dateId]/page.tsx` (❌ 未驗證)

---

## 修復優先級矩陣 (Priority Matrix)

| 優先級 | 問題 | 影響 | 難度 | 預估時間 |
|-------|------|------|------|---------|
| 🔴 P0 | 建立 `requireAdmin()` 工具函式 (含防禦性檢查) | 極高 | 低 | 20 分鐘 |
| 🔴 P0 | 修復 Middleware 的角色驗證 (統一 403 回應) | 極高 | 低 | 20 分鐘 |
| 🔴 P0 | 為 Admin Server Actions 加入權限檢查 | 極高 | 中 | 1.5 小時 |
| 🟠 P1 | 加強檔案上傳驗證 (含 Magic Number 檢查) | 高 | 中 | 1.5 小時 |
| 🟠 P1 | 建立統一的 searchParams 驗證工具 | 中 | 低 | 30 分鐘 |
| 🟡 P2 | 執行依賴套件掃描與修復 | 中 | 低 | 1 小時 |

---

## 詳細修復計劃 (Detailed Fix Plan)

---

### 🔴 Phase 1: Critical - 權限控制修復 (2.5 小時)

---

#### ✅ Task 1.1: 建立統一的權限檢查工具函式

**目的**: 建立一個可重用的函式,消除「每個 Action 都要手動檢查權限」的重複程式碼。

**檔案**: `src/lib/auth/authorization.ts` (新建)

**實作內容**:
```typescript
import { getUserSession } from "@/../auth";

/**
 * 驗證當前使用者是否為管理員
 * @throws {Error} 如果使用者不是管理員或 session 不存在
 * @returns {Promise<User>} 管理員的 Session 資訊
 *
 * @example
 * export default async function deleteItem() {
 *   const admin = await requireAdmin(); // 如果不是管理員,這行會拋出錯誤
 *   await db.item.delete(...);
 * }
 */
export async function requireAdmin() {
  const session = await getUserSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return session;
}

/**
 * 檢查當前使用者是否為管理員 (不拋出錯誤)
 * @returns {Promise<boolean>} true 如果是管理員
 *
 * @example
 * const canEdit = await isAdmin();
 * if (canEdit) {
 *   // 顯示編輯按鈕
 * }
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getUserSession();
    return session.role === "ADMIN";
  } catch {
    return false;
  }
}

/**
 * 驗證使用者是否有權限操作指定的資源
 * @param userId - 要操作的資源所屬的使用者 ID
 * @throws {Error} 如果當前使用者既不是資源擁有者也不是管理員
 * @returns {Promise<User>} 當前使用者的 Session
 *
 * @example
 * export default async function updateProfile({ userId, data }) {
 *   await requireOwnerOrAdmin(userId); // 只有本人或管理員能修改
 *   await db.user.update(...);
 * }
 */
export async function requireOwnerOrAdmin(resourceUserId: string) {
  const session = await getUserSession();

  const isOwner = session.id === resourceUserId;
  const isAdminUser = session.role === "ADMIN";

  if (!isOwner && !isAdminUser) {
    throw new Error("Unauthorized: You can only modify your own resources");
  }

  return session;
}
```

**驗收標準**:
- [x] 檔案建立於 `src/lib/auth/authorization.ts`
- [x] 包含 `requireAdmin()` 函式
- [x] 包含 `isAdmin()` 函式 (可選,未來可能用到)
- [x] 包含 `requireOwnerOrAdmin()` 函式 (可選,未來可能用到)
- [x] 每個函式都有 JSDoc 註解
- [x] TypeScript 無編譯錯誤

**測試方式**:
```bash
npx tsc --noEmit
```

---

#### ✅ Task 1.2: 修復 Middleware 的 Admin 路由驗證

**目的**: 在 Middleware 層面阻擋非管理員存取 `/admin` 路由。

**檔案**: `src/middleware.ts`

**修改位置**: Line 32 之後 (在 `if (!isLoggedIn && !isPublicRoute)` 區塊之後)

**Before**:
```typescript
if (!isLoggedIn && !isPublicRoute) {
  return Response.redirect(new URL("/auth/signin", nextUrl.origin));
}

// --- 判斷是否為 Server Action 請求 ---
const isServerAction = req.headers.get("Next-Action") !== null;
```

**After**:
```typescript
// --- 先檢查是否為 admin 路由 ---
const isAdminRoute = nextUrl.pathname.startsWith('/admin');

if (!isLoggedIn && !isPublicRoute) {
  return Response.redirect(new URL("/auth/signin", nextUrl.origin));
}

// --- 已登入但嘗試訪問 admin 路由,需驗證角色 ---
if (isAdminRoute && (!req.auth?.user || req.auth.user.role !== 'ADMIN')) {
  return new Response("Forbidden", { status: 403 });
}

// --- 判斷是否為 Server Action 請求 ---
const isServerAction = req.headers.get("Next-Action") !== null;
```

**驗收標準**:
- [x] 先定義 `isAdminRoute` 常數
- [x] 非管理員訪問 `/admin/*` 會收到 403 Forbidden
- [x] 管理員訪問 `/admin/*` 正常顯示
- [x] TypeScript 無編譯錯誤

**測試方式**:
```bash
npm run lint
npx tsc --noEmit

# 手動測試:
# 1. 以普通使用者登入
# 2. 在瀏覽器輸入 http://localhost:3000/admin/user
# 3. 預期: 收到 403 Forbidden 頁面
```

---

#### ✅ Task 1.3: 為 Admin Server Actions 加入權限檢查

**目的**: 即使繞過 Middleware,也無法執行管理員操作。

**修改策略**: 在每個 Admin Server Action 的**第一行**加入 `await requireAdmin()`

**受影響檔案列表** (共 9 個):

##### 1.3.1 `src/features/admin/addContent/actions/addAlbum.ts`

**Before**:
```typescript
export default async function addAlbum({
  artistId,
  spotifyUrl,
}: AddAlbumProps): Promise<AppResponseType> {
  // 直接開始邏輯
  const existingAlbum = await db.album.findFirst(...);
```

**After**:
```typescript
import { requireAdmin } from "@/lib/auth/authorization";

export default async function addAlbum({
  artistId,
  spotifyUrl,
}: AddAlbumProps): Promise<AppResponseType> {
  await requireAdmin(); // ← 新增這行

  const existingAlbum = await db.album.findFirst(...);
```

---

##### 1.3.2 `src/features/admin/addContent/actions/addArtist.ts`

**修改位置**: 函式第一行

**Before**:
```typescript
export default async function addArtist({
  spotifyUrl,
}: AddArtistProps): Promise<AppResponseType> {
  const existingArtist = await db.artist.findFirst(...);
```

**After**:
```typescript
import { requireAdmin } from "@/lib/auth/authorization";

export default async function addArtist({
  spotifyUrl,
}: AddArtistProps): Promise<AppResponseType> {
  await requireAdmin(); // ← 新增這行

  const existingArtist = await db.artist.findFirst(...);
```

---

##### 1.3.3 `src/features/admin/addContent/actions/addSingle.ts`

**修改位置**: 函式第一行

**Before**:
```typescript
export default async function addSingle({
  artistId,
  spotifyUrl,
}: AddSingleProps): Promise<AppResponseType> {
  const existingTrack = await db.track.findFirst(...);
```

**After**:
```typescript
import { requireAdmin } from "@/lib/auth/authorization";

export default async function addSingle({
  artistId,
  spotifyUrl,
}: AddSingleProps): Promise<AppResponseType> {
  await requireAdmin(); // ← 新增這行

  const existingTrack = await db.track.findFirst(...);
```

---

##### 1.3.4 `src/features/admin/editContent/actions/deleteItem.ts`

**修改位置**: 函式第一行 (Line 14 之後)

**Before**:
```typescript
export default async function deleteItem({
  type,
  id,
}: DeleteItemProps): Promise<AppResponseType> {
  let isSuccess = false;
  let artistId: null | string = null;
```

**After**:
```typescript
import { requireAdmin } from "@/lib/auth/authorization";

export default async function deleteItem({
  type,
  id,
}: DeleteItemProps): Promise<AppResponseType> {
  await requireAdmin(); // ← 新增這行

  let isSuccess = false;
  let artistId: null | string = null;
```

---

##### 1.3.5 `src/features/admin/editContent/actions/updateAlbum.ts`

**修改位置**: 函式第一行 (Line 14 之後)

**Before**:
```typescript
export default async function updateAlbum({
  albumId,
  formData,
}: UpdateAlbumProps): Promise<AppResponseType> {
  const album = await db.album.findFirst(...);
```

**After**:
```typescript
import { requireAdmin } from "@/lib/auth/authorization";

export default async function updateAlbum({
  albumId,
  formData,
}: UpdateAlbumProps): Promise<AppResponseType> {
  await requireAdmin(); // ← 新增這行

  const album = await db.album.findFirst(...);
```

---

##### 1.3.6~1.3.8 統一修改模板

以下檔案都遵循相同的修改模式:
- `src/features/admin/editContent/actions/updateArtist.ts`
- `src/features/admin/editContent/actions/updateInfo.ts`
- `src/features/admin/editContent/actions/updateTrack.ts`

**通用修改步驟**:
1. 在檔案最上方加入: `import { requireAdmin } from "@/lib/auth/authorization";`
2. 在 `export default async function xxx(...)` 的**第一行**加入: `await requireAdmin();`

**通用範例**:
```typescript
// Before (任何 Admin Server Action 的典型結構)
export default async function updateXxx({ ... }: Props): Promise<AppResponseType> {
  const item = await db.xxx.findFirst(...);
  // ... 其他邏輯
}

// After
import { requireAdmin } from "@/lib/auth/authorization"; // ← 1. 新增 import

export default async function updateXxx({ ... }: Props): Promise<AppResponseType> {
  await requireAdmin(); // ← 2. 新增這行,必須是函式第一行

  const item = await db.xxx.findFirst(...);
  // ... 其他邏輯
}
```

**⚠️ 重要提醒**:
- `await requireAdmin()` 必須是函式的**第一行**可執行程式碼
- 不要放在 try-catch 內部,應該放在外部
- 如果權限驗證失敗,會直接拋出錯誤,阻止後續程式碼執行

---

##### 1.3.9 `src/features/admin/user/actions/updateUser.ts`

**修改位置**: 函式第一行 (Line 13 之後)

**Before**:
```typescript
export default async function updateUser({
  userId,
  role,
}: UpdateUserProps): Promise<AppResponseType> {
  try {
    await db.user.update(...);
```

**After**:
```typescript
import { requireAdmin } from "@/lib/auth/authorization";

export default async function updateUser({
  userId,
  role,
}: UpdateUserProps): Promise<AppResponseType> {
  await requireAdmin(); // ← 新增這行

  try {
    await db.user.update(...);
```

---

**Task 1.3 驗收標準**:
- [x] 所有 9 個檔案都在第一行加入 `await requireAdmin()`
- [x] 所有檔案都 `import { requireAdmin } from "@/lib/auth/authorization"`
- [x] TypeScript 無編譯錯誤
- [x] Linting 通過

**測試方式**:
```bash
npm run lint
npx tsc --noEmit

# 手動測試:
# 1. 以普通使用者登入
# 2. 打開瀏覽器開發者工具 Console
# 3. 執行以下程式碼嘗試繞過前端:
fetch('/api/your-server-action-endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'artist', id: 'some-id' })
})
# 4. 預期: 收到 "Unauthorized: Admin access required" 錯誤
```

---

### 🟠 Phase 2: High - 輸入驗證強化 (2 小時)

---

#### ✅ Task 2.1: 加強檔案上傳驗證 (含 Magic Number 檢查)

**目的**: 防止惡意檔案上傳與濫用儲存空間。透過多層驗證確保上傳檔案的真實性。

**檔案**:
- `src/features/settings/actions/generatePresignedUploadUrl.ts` (後端驗證)
- 前端呼叫處 (需搜尋確認位置)

**修改位置**: Line 30-58

**Before**:
```typescript
type GenerateUrlParams = {
  fileName: string;
  fileType: string;
};

export async function generatePresignedUploadUrl({
  fileName,
  fileType,
}: GenerateUrlParams): Promise<GenerateUrlResponse> {
  const { id: userId } = await getUserSession();

  if (!fileName || !fileType) {
    return {
      type: "error",
      message: SETTINGS_MESSAGES.FILE_UPLOAD.FILENAME_AND_TYPE_REQUIRED,
    };
  }
  if (!fileType.startsWith("image/")) {
    return {
      type: "error",
      message: SETTINGS_MESSAGES.FILE_UPLOAD.INVALID_TYPE_IMAGE_ONLY,
    };
  }
  // ... 後續邏輯
}
```

**After (步驟 1: 後端基礎驗證)**:
```typescript
// 常數定義 (放在檔案最上方,import 之後)
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type GenerateUrlParams = {
  fileName: string;
  fileType: string;
  fileSize: number; // ← 新增
};

export async function generatePresignedUploadUrl({
  fileName,
  fileType,
  fileSize, // ← 新增
}: GenerateUrlParams): Promise<GenerateUrlResponse> {
  const { id: userId } = await getUserSession();

  // 1. 基本欄位檢查
  if (!fileName || !fileType || !fileSize) {
    return {
      type: "error",
      message: "檔案名稱、類型和大小為必填",
    };
  }

  // 2. MIME Type 白名單驗證 (更嚴格)
  if (!ALLOWED_MIME_TYPES.includes(fileType as any)) {
    return {
      type: "error",
      message: `只允許上傳 ${ALLOWED_MIME_TYPES.join(', ')} 格式的圖片`,
    };
  }

  // 3. 副檔名驗證
  const fileExtension = fileName.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension as any)) {
    return {
      type: "error",
      message: `只允許上傳 ${ALLOWED_EXTENSIONS.join(', ')} 副檔名的檔案`,
    };
  }

  // 4. 檔案大小限制
  if (fileSize > MAX_FILE_SIZE) {
    return {
      type: "error",
      message: `檔案大小不得超過 ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // 5. MIME Type 與副檔名一致性檢查
  const mimeToExtMap: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
  };

  const expectedExtensions = mimeToExtMap[fileType];
  if (!expectedExtensions?.includes(fileExtension)) {
    return {
      type: "error",
      message: "檔案類型與副檔名不符",
    };
  }

  // ... 後續邏輯不變
}
```

**After (步驟 2: 前端 Magic Number 驗證)**:

**新增檔案**: `src/lib/validation/fileValidation.ts`

```typescript
/**
 * 檔案 Magic Number (檔案簽名) 驗證
 * 透過讀取檔案的前幾個 bytes 來驗證真實檔案類型
 */

const MAGIC_NUMBERS: Record<string, { bytes: number[]; offset: number }> = {
  'image/jpeg': { bytes: [0xFF, 0xD8, 0xFF], offset: 0 },
  'image/png': { bytes: [0x89, 0x50, 0x4E, 0x47], offset: 0 },
  'image/webp': { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }, // "WEBP" at offset 8
};

/**
 * 驗證檔案的 Magic Number 是否符合宣稱的 MIME type
 * @param file - File 物件
 * @param expectedMimeType - 預期的 MIME type
 * @returns Promise<boolean> - true 如果檔案簽名符合
 */
export async function validateFileMagicNumber(
  file: File,
  expectedMimeType: string
): Promise<boolean> {
  const config = MAGIC_NUMBERS[expectedMimeType];
  if (!config) return false;

  const { bytes, offset } = config;
  const slice = file.slice(offset, offset + bytes.length);
  const buffer = await slice.arrayBuffer();
  const fileBytes = new Uint8Array(buffer);

  return bytes.every((byte, index) => fileBytes[index] === byte);
}

/**
 * 完整的前端檔案驗證
 */
export async function validateImageFile(file: File): Promise<{
  valid: boolean;
  error?: string;
}> {
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // 1. MIME type 檢查
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `只允許上傳 ${ALLOWED_MIME_TYPES.join(', ')} 格式的圖片`,
    };
  }

  // 2. 檔案大小檢查
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `檔案大小不得超過 5MB`,
    };
  }

  // 3. Magic Number 驗證
  const isMagicNumberValid = await validateFileMagicNumber(file, file.type);
  if (!isMagicNumberValid) {
    return {
      valid: false,
      error: '檔案格式驗證失敗,可能是偽裝的檔案',
    };
  }

  return { valid: true };
}
```

**After (步驟 3: 搜尋並修改前端呼叫處)**:

##### 2.1.1 搜尋所有 generatePresignedUploadUrl 呼叫處

**執行指令**:
```bash
grep -rn "generatePresignedUploadUrl" src/ --include="*.ts" --include="*.tsx"
```

**記錄結果** (待實際搜尋後填入):
```
檔案清單:
- src/features/settings/components/XxxComponent.tsx (範例,需實際搜尋)
- src/features/settings/actions/xxxAction.ts (範例,需實際搜尋)

⚠️ 執行此任務時,請先執行上述 grep 指令,並將實際找到的檔案路徑記錄在此處。
```

**後續步驟**:
對於每個找到的呼叫處,都需要進行以下修改

**修改範例**:
```typescript
// Before
const result = await generatePresignedUploadUrl({
  fileName: file.name,
  fileType: file.type,
});

// After
import { validateImageFile } from "@/lib/validation/fileValidation";

// 先在前端驗證
const validation = await validateImageFile(file);
if (!validation.valid) {
  // 顯示錯誤訊息給使用者
  toast.error(validation.error);
  return;
}

// 驗證通過後才呼叫後端
const result = await generatePresignedUploadUrl({
  fileName: file.name,
  fileType: file.type,
  fileSize: file.size, // ← 新增
});
```

**驗收標準**:
- [x] 後端: 定義 `ALLOWED_MIME_TYPES`, `ALLOWED_EXTENSIONS`, `MAX_FILE_SIZE` 常數
- [x] 後端: `GenerateUrlParams` 型別加入 `fileSize: number`
- [x] 後端: 實作 5 層驗證邏輯
- [x] 前端: 建立 `src/lib/validation/fileValidation.ts`
- [x] 前端: 實作 `validateImageFile()` 與 Magic Number 驗證 (WebP 檢查 offset 8 的 "WEBP")
- [x] 前端: 搜尋所有呼叫 `generatePresignedUploadUrl` 的地方並更新型別
- [x] 前端: 在上傳前呼叫 `validateImageFile()` 進行驗證
- [x] TypeScript 無編譯錯誤
- [x] Linting 通過

**測試方式**:
```bash
npm run lint
npx tsc --noEmit

# 手動測試:
# 1. 嘗試上傳一個 10MB 的圖片 → 預期: 前端就被拒絕 (檔案大小)
# 2. 嘗試上傳一個 .txt 檔案 → 預期: 前端就被拒絕 (MIME type)
# 3. 嘗試上傳一個偽裝成 .jpg 的 .exe → 預期: 前端 Magic Number 驗證失敗
# 4. 繞過前端直接呼叫後端 API,傳送惡意參數 → 預期: 後端驗證失敗
# 5. 上傳一個合法的 2MB .jpg → 預期: 成功
```

---

#### ✅ Task 2.2: 建立統一的 searchParams 驗證工具

**目的**: 建立一個可重用的驗證工具,確保所有 searchParams 都經過一致的驗證,避免遺漏。

**步驟 1: 建立通用驗證工具**

**新增檔案**: `src/lib/validation/searchParams.ts`

```typescript
/**
 * 統一的 searchParams 驗證工具
 * 使用白名單機制,只允許預定義的參數值通過
 */

type AllowedValues = string[] | readonly string[];

/**
 * 驗證單個 searchParam 是否在白名單中
 */
export function validateParam(
  value: string | undefined,
  allowedValues: AllowedValues
): string | null {
  if (!value) return null;
  return allowedValues.includes(value) ? value : null;
}

/**
 * 驗證多個 searchParams
 * @example
 * const validated = validateSearchParams(searchParams, {
 *   view: ['overview', 'details'],
 *   sort: ['asc', 'desc'],
 * });
 */
export function validateSearchParams<T extends Record<string, string | undefined>>(
  params: T,
  schema: Record<keyof T, AllowedValues>
): Partial<T> {
  const validated: Partial<T> = {};

  for (const key in schema) {
    const value = params[key];
    const allowedValues = schema[key];

    if (value && allowedValues.includes(value)) {
      validated[key] = value;
    }
  }

  return validated;
}
```

**步驟 2: 套用到現有檔案**

##### 2.2.1 `src/app/(main)/artist/[artistId]/(artist)/history/[dateId]/page.tsx`

**Before** (Line 16):
```typescript
const queryString = view ? `?view=${view}` : "";
redirect(`/artist/${artistId}/my-stats/${dateId}${queryString}`);
```

**After**:
```typescript
import { validateParam } from "@/lib/validation/searchParams";
import { VALID_ARTIST_VIEWS } from "@/types/artist"; // ← 使用實際存在的常數

// ... 在函式內部
const { view: rawView } = await searchParams;

// 驗證 view 參數
const validView = validateParam(rawView, VALID_ARTIST_VIEWS);
const queryString = validView ? `?view=${validView}` : "";

redirect(`/artist/${artistId}/my-stats/${dateId}${queryString}`);
```

**完整修改後的檔案**:
```typescript
import { redirect } from "next/navigation";
import { validateParam } from "@/lib/validation/searchParams"; // ← 新增
import { VALID_ARTIST_VIEWS } from "@/types/artist"; // ← 新增 (使用專案中實際存在的常數名稱)

type pageProps = {
  params: Promise<{ artistId: string; dateId: string }>;
  searchParams: Promise<{ view?: string }>;
};

export default async function HistoryDatePage({
  params,
  searchParams,
}: pageProps) {
  const { artistId, dateId } = await params;
  const { view: rawView } = await searchParams; // ← 重新命名

  // ← 使用統一驗證工具
  const validView = validateParam(rawView, VALID_ARTIST_VIEWS);
  const queryString = validView ? `?view=${validView}` : "";

  redirect(`/artist/${artistId}/my-stats/${dateId}${queryString}`);
}
```

**步驟 3: 確認 `VALID_ARTIST_VIEWS` 常數**

確認 `src/types/artist.ts` 已有定義 (應該已存在):

```typescript
// src/types/artist.ts (現有程式碼,無需修改)
export const VALID_ARTIST_VIEWS = ['overview', 'all-rankings'] as const;
export type ArtistViewType = typeof VALID_ARTIST_VIEWS[number];

export function isValidArtistView(view: string): view is ArtistViewType {
  return VALID_ARTIST_VIEWS.includes(view as ArtistViewType);
}
```

**⚠️ 注意**: 請使用 `VALID_ARTIST_VIEWS` (專案實際存在的常數),而非 `ARTIST_VIEW_VALUES`。

**驗收標準**:
- [x] 建立 `src/lib/validation/searchParams.ts`
- [x] 實作 `validateParam()` 和 `validateSearchParams()` 函式
- [x] 確認 `VALID_ARTIST_VIEWS` 已存在於 `src/types/artist.ts` (無需新增)
- [x] 修改 `history/[dateId]/page.tsx` 使用新的驗證工具
- [x] TypeScript 無編譯錯誤

**測試方式**:
```bash
npm run lint
npx tsc --noEmit

# 手動測試:
# 1. 訪問 /artist/xxx/history/yyy?view=hacked
# 2. 預期: 被重導向到 /artist/xxx/my-stats/yyy (不帶 view 參數)
# 3. 訪問 /artist/xxx/history/yyy?view=overview
# 4. 預期: 被重導向到 /artist/xxx/my-stats/yyy?view=overview
```

---

### 🟡 Phase 3: Medium - 依賴套件安全 (1 小時)

---

#### ✅ Task 3.1: 執行依賴套件安全掃描與修復

**目的**: 發現並修復第三方套件中的已知漏洞。

**執行方式**:
```bash
# 掃描漏洞
npm audit

# 自動修復可修復的漏洞 (不會更新到 breaking changes)
npm audit fix

# 強制修復 (包含 breaking changes,需謹慎使用)
npm audit fix --force

# 只檢查 high 以上的漏洞
npm audit --audit-level=high

# 檢視詳細報告
npm audit --json > audit-report.json
```

**處理流程**:
1. 執行 `npm audit`,查看是否有 Critical/High 漏洞
2. 對於每個漏洞:
   - 如果有 fix available (不需 breaking change): 執行 `npm audit fix`
   - 如果需要 breaking change:
     - 評估升級的影響範圍
     - 閱讀套件的 CHANGELOG
     - 在測試環境中先驗證
     - 確認無問題後再套用
   - 如果無法修復 (套件尚未發布修復版本):
     - 記錄在 `SECURITY.md` 或 `KNOWN_ISSUES.md` 中
     - 評估是否有替代方案
     - 制定緩解措施 (如限制該功能的使用範圍)
3. 修復後執行完整測試:
   ```bash
   npm run lint
   npx tsc --noEmit
   npm run test
   npm run build
   ```
4. 確保應用程式正常運作

**驗收標準**:
- [x] 執行 `npm audit`
- [x] Critical 和 High 漏洞數量為 0 (或有明確的緩解措施)
- [x] 記錄無法修復的漏洞到 `SECURITY.md` (如有)
- [x] 所有測試通過
- [x] 應用程式 build 成功
- [x] 功能正常運作

---

#### ✅ Task 3.2: 確認 GitHub Dependabot 設定

**目的**: 確保自動化依賴套件更新與安全掃描已啟用。

**檔案**: `.github/dependabot.yml`

**檢查現有設定**:
```bash
cat .github/dependabot.yml
```

**確認包含以下關鍵設定**:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"  # 或 "pnpm" 如果專案使用 pnpm
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "security"
```

**如果檔案不存在或設定不完整,則建立或更新它**。

**額外檢查**:
- 在 GitHub Repository Settings > Security > Dependabot alerts 確認已啟用
- 在 GitHub Repository Settings > Security > Dependabot security updates 確認已啟用

**驗收標準**:
- [x] `.github/dependabot.yml` 檔案存在且設定正確
- [x] 設定為每週掃描
- [x] GitHub Dependabot alerts 已啟用
- [x] GitHub Dependabot security updates 已啟用

---

### 🧪 Phase 4: Testing - 測試與驗證 (1.5 小時)

---

#### ✅ Task 4.1: 權限控制測試

**測試情境**:

##### 4.1.1 測試 Middleware 阻擋

**步驟**:
1. 建立一個普通使用者帳號 (role: USER)
2. 登入後,在瀏覽器輸入 `http://localhost:3000/admin/user`
3. 預期: 被重導向到 `/`

**驗收**: ✅ 普通使用者無法訪問任何 `/admin` 路由

---

##### 4.1.2 測試 Server Action 阻擋

**步驟**:
1. 以普通使用者登入
2. 打開瀏覽器開發者工具 > Console
3. 執行以下程式碼 (需根據實際路由調整):
```javascript
// 嘗試刪除藝人
fetch('/_next/data/development/admin/artist.json', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Next-Action': 'your-action-id'
  },
  body: JSON.stringify({
    type: 'artist',
    id: 'some-artist-id'
  })
});
```
4. 預期: 收到 "Unauthorized: Admin access required" 錯誤

**驗收**: ✅ 即使繞過前端,Server Action 也會拒絕非管理員請求

---

#### ✅ Task 4.2: 檔案上傳測試

**測試情境**:

##### 4.2.1 檔案大小限制

**步驟**:
1. 準備一個 10MB 的圖片
2. 嘗試上傳
3. 預期: 收到 "檔案大小不得超過 5MB" 錯誤

**驗收**: ✅ 大檔案被正確拒絕

---

##### 4.2.2 檔案類型驗證

**步驟**:
1. 準備一個 .txt 檔案,重新命名為 .jpg
2. 嘗試上傳
3. 預期: 收到 "檔案類型與副檔名不符" 或類似錯誤

**驗收**: ✅ 偽裝的檔案被正確拒絕

---

##### 4.2.3 合法檔案上傳

**步驟**:
1. 準備一個 2MB 的 .jpg 圖片
2. 上傳
3. 預期: 成功上傳,頭像更新

**驗收**: ✅ 合法檔案能正常上傳

---

#### ✅ Task 4.3: searchParams 驗證測試

**測試情境**:

##### 4.3.1 非法 view 參數

**步驟**:
1. 訪問 `/artist/xxx/history/yyy?view=<script>alert(1)</script>`
2. 預期: 被重導向到 `/artist/xxx/my-stats/yyy` (不帶 view 參數)

**驗收**: ✅ 非法參數被過濾

---

##### 4.3.2 合法 view 參數

**步驟**:
1. 訪問 `/artist/xxx/history/yyy?view=overview`
2. 預期: 被重導向到 `/artist/xxx/my-stats/yyy?view=overview`

**驗收**: ✅ 合法參數被保留

---

#### ✅ Task 4.4: 迴歸測試

**目的**: 確保修復沒有破壞現有功能。

**測試清單**:
- [ ] 普通使用者能正常登入
- [ ] 普通使用者能訪問自己的 settings
- [ ] 普通使用者能進行音樂排名
- [ ] 管理員能正常訪問 `/admin`
- [ ] 管理員能新增/編輯/刪除藝人
- [ ] 管理員能新增/編輯/刪除專輯
- [ ] 管理員能管理使用者角色

**執行方式**:
```bash
# 執行自動化測試
npm run test

# 執行 Linting
npm run lint

# 執行 TypeScript 檢查
npx tsc --noEmit
```

---

## 測試檢查清單 (Testing Checklist)

### 🔴 Critical Tests (必須全部通過)

- [ ] **CT-1**: 普通使用者無法訪問 `/admin/user`
- [ ] **CT-2**: 普通使用者無法訪問 `/admin/artist`
- [ ] **CT-3**: 普通使用者無法訪問 `/admin/album/[id]`
- [ ] **CT-4**: 普通使用者無法呼叫 `deleteItem` Server Action
- [ ] **CT-5**: 普通使用者無法呼叫 `updateUser` Server Action
- [ ] **CT-6**: 管理員可以正常訪問所有 `/admin` 路由
- [ ] **CT-7**: 管理員可以正常執行所有 Admin Server Actions

### 🟠 High Priority Tests

- [ ] **HT-1**: 無法上傳超過 5MB 的檔案
- [ ] **HT-2**: 無法上傳非圖片檔案
- [ ] **HT-3**: 無法上傳偽裝的檔案 (如 .exe 改名為 .jpg)
- [ ] **HT-4**: 可以成功上傳合法的圖片 (jpg, png, webp)
- [ ] **HT-5**: searchParams 中的非法 view 值被過濾

### 🟢 Regression Tests (功能不破壞)

- [ ] **RT-1**: 普通使用者可以登入
- [ ] **RT-2**: 普通使用者可以修改自己的 profile
- [ ] **RT-3**: 普通使用者可以進行排名
- [ ] **RT-4**: 管理員可以新增藝人
- [ ] **RT-5**: 管理員可以編輯專輯
- [ ] **RT-6**: `npm run test` 無錯誤
- [ ] **RT-7**: `npm run lint` 無錯誤
- [ ] **RT-8**: `npx tsc --noEmit` 無錯誤

---

## 上線前檢查 (Pre-Launch Checklist)

### 🔒 安全性檢查

- [ ] 所有 Admin Server Actions 都有 `await requireAdmin()`
- [ ] Middleware 正確驗證 `/admin` 路由
- [ ] 檔案上傳有完整的驗證 (類型、大小、副檔名)
- [ ] 所有 searchParams 都經過驗證
- [ ] `npm audit` 無 Critical/High 漏洞
- [ ] 環境變數已設定 (DATABASE_URL, AUTH_SECRET, AWS credentials)
- [ ] 生產環境的 `.env` 檔案不在版本控制中

### ⚙️ 程式碼品質檢查

- [ ] `npm run lint` 通過
- [ ] `npx tsc --noEmit` 無錯誤
- [ ] `npm run test` 全部通過
- [ ] 所有新增的函式都有 JSDoc 註解
- [ ] 沒有 `console.log` 或 `debugger` 殘留

### 📝 文件檢查

- [ ] `SECURITY.md` 記錄了已知的無法修復漏洞 (如有)
- [ ] `README.md` 更新了安全相關的設定說明
- [ ] `CHANGELOG.md` 記錄了這次的資安修復

### 🚀 部署檢查

- [ ] 在 Staging 環境測試所有功能
- [ ] 確認生產環境的環境變數已設定
- [ ] 確認資料庫 migration 已執行
- [ ] 備份現有的生產資料庫
- [ ] 準備 Rollback 計劃

---

## 附錄 A: 錯誤訊息對照表

| 錯誤訊息 | 原因 | 解決方式 |
|---------|------|---------|
| `Unauthorized` | Session 不存在 (未登入) | 請先登入 |
| `Forbidden` | 已登入但角色不是 ADMIN | 此操作需要管理員權限 |
| `檔案大小不得超過 5MB` | 上傳檔案過大 | 壓縮圖片或選擇較小的檔案 |
| `只允許上傳 image/jpeg, image/png, image/webp 格式的圖片` | 檔案類型不符 | 選擇正確格式的圖片 |
| `檔案類型與副檔名不符` | MIME type 與副檔名不一致 | 確保檔案未被偽裝 |
| `檔案格式驗證失敗,可能是偽裝的檔案` | Magic Number 驗證失敗 | 上傳真實的圖片檔案,不要偽裝 |

---

## 附錄 B: 相關資源

### OWASP 參考
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [A01:2021 – Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [A03:2021 – Injection](https://owasp.org/Top10/A03_2021-Injection/)

### Next.js 安全
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)
- [NextAuth.js Role-Based Access Control](https://next-auth.js.org/configuration/callbacks#role-based-access-control)

### 檔案上傳安全
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

---

## 附錄 C: 已知限制與風險接受

### 🔴 高風險 (未來需解決)

**Rate Limiting (速率限制)**
- **狀態**: 暫不實作,留待部署時再考慮
- **風險**: 攻擊者可能透過大量請求進行暴力破解或 DoS 攻擊
- **緩解措施**:
  - 依賴 Vercel/AWS 等平台的基礎 DDoS 防護
  - 監控異常流量模式
  - 部署前再評估是否需要實作 (可使用簡單的記憶體版本或 Upstash Redis)
- **建議時程**: 部署到生產環境前實作

### 🟡 中風險 (可接受)

**WebP Magic Number 驗證**
- **狀態**: 已實作,檢查 offset 8 的 "WEBP" 標記 (較嚴格)
- **風險**: 已降低,能有效區分 WebP 與其他 RIFF 格式 (AVI, WAV)
- **緩解措施**:
  - 限制檔案大小為 5MB
  - 圖片僅用於使用者頭像,不會被執行
- **建議**: 可接受

### ⚪ 低風險 (文件記錄)

**依賴套件的 Moderate 漏洞**
- **狀態**: 將在 Task 3.1 執行後記錄
- **處理方式**:
  - Critical/High 必須修復
  - Moderate 評估影響範圍後決定是否修復
  - Low 記錄即可,暫不修復

---

## 修訂歷史 (Revision History)

| 版本 | 日期 | 修改者 | 修改內容 |
|------|------|--------|---------|
| 1.0 | 2025-10-04 | Claude (Linus Mode) | 初始版本建立 |
| 1.1 | 2025-10-04 | Claude (Linus Mode) | 優化安全措施:加強防禦性檢查、Magic Number 驗證、統一 searchParams 工具 |

---

## 授權與免責聲明

此文件僅供內部使用。所有資安修復措施應經過充分測試後再部署到生產環境。
