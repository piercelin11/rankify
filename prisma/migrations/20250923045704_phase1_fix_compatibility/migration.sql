/*
  Warnings:

  - You are about to drop the column `submissionId` on the `AlbumRanking` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AlbumRanking" DROP CONSTRAINT "AlbumRanking_submissionId_fkey";

-- AlterTable
ALTER TABLE "AlbumRanking" DROP COLUMN "submissionId";
