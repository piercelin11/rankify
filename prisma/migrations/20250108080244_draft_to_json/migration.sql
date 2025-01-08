/*
  Warnings:

  - The `draft` column on the `RankingDraft` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `result` column on the `RankingDraft` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "RankingDraft" DROP COLUMN "draft",
ADD COLUMN     "draft" JSONB,
DROP COLUMN "result",
ADD COLUMN     "result" JSONB;
