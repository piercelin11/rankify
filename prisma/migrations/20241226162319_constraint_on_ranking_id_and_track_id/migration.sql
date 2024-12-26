/*
  Warnings:

  - A unique constraint covering the columns `[id,trackId]` on the table `Ranking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ranking_id_trackId_key" ON "Ranking"("id", "trackId");
