/*
  Warnings:

  - You are about to drop the column `artistid` on the `Ranking` table. All the data in the column will be lost.
  - Added the required column `artistId` to the `Ranking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ranking" DROP CONSTRAINT "Ranking_artistid_fkey";

-- DropForeignKey
ALTER TABLE "Ranking" DROP CONSTRAINT "Ranking_dateId_fkey";

-- DropForeignKey
ALTER TABLE "RankingSession" DROP CONSTRAINT "RankingSession_artistId_fkey";

-- AlterTable
ALTER TABLE "Ranking" DROP COLUMN "artistid",
ADD COLUMN     "artistId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "RankingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingSession" ADD CONSTRAINT "RankingSession_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
