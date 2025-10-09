/*
  Warnings:

  - You are about to drop the column `averageTrackRanking` on the `AlbumRanking` table. All the data in the column will be lost.
  - You are about to drop the column `ranking` on the `AlbumRanking` table. All the data in the column will be lost.
  - Added the required column `averageTrackRank` to the `AlbumRanking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rank` to the `AlbumRanking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AlbumRanking" RENAME COLUMN "ranking" TO "rank";
ALTER TABLE "AlbumRanking" RENAME COLUMN "averageTrackRanking" TO "averageTrackRank";
