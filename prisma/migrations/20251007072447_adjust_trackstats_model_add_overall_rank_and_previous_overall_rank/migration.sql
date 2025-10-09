/*
  Warnings:

  - You are about to drop the column `currentRank` on the `TrackStats` table. All the data in the column will be lost.
  - You are about to drop the column `previousRank` on the `TrackStats` table. All the data in the column will be lost.
  - You are about to drop the column `rankChange` on the `TrackStats` table. All the data in the column will be lost.
  - Added the required column `overallRank` to the `TrackStats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."TrackStats" DROP COLUMN "currentRank",
DROP COLUMN "previousRank",
DROP COLUMN "rankChange",
ADD COLUMN     "overallRank" INTEGER NOT NULL,
ADD COLUMN     "overallRankChange" INTEGER,
ADD COLUMN     "previousAverageRank" DOUBLE PRECISION,
ADD COLUMN     "previousOverallRank" INTEGER;
