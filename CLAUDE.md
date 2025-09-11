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
- Always use traditional chinese.