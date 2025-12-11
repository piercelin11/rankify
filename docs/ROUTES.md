# Rankify 路由架構文件

## 概述

本文件說明 Rankify 專案的完整路由結構。專案使用 **Next.js 15 App Router** 架構，採用檔案系統路由 (File-based Routing) 與路由群組 (Route Groups) 來組織應用程式。

### 技術架構

- **框架**: Next.js 15 (App Router)
- **驗證**: NextAuth.js (Google OAuth)
- **路由保護**: 使用 Next.js 15 proxy 機制處理驗證與授權

### 閱讀指南

- **動態參數**: 使用 `[參數名稱]` 表示，例如 `/artist/[artistId]`
- **權限標記**:
  - 🔓 公開存取
  - 🔒 需要登入驗證
  - 🔑 需要 ADMIN 角色

---

## 一、驗證相關路由

### 1.1 登入頁面

**路徑**: `/auth/signin`
**權限**: 🔓 公開存取

**功能說明**:
- 使用者登入介面
- 整合 Google OAuth 2.0 驗證
- 提供社群登入按鈕 (SocialButton 元件)

**呈現資料**:
- Google 登入按鈕
- 應用程式 Logo 與標題

---

### 1.2 註冊頁面

**路徑**: `/auth/signup`
**權限**: 🔓 公開存取

**功能說明**:
- 使用者註冊介面
- 整合 Google OAuth 2.0 驗證
- 註冊後自動建立使用者帳號

**呈現資料**:
- Google 註冊按鈕
- 應用程式說明

---

## 二、使用者功能

### 2.1 首頁 Dashboard

**路徑**: `/`
**權限**: 🔒 需要登入驗證

**功能說明**:
- 使用者主控台，整合多項功能模組
- 提供全域搜尋與快速導航

**呈現資料**:
- **GlobalSearch**: 搜尋藝術家、專輯、歌曲
- **HeroSection**:
  - 恢復未完成的排序 (Resume Achievement)
  - 個人成就展示
- **DashboardStats**: 統計數據（排名數量、最愛藝術家等）
- **DraftsSection**: 草稿列表（未完成的排序）
- **HistorySection**: 歷史提交記錄
- **DiscoverySection**: 探索推薦內容

---

### 2.2 個人設定

#### 2.2.1 個人資料設定

**路徑**: `/settings`
**權限**: 🔒 需要登入驗證

**功能說明**:
- 編輯個人資料
- 更新使用者偏好設定

**呈現資料**:
- **ProfileSettingsForm**: 個人資料表單
  - 使用者名稱
  - Email
  - 大頭照
  - 其他個人資訊

---

#### 2.2.2 排名設定

**路徑**: `/settings/ranking`
**權限**: 🔒 需要登入驗證

**功能說明**:
- 設定排名相關偏好
- 自訂排序規則

**呈現資料**:
- **RankingSettingsForm**: 排名設定表單
  - 排序偏好
  - 顯示選項

---

### 2.3 藝術家相關路由

#### 2.3.1 藝術家頁面（重導向）

**路徑**: `/artist/[artistId]`
**權限**: 🔒 需要登入驗證
**動態參數**: `artistId` - 藝術家 ID

**功能說明**:
- 自動重導向至 `/artist/[artistId]/my-stats`
- 不直接呈現內容

---

#### 2.3.2 我的統計頁面

**路徑**: `/artist/[artistId]/my-stats`
**權限**: 🔒 需要登入驗證
**動態參數**: `artistId` - 藝術家 ID

**Query Parameters**:
- `view`: 顯示模式
  - `overview` - 總覽模式（預設）
  - `all-rankings` - 所有排名列表
  - `snapshot` - 歷史快照
- `submissionId`: 特定提交的 ID (CUID)
- `range`: 時間範圍篩選器

**功能說明**:
- 顯示使用者對特定藝術家的排名統計
- 提供多種檢視模式切換
- 可查看歷史排名快照

**呈現資料**:
- **MyStatsToolbar**: 工具列（檢視切換、時間篩選）
- **OverviewView** (view=overview):
  - 統計卡片（總排名、最愛專輯、排名趨勢）
  - 圖表視覺化
- **RankingTable** (view=all-rankings / snapshot):
  - 專輯/歌曲排名表格
  - 排名變化趨勢
  - 分數與評價

---

#### 2.3.3 歷史快照詳細頁面

**路徑**: `/artist/[artistId]/my-stats/[submissionId]`
**權限**: 🔒 需要登入驗證
**動態參數**:
- `artistId` - 藝術家 ID
- `submissionId` - 提交記錄 ID

**功能說明**:
- 查看特定提交的完整排名資料
- 顯示該次排序的所有細節

**呈現資料**:
- **DoubleBarChart**: 專輯排名趨勢雙條圖
- **RankingTable**: 完整排名表格
- 提交時間與元資料

---

#### 2.3.4 社群頁面

