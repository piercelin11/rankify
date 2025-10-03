# Rankify

一個基於 Next.js 的音樂排名系統，允許使用者為喜愛的藝人建立個人化的歌曲排名。

## 專案簡介

Rankify 是一個互動式音樂排名平台，整合 Spotify API 提供豐富的音樂資料。使用者可以：
- 透過直覺的排序介面建立歌曲排名
- 查看個人的排名統計與歷史記錄
- 追蹤專輯排名變化
- 與社群分享排名資料

## 功能特色

### Artist 頁面架構

#### My Stats 頁面
個人排名統計中心，提供兩種資料來源模式：

- **Average 模式**：顯示所有歷史排名的平均統計
  - 支援時間範圍過濾（`?range=past-year`）
  - 動態計算平均排名、峰值、最差排名等指標

- **Snapshot 模式**：查看特定時間點的排名快照
  - 透過創新的 Hybrid 下拉按鈕快速切換不同時間點
  - 保留完整的歷史排名資料

#### 視圖切換
兩種資料呈現方式：

- **Overview（總覽儀表板）**：圖表視覺化 + 專輯面板
- **All Rankings（完整列表）**：虛擬化排名表格

#### Community 頁面
社群統計資料（開發中）

### Album 排名系統
- 基於歌曲排名自動計算專輯排名
- 採用積分制系統（Top 5% 額外加分）
- Session 追蹤與歷史記錄

### Sorter 介面
- 直覺的兩兩比較排序系統
- 支援專輯過濾與篩選
- 自動儲存排名進度

## 技術架構

### 核心技術棧
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google provider
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Testing**: Jest with React Testing Library
- **External APIs**: Spotify Web API

### 專案結構

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/            # 主應用路由
│   │   └── artist/[artistId]/
│   │       ├── my-stats/           # 個人統計（Average 模式）
│   │       ├── my-stats/[sessionId]/  # 快照模式
│   │       └── community/          # 社群頁面
│   ├── auth/              # 認證頁面
│   ├── admin/             # 管理後台
│   └── sorter/            # 排序介面
├── components/            # 可重用 UI 元件
├── features/              # 功能模組
│   ├── ranking/          # 排名功能
│   ├── auth/             # 認證功能
│   ├── admin/            # 管理功能
│   └── sorter/           # 排序功能
├── lib/                   # 工具函式
├── services/              # 資料服務層
├── db/                    # 資料庫查詢
├── store/                 # Redux store
└── types/                 # TypeScript 型別定義
```

### 資料庫模型
核心實體：User, Artist, Album, Track, Ranking, RankingSession, AlbumRanking
- 使用者可為特定藝人建立歌曲和專輯排名
- 排名按 Session 儲存，支援歷史追蹤
- 專輯排名基於歌曲排名的積分系統自動計算

## 路由結構

### Artist 頁面路由設計

#### Average 模式（聚合統計）
```bash
# 預設 Overview 視圖
/artist/taylor-swift/my-stats

# 明確指定視圖
/artist/taylor-swift/my-stats?view=overview
/artist/taylor-swift/my-stats?view=all-rankings

# 支援時間範圍過濾
/artist/taylor-swift/my-stats?view=overview&range=past-year
```

#### Snapshot 模式（歷史快照）
```bash
# 預設 Overview 視圖
/artist/taylor-swift/my-stats/abc123

# 明確指定視圖
/artist/taylor-swift/my-stats/abc123?view=overview
/artist/taylor-swift/my-stats/abc123?view=all-rankings
```

### 向後相容策略
舊路由會自動重定向到新結構：
- `/artist/[id]/overview` → `/artist/[id]/my-stats`
- `/artist/[id]/history` → `/artist/[id]/my-stats/[latestSessionId]`
- `/artist/[id]/history/[dateId]` → `/artist/[id]/my-stats/[dateId]`（保留 view 參數）

### URL 參數驗證
- 無效的 `view` 參數會自動重定向到有效值
- 不存在的 `sessionId` 會顯示 404
- 其他查詢參數（如 `range`）在重定向時會保留

## 開發指南

### 環境變數設定
建立 `.env` 檔案並設定以下變數：

```bash
# Database
POSTGRES_DATABASE_URL="postgresql://..."

# NextAuth
AUTH_SECRET="your-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Spotify API
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
```

### 開發指令

#### 開發伺服器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看應用程式。

#### 測試
```bash
npm run test          # 執行測試
npm run test:watch    # Watch 模式
```

#### 程式碼品質
```bash
npm run lint          # ESLint 檢查
npm run prettier      # Prettier 格式化
```

#### 建置
```bash
npm run build         # 建置生產版本
npm start             # 啟動生產伺服器
```

### 資料庫操作
```bash
npx prisma generate   # 生成 Prisma Client（schema 變更後執行）
npx prisma migrate dev  # 執行資料庫遷移
npx prisma studio     # 開啟資料庫 GUI
```

### Git Commit 規範
本專案採用 Conventional Commits 格式（繁體中文）：

```bash
# 建立 commit.md（由 Claude Code 自動生成）
# 內容包含：Type、Scope、Subject、Body、Breaking Changes

# 手動執行 commit（請勿使用 git commit -m）
git commit -m "$(cat commit.md 中的建議指令)"
```

詳細規範請參考 `CLAUDE.md`。

## 技術決策

詳細的技術決策記錄請參考 [TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md)。

主要決策包含：
- Hybrid Snapshot 按鈕設計（消除二階互動）
- 型別安全策略（Single Source of Truth）
- React Cache 優化策略
- 參數驗證與錯誤處理原則
- 向後相容處理方式

## 學習資源

### Next.js
- [Next.js Documentation](https://nextjs.org/docs) - Next.js 功能與 API
- [Learn Next.js](https://nextjs.org/learn) - 互動式教學

### 專案特定資源
- [Prisma Documentation](https://www.prisma.io/docs) - Prisma ORM
- [Radix UI](https://www.radix-ui.com/) - 無障礙 UI 元件
- [Tailwind CSS](https://tailwindcss.com/docs) - CSS 框架
- [Spotify Web API](https://developer.spotify.com/documentation/web-api) - Spotify API

## 部署

### Vercel（推薦）
最簡單的部署方式是使用 [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)。

詳細步驟請參考 [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)。

### 環境變數設定
部署前請確保在平台設定所有必要的環境變數（參考上方「環境變數設定」章節）。

## 授權

[授權資訊待補充]
