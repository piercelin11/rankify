-- AlterTable
ALTER TABLE "public"."TrackStat" RENAME CONSTRAINT "TrackStats_pkey" TO "TrackStat_pkey";

-- RenameForeignKey
ALTER TABLE "public"."TrackStat" RENAME CONSTRAINT "TrackStats_artistId_fkey" TO "TrackStat_artistId_fkey";

-- RenameForeignKey
ALTER TABLE "public"."TrackStat" RENAME CONSTRAINT "TrackStats_trackId_fkey" TO "TrackStat_trackId_fkey";

-- RenameForeignKey
ALTER TABLE "public"."TrackStat" RENAME CONSTRAINT "TrackStats_userId_fkey" TO "TrackStat_userId_fkey";

-- RenameIndex
ALTER INDEX "public"."TrackStats_userId_artistId_idx" RENAME TO "TrackStat_userId_artistId_idx";

-- RenameIndex
ALTER INDEX "public"."TrackStats_userId_trackId_key" RENAME TO "TrackStat_userId_trackId_key";
