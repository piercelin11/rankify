# Server Actions 修復清單

> **盤點日期:** 2025-10-05
> **總計:** 22 個 Server Actions (20 個需修復 + 2 個已正確)

---

## ✅ 已正確實作 (2 個) — GET Actions

| 檔案 | 函式 | 狀態 | 備註 |
|------|------|------|------|
| `src/app/(main)/artist/[artistId]/album/[albumId]/actions.ts` | `getComparisonAlbumsData` | ✅ 正確 | 有 try-catch,返回空陣列降級 |
| `src/app/(main)/artist/[artistId]/track/[trackId]/actions.ts` | `getComparisonTracksData` | ✅ 正確 | 有 try-catch,返回空陣列降級 |

---

## ⚠️ 需要修復 (20 個) — POST/PUT/DELETE Actions

### 問題分類

| 問題類型 | 數量 |
|---------|------|
| ❌ `requireAdmin()` / `getUserSession()` 未被 catch | 19 個 |
| ❌ 缺少完整的 try-catch 包裹所有可能 throw 的操作 | 4 個 |
| ⚠️ `handleOath` 返回型別不符 AppResponseType | 1 個 |
| ⚠️ `deleteUserImageOnS3` 無返回值 | 1 個 |
| ⚠️ `createSubmission` 會 throw error | 1 個 |

---

### 詳細修復清單

#### **Admin / Add Content (3 個)**

| 檔案 | 函式 | 問題 | 優先級 |
|------|------|------|--------|
| `addAlbum.ts` | `addAlbum` | ❌ `requireAdmin()` 未被 catch (L26)<br>❌ `fetchAlbum/fetchAlbumsTrack` 可能 throw | **高** |
| `addArtist.ts` | `addArtist` | ❌ `requireAdmin()` 未被 catch (L26)<br>❌ `fetchArtist/fetchAlbum/fetchAlbumsTrack` 可能 throw | **高** |
| `addSingle.ts` | `addSingle` | ❌ `requireAdmin()` 未被 catch (L21)<br>❌ `fetchTracks` 可能 throw | **高** |

#### **Admin / Edit Content (5 個)**

| 檔案 | 函式 | 問題 | 優先級 |
|------|------|------|--------|
| `deleteItem.ts` | `deleteItem` | ❌ `requireAdmin()` 未被 catch (L19) | **高** |
| `updateAlbum.ts` | `updateAlbum` | ❌ `requireAdmin()` 未被 catch (L19)<br>❌ `db.album.findFirst` 未被 catch (L21) | **高** |
| `updateArtist.ts` | `updateArtist` | ❌ `requireAdmin()` 未被 catch (L18)<br>❌ `db.artist.findFirst` 未被 catch (L22) | **高** |
| `updateInfo.ts` | `updateInfo` | ❌ `requireAdmin()` 未被 catch (L22) | **高** |
| `updateTrack.ts` | `updateTrack` | ❌ `requireAdmin()` 未被 catch (L20)<br>❌ `db.album.findFirst` 未被 catch (L39) | **高** |

#### **Admin / User (1 個)**

| 檔案 | 函式 | 問題 | 優先級 |
|------|------|------|--------|
| `updateUser.ts` | `updateUser` | ❌ `requireAdmin()` 未被 catch (L18) | **高** |

#### **Auth (1 個)**

| 檔案 | 函式 | 問題 | 優先級 |
|------|------|------|--------|
| `handleOath.ts` | `handleOath` | ⚠️ 返回型別不是 `AppResponseType`<br>⚠️ 返回 `{success: string}` / `{error: string}`<br>⚠️ L22 會 re-throw error | **中** |

**修復建議：** 統一返回 `{ type: "success" / "error", message: string }`

#### **Settings (5 個)**

