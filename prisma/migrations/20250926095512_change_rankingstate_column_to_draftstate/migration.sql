/*
  Warnings:

  - You are about to drop the column `rankingState` on the `RankingSubmission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RankingSubmission" DROP COLUMN "rankingState",
ADD COLUMN     "draftState" JSONB;
