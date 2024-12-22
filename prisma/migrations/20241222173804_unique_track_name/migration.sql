/*
  Warnings:

  - A unique constraint covering the columns `[artistId,name]` on the table `Track` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Track_artistId_name_key" ON "Track"("artistId", "name");
