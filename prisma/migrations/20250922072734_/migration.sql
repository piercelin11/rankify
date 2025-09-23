/*
  Warnings:

  - A unique constraint covering the columns `[userId,artistId,type,albumId]` on the table `RankingDraft` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RankingDraft_userId_artistId_key";

-- AlterTable
ALTER TABLE "RankingDraft" ADD COLUMN     "albumId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RankingDraft_userId_artistId_type_albumId_key" ON "RankingDraft"("userId", "artistId", "type", "albumId");

-- AddForeignKey
ALTER TABLE "RankingDraft" ADD CONSTRAINT "RankingDraft_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
