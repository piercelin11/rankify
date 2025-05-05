/*
  Warnings:

  - Added the required column `basePoints` to the `AlbumRanking` table without a default value. This is not possible if the table is not empty.
  - Made the column `averageTrackRanking` on table `AlbumRanking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AlbumRanking" ADD COLUMN     "basePoints" INTEGER NOT NULL,
ALTER COLUMN "averageTrackRanking" SET NOT NULL;
