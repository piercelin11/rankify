/*
  Warnings:

  - Made the column `artistId` on table `RankingSession` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RankingSession" ALTER COLUMN "artistId" SET NOT NULL;