**路徑**: `/artist/[artistId]/community`
**權限**: 🔒 需要登入驗證
**動態參數**: `artistId` - 藝術家 ID

**功能說明**:
- 社群互動功能（開發中）
- 查看其他使用者的排名

**呈現資料**:
- 目前為空實作，預留未來功能

---

#### 2.3.5 歌曲詳細頁面

**路徑**: `/artist/[artistId]/track/[trackId]`
**權限**: 🔒 需要登入驗證
**動態參數**:
- `artistId` - 藝術家 ID
- `trackId` - 歌曲 ID

**Query Parameters**:
- `type`: 顯示類型（`artist` 等）

**功能說明**:
- 顯示單一歌曲的詳細統計資料
- 提供前一首/下一首導航

**呈現資料**:
- **SimpleSegmentControl**: 檢視模式切換
- **StatsCard**: 統計卡片
  - Overall Ranking (整體排名)
  - Peak Position (最高排名)
  - Range (排名範圍)
- **RankingLineChart**: 排名變化折線圖
- **Prev/Next Track Navigation**: 歌曲導航按鈕

---

#### 2.3.6 專輯詳細頁面

**路徑**: `/artist/[artistId]/album/[albumId]`
**權限**: 🔒 需要登入驗證
**動態參數**:
- `artistId` - 藝術家 ID
- `albumId` - 專輯 ID

**Query Parameters**:
- `type`: 顯示類型（`artist` 等）

**功能說明**:
- 顯示單一專輯的詳細統計資料
- 提供前一張/下一張專輯導航

**呈現資料**:
- **SimpleSegmentControl**: 檢視模式切換
- **StatsCard**: 統計卡片
  - Overall Ranking (整體排名)
  - Points (得分)
  - Favorite Track (最愛歌曲)
- **RankingLineChart**: 排名變化折線圖
- **Prev/Next Album Navigation**: 專輯導航按鈕

---

## 三、排序系統

### 3.1 藝術家排序介面

**路徑**: `/sorter/artist/[artistId]`
**權限**: 🔒 需要登入驗證
**動態參數**: `artistId` - 藝術家 ID

**Query Parameters**:
- `resume`: 設為 `true` 時從首頁恢復草稿

**功能說明**:
- 對藝術家的專輯、EP、單曲進行排序
- 支援草稿儲存與恢復
- 提供過濾與篩選功能

**呈現資料**:
- **FilterStage**: 篩選器
  - 選擇要排序的專輯類型（Albums / EPs / Singles）
  - 年份範圍選擇
- **DraftPrompt**: 草稿恢復提示
  - 偵測未完成的排序
  - 提供繼續或重新開始選項
- **CorruptedDraftFallback**: 損毀草稿處理
- **排序介面**: 拖曳式排序 UI

---

### 3.2 專輯排序介面

**路徑**: `/sorter/album/[albumId]`
**權限**: 🔒 需要登入驗證
**動態參數**: `albumId` - 專輯 ID

**Query Parameters**:
- `resume`: 設為 `true` 時從首頁恢復草稿

**功能說明**:
- 對專輯內的歌曲進行排序
- 自動建立 submission 記錄
- 支援草稿儲存與恢復

**呈現資料**:
- **DraftPrompt**: 草稿恢復提示
- **CorruptedDraftFallback**: 損毀草稿處理
- **排序介面**: 歌曲拖曳排序 UI
- 專輯封面與基本資訊

---

## 四、管理後台

### 4.1 使用者管理

**路徑**: `/admin/user`
**權限**: 🔑 需要 ADMIN 角色

**功能說明**:
- 管理平台所有使用者
- 查看使用者資料與活動
- 編輯使用者權限

**呈現資料**:
- **UserTable**: 使用者列表表格
  - 使用者名稱
  - Email
  - 角色 (USER / ADMIN)
  - 註冊時間
  - 操作按鈕（編輯、刪除）

---

### 4.2 藝術家列表

**路徑**: `/admin/artist`
**權限**: 🔑 需要 ADMIN 角色

**功能說明**:
- 查看平台所有藝術家
- 新增藝術家到資料庫

**呈現資料**:
- **藝術家列表**: 卡片式或表格式列表
- **AddArtistButton**: 新增藝術家按鈕
  - 開啟 Modal 表單
  - 整合 Spotify API 搜尋

---

### 4.3 藝術家編輯頁面

**路徑**: `/admin/artist/[artistId]`
**權限**: 🔑 需要 ADMIN 角色
**動態參數**: `artistId` - 藝術家 ID

**功能說明**:
- 編輯藝術家基本資料
- 管理藝術家的專輯、EP、單曲

**呈現資料**:
- **藝術家資訊卡**:
  - 名稱、圖片、Spotify ID
  - 編輯基本資料
- **Albums 管理區塊**:
  - 專輯列表
  - **AddAlbumButton**: 新增專輯
- **EPs 管理區塊**:
  - EP 列表
  - **AddEPButton**: 新增 EP
- **Singles 管理區塊**:
  - 單曲列表
  - **AddSingleButton**: 新增單曲

