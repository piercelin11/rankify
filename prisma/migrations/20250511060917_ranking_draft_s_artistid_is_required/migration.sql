/*
  Warnings:

  - Made the column `artistId` on table `RankingDraft` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RankingDraft" ALTER COLUMN "artistId" SET NOT NULL;