| 檔案 | 函式 | 問題 | 優先級 |
|------|------|------|--------|
| `deleteUserImageOnS3.ts` | `deleteUserImageOnS3` | ⚠️ 無返回值 (void)<br>⚠️ 無 `getUserSession()` 驗證<br>⚠️ 無權限檢查 | **中** |
| `generatePresignedUploadUrl.ts` | `generatePresignedUploadUrl` | ❌ `getUserSession()` 未被 catch (L72) | **高** |
| `saveProfileSettings.ts` | `saveProfileSettings` | ❌ `getUserSession()` 未被 catch (L17)<br>❌ `db.user.findUnique` 未被 catch (L33) | **高** |
| `saveRankingSettings.ts` | `saveRankingSettings` | ❌ `getUserSession()` 未被 catch (L16)<br>❌ `db.userPreference.findFirst` 未被 catch (L32) | **高** |
| `updateUserProfileImage.ts` | `updateUserProfileImage` | ❌ `getUserSession()` 未被 catch (L16) | **高** |

#### **Sorter (6 個)**

| 檔案 | 函式 | 問題 | 優先級 |
|------|------|------|--------|
| `checkDraft.ts` | `checkDraft` | ✅ 已有 try-catch<br>⚠️ 但返回型別不是 `AppResponseType` | **低** |
| `completeSubmission.ts` | `completeSubmission` | ❌ `getUserSession()` 未被 catch (L19)<br>✅ 其他已有 try-catch | **高** |
| `createSubmission.ts` | `createSubmission` | ❌ `getUserSession()` 未被 catch (L33)<br>❌ L42, L88 會 throw error | **高** |
| `deleteSubmission.ts` | `deleteSubmission` | ❌ `getUserSession()` 未被 catch (L12) | **高** |
| `finalizeDraft.ts` | `finalizeDraft` | ❌ `getUserSession()` 未被 catch (L12)<br>❌ `db.rankingSubmission.findUnique` 未被 catch (L14) | **高** |
| `saveDraft.ts` | `saveDraft` | ❌ `getUserSession()` 未被 catch (L11)<br>❌ `db.rankingSubmission.findUnique` 未被 catch (L13) | **高** |

---

## 📊 統計摘要

### 優先級分佈

| 優先級 | 數量 | 說明 |
|--------|------|------|
| **高** | 17 個 | `requireAdmin()` / `getUserSession()` 未被 catch,會造成 unhandled errors |
| **中** | 2 個 | `handleOath` 返回型別不符、`deleteUserImageOnS3` 設計問題 |
| **低** | 1 個 | `checkDraft` 已有完整錯誤處理,但返回型別不統一 |

### 修復難度

| 難度 | 數量 | 說明 |
|------|------|------|
| **簡單** | 16 個 | 只需包裹 try-catch |
| **中等** | 3 個 | 需重構錯誤處理邏輯 (`handleOath`, `createSubmission`, `checkDraft`) |
| **較難** | 1 個 | 需設計權限檢查 (`deleteUserImageOnS3`) |

---

## 🎯 修復順序建議

### 第一批：Admin Actions (9 個) — 最容易造成 500 錯誤
1. `addAlbum.ts`
2. `addArtist.ts`
3. `addSingle.ts`
4. `deleteItem.ts`
5. `updateAlbum.ts`
6. `updateArtist.ts`
7. `updateInfo.ts`
8. `updateTrack.ts`
9. `updateUser.ts`

### 第二批：Settings Actions (4 個) — 使用者常用功能
1. `saveProfileSettings.ts`
2. `saveRankingSettings.ts`
3. `updateUserProfileImage.ts`
4. `generatePresignedUploadUrl.ts`

### 第三批：Sorter Actions (5 個) — 核心業務邏輯
1. `completeSubmission.ts`
2. `deleteSubmission.ts`
3. `finalizeDraft.ts`
4. `saveDraft.ts`
5. `createSubmission.ts` (較複雜)

### 第四批：特殊處理 (2 個)
1. `handleOath.ts` (需重構返回型別)
2. `deleteUserImageOnS3.ts` (需加權限檢查)

---

## ✅ 驗證檢查清單

修復每個 Action 後需確認：

- [ ] 加上型別標註 `Promise<AppResponseType>`
- [ ] `requireAdmin()` / `getUserSession()` 被 try-catch 包裹
- [ ] 所有資料庫操作被 try-catch 包裹
- [ ] 所有外部 API 呼叫被 try-catch 包裹
- [ ] 執行 `npm run lint` 無錯誤
- [ ] 執行 `npx tsc --noEmit` 無錯誤

---

**Generated by Claude Code** 🤖