---

### 4.4 專輯編輯頁面

**路徑**: `/admin/album/[albumId]`
**權限**: 🔑 需要 ADMIN 角色
**動態參數**: `albumId` - 專輯 ID

**功能說明**:
- 編輯專輯基本資料
- 管理專輯內的歌曲列表

**呈現資料**:
- **專輯資訊卡**:
  - 專輯名稱、封面、發行日期
  - 編輯基本資料
- **TracksTable**: 歌曲列表表格
  - 歌曲編號
  - 歌曲名稱
  - 時長
  - Spotify ID
  - 操作按鈕（編輯、刪除）

---

## 五、API 路由

### 5.1 NextAuth API

**路徑**: `/api/auth/[...nextauth]`
**權限**: 🔓 公開存取（內部使用）

**功能說明**:
- NextAuth.js 驗證端點
- 處理 OAuth 回呼
- Session 管理

**支援的端點**:
- `GET /api/auth/signin` - 登入頁面
- `POST /api/auth/signin` - 登入處理
- `GET /api/auth/signout` - 登出頁面
- `POST /api/auth/signout` - 登出處理
- `GET /api/auth/session` - 取得 Session
- `GET /api/auth/callback/google` - Google OAuth 回呼

---

### 5.2 Spotify Token API

**路徑**: `/api/spotify/token`
**權限**: 🔓 公開存取（內部使用）

**功能說明**:
- 管理 Spotify API 存取 Token
- 使用 Client Credentials Flow
- 實作記憶體快取機制

**HTTP 方法**: `GET`

**回應資料**:
```json
{
  "access_token": "BQC...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

## 附錄

### A. Layout 層次結構

專案使用三層 Layout 架構：

#### 第一層: Root Layout
- **檔案**: `/src/app/layout.tsx`
- **適用範圍**: 所有頁面
- **功能**:
  - HTML 基礎結構
  - 全域字型載入（Geist_Mono, Outfit, Inter）
  - ModalProvider + ModalManager
  - Dark mode 設定

#### 第二層: Route Group Layouts
- **Main Layout** (`/src/app/(main)/layout.tsx`):
  - Sidebar + Header 架構
  - 使用者 Session 驗證
  - 最近瀏覽記錄
- **Auth Layout** (`/src/app/auth/layout.tsx`):
  - 全螢幕置中佈局
- **Sorter Layout** (`/src/app/sorter/layout.tsx`):
  - SorterProvider Context
  - 簡化 UI（無 Sidebar）

#### 第三層: 功能特定 Layouts
- Settings Layout
- Artist Header Layout
- Track/Album Layouts
- Admin Layouts

---

### B. 動態路由參數彙總

| 參數名稱 | 類型 | 說明 | 使用範例 |
|---------|------|------|---------|
| `artistId` | CUID | 藝術家 ID | `/artist/clxxx123/my-stats` |
| `albumId` | CUID | 專輯 ID | `/artist/clxxx123/album/clyyy456` |
| `trackId` | CUID | 歌曲 ID | `/artist/clxxx123/track/clzzz789` |
| `submissionId` | CUID | 提交記錄 ID | `/artist/clxxx123/my-stats/claaa111` |
| `[...nextauth]` | Catch-all | NextAuth 路由 | `/api/auth/signin` |

---

### C. Query Parameters 參考

| 參數名稱 | 頁面 | 可選值 | 說明 |
|---------|------|--------|------|
| `view` | `/artist/[artistId]/my-stats` | `overview`, `all-rankings`, `snapshot` | 切換檢視模式 |
| `submissionId` | `/artist/[artistId]/my-stats` | CUID | 選擇特定提交 |
| `range` | `/artist/[artistId]/my-stats` | 日期範圍 | 時間篩選器 |
| `resume` | `/sorter/*` | `true` | 從首頁恢復草稿 |
| `type` | `/artist/[artistId]/track/*`, `/artist/[artistId]/album/*` | `artist` | 區分顯示類型 |

---

### D. 權限控制總覽

| 路由群組 | 需登入 | 需 ADMIN | 說明 |
|---------|--------|---------|------|
| `/auth/*` | ❌ | ❌ | 公開的驗證頁面 |
| `/` | ✅ | ❌ | 使用者 Dashboard |
| `/settings/*` | ✅ | ❌ | 個人設定 |
| `/artist/*` | ✅ | ❌ | 藝術家相關功能 |
| `/sorter/*` | ✅ | ❌ | 排序介面 |
| `/admin/*` | ✅ | ✅ | 管理後台（需 ADMIN 角色）|
| `/api/auth/*` | ❌ | ❌ | NextAuth 端點 |
| `/api/spotify/token` | ❌ | ❌ | Spotify Token（內部使用）|

---

## 版本資訊

- **文件版本**: 1.0.0
- **最後更新**: 2025-12-12
- **Next.js 版本**: 15
- **對應專案版本**: 請參考 `package.json`
