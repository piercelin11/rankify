/*
  Warnings:

  - A unique constraint covering the columns `[userId,dateId,trackId]` on the table `Ranking` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Ranking_id_trackId_key";

-- AlterTable
ALTER TABLE "Ranking" ADD COLUMN     "rankPercentile" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "color" TEXT;

-- CreateTable
CREATE TABLE "AlbumRanking" (
    "id" TEXT NOT NULL,
    "ranking" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "dateId" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AlbumRanking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlbumRanking_userId_dateId_albumId_key" ON "AlbumRanking"("userId", "dateId", "albumId");

-- CreateIndex
CREATE INDEX "Album_artistId_idx" ON "Album"("artistId");

-- CreateIndex
CREATE INDEX "Ranking_ranking_idx" ON "Ranking"("ranking");

-- CreateIndex
CREATE INDEX "Ranking_rankChange_idx" ON "Ranking"("rankChange");

-- CreateIndex
CREATE INDEX "Ranking_dateId_idx" ON "Ranking"("dateId");

-- CreateIndex
CREATE UNIQUE INDEX "Ranking_userId_dateId_trackId_key" ON "Ranking"("userId", "dateId", "trackId");

-- CreateIndex
CREATE INDEX "Track_albumId_idx" ON "Track"("albumId");

-- CreateIndex
CREATE INDEX "Track_artistId_idx" ON "Track"("artistId");

-- AddForeignKey
ALTER TABLE "AlbumRanking" ADD CONSTRAINT "AlbumRanking_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumRanking" ADD CONSTRAINT "AlbumRanking_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumRanking" ADD CONSTRAINT "AlbumRanking_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "RankingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumRanking" ADD CONSTRAINT "AlbumRanking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
