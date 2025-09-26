/*
  Warnings:

  - You are about to drop the column `dateId` on the `AlbumRanking` table. All the data in the column will be lost.
  - You are about to drop the `Ranking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RankingDraft` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RankingSession` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,submissionId,albumId]` on the table `AlbumRanking` will be added. If there are existing duplicate values, this will fail.
  - Made the column `submissionId` on table `AlbumRanking` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `type` on the `RankingSubmission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('ALBUM', 'ARTIST');

-- DropForeignKey
ALTER TABLE "AlbumRanking" DROP CONSTRAINT "AlbumRanking_dateId_fkey";

-- DropForeignKey
ALTER TABLE "Ranking" DROP CONSTRAINT "Ranking_albumId_fkey";

-- DropForeignKey
ALTER TABLE "Ranking" DROP CONSTRAINT "Ranking_artistId_fkey";

-- DropForeignKey
ALTER TABLE "Ranking" DROP CONSTRAINT "Ranking_dateId_fkey";

-- DropForeignKey
ALTER TABLE "Ranking" DROP CONSTRAINT "Ranking_trackId_fkey";

-- DropForeignKey
ALTER TABLE "Ranking" DROP CONSTRAINT "Ranking_userId_fkey";

-- DropForeignKey
ALTER TABLE "RankingDraft" DROP CONSTRAINT "RankingDraft_albumId_fkey";

-- DropForeignKey
ALTER TABLE "RankingDraft" DROP CONSTRAINT "RankingDraft_artistId_fkey";

-- DropForeignKey
ALTER TABLE "RankingDraft" DROP CONSTRAINT "RankingDraft_userId_fkey";

-- DropForeignKey
ALTER TABLE "RankingSession" DROP CONSTRAINT "RankingSession_artistId_fkey";

-- DropForeignKey
ALTER TABLE "RankingSession" DROP CONSTRAINT "RankingSession_userId_fkey";

-- DropIndex
DROP INDEX "AlbumRanking_userId_dateId_albumId_key";

-- AlterTable
ALTER TABLE "AlbumRanking" DROP COLUMN "dateId",
ALTER COLUMN "submissionId" SET NOT NULL;

-- AlterTable
ALTER TABLE "RankingSubmission" DROP COLUMN "type",
ADD COLUMN     "type" "SubmissionType" NOT NULL;

-- DropTable
DROP TABLE "Ranking";

-- DropTable
DROP TABLE "RankingDraft";

-- DropTable
DROP TABLE "RankingSession";

-- DropEnum
DROP TYPE "RankingType";

-- CreateIndex
CREATE UNIQUE INDEX "AlbumRanking_userId_submissionId_albumId_key" ON "AlbumRanking"("userId", "submissionId", "albumId");

-- CreateIndex
CREATE UNIQUE INDEX "RankingSubmission_userId_artistId_type_albumId_key" ON "RankingSubmission"("userId", "artistId", "type", "albumId");
