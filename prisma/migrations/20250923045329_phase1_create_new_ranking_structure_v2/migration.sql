-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('IN_PROGRESS', 'DRAFT', 'COMPLETED');

-- AlterTable
ALTER TABLE "AlbumRanking" ADD COLUMN     "submissionId" TEXT;

-- CreateTable
CREATE TABLE "RankingSubmission" (
    "id" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL,
    "type" TEXT NOT NULL,
    "rankingState" JSONB,
    "userId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "albumId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "RankingSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackRanking" (
    "id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "rankPercentile" DOUBLE PRECISION NOT NULL,
    "score" DOUBLE PRECISION,
    "rankChange" INTEGER,
    "submissionId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,

    CONSTRAINT "TrackRanking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RankingSubmission_userId_artistId_type_albumId_key" ON "RankingSubmission"("userId", "artistId", "type", "albumId");

-- CreateIndex
CREATE INDEX "TrackRanking_userId_idx" ON "TrackRanking"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackRanking_submissionId_trackId_key" ON "TrackRanking"("submissionId", "trackId");

-- AddForeignKey
ALTER TABLE "AlbumRanking" ADD CONSTRAINT "AlbumRanking_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "RankingSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingSubmission" ADD CONSTRAINT "RankingSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingSubmission" ADD CONSTRAINT "RankingSubmission_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingSubmission" ADD CONSTRAINT "RankingSubmission_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackRanking" ADD CONSTRAINT "TrackRanking_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "RankingSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackRanking" ADD CONSTRAINT "TrackRanking_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
