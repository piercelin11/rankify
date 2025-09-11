# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application
- `npm start` - Start production server
- `npm run lint` - Run Next.js linting

### Testing
- `npm run test` - Run Jest tests with Node experimental modules
- `npm run test:watch` - Run Jest in watch mode

### Code Quality
- `npm run prettier` - Format code with Prettier

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google provider
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Testing**: Jest with React Testing Library
- **External APIs**: Spotify Web API

### Project Structure

#### App Router Structure
- `src/app/(main)/` - Main authenticated application routes
- `src/app/auth/` - Authentication pages (signin, signup)
- `src/app/admin/` - Admin panel for content management
- `src/app/sorter/` - Music ranking/sorting interface

#### Core Features
- **Features-based Architecture**: Code organized by feature in `src/features/`
  - `ranking/` - Track and album ranking functionality
  - `auth/` - Authentication components
  - `admin/` - Content management features
  - `sorter/` - Ranking comparison interface

#### Database Models (Prisma)
Core entities: User, Artist, Album, Track, Ranking, RankingSession, AlbumRanking
- Users can rank tracks and albums for specific artists
- Rankings are stored per session with historical tracking
- Album rankings calculated from track rankings using points system

#### Key Directories
- `src/lib/` - Utilities including database queries, Spotify API, and helper functions
- `src/components/` - Reusable UI components organized by type
- `src/store/` - Redux store configuration and slices
- `src/types/` - TypeScript type definitions

### Database
- Uses Prisma with PostgreSQL
- Schema located at `prisma/schema.prisma`
- Run `npx prisma generate` after schema changes
- Migrations handled automatically via Prisma

### Authentication
- NextAuth.js configured in `auth.config.ts` 
- Google OAuth provider
- User sessions and roles managed through Prisma adapter

### Environment Variables
Required for Spotify API integration and database connectivity:
- `POSTGRES_DATABASE_URL`
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
- Spotify API credentials for music data fetching

### Others
- 一律使用繁體中文跟我互動
- 型別定義統一使用 `type` 而非 `interface`
- 避免預防性優化。預設情況下不使用 `useCallback`, `useMemo`, `React.memo`。使用時機：只有當明確觀察到效能瓶頸，且子元件被 `React.memo` 包裹時，才為傳遞給它的 props (函式或物件) 加上 `useCallback` 或 `useMemo`。
- React hooks 必須使用具名導入。
- 所有表單功能一律使用 `react-hook-form` 進行開發。必須搭配 `zod` 和 `@hookform/resolvers/zod` 進行 schema 驗證。必須使用 `formState`.`errors` 物件來捕獲錯誤，並將錯誤訊息傳遞給專案內的顯示錯誤的元件。
- 撰寫程式碼時，需時刻考慮「單一職責原則」與「程式碼複用」。如果一個 UI 區塊在多處重複出現，請將其拆分為獨立的元件。如果一個元件的邏輯變得過於複雜，請將其拆分為更小的、功能單一的子元件。如果你發現有元件化或提取 Hook 的機會，請先提出建議並詢問我的意見，再進行實作。提問範例：「我建議將 `ArtistEditingForm` 和 `AlbumEditingForm` 中處理表單提交、錯誤和載入狀態的邏輯提取到一個名為 `useEditForm` 的 Hook 中，以簡化元件並達成邏輯複用。請問您同意嗎？」