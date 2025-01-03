/*
  Warnings:

  - A unique constraint covering the columns `[userId,artistId]` on the table `RankingDraft` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RankingDraft_userId_artistId_key" ON "RankingDraft"("userId", "artistId");
