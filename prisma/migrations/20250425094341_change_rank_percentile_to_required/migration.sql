/*
  Warnings:

  - Made the column `rankPercentile` on table `Ranking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Ranking" ALTER COLUMN "rankPercentile" SET NOT NULL;
