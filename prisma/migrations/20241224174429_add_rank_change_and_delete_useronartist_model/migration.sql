/*
  Warnings:

  - You are about to drop the `UsersOnArtists` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UsersOnArtists" DROP CONSTRAINT "UsersOnArtists_artistId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnArtists" DROP CONSTRAINT "UsersOnArtists_userId_fkey";

-- AlterTable
ALTER TABLE "Ranking" ADD COLUMN     "rankChange" INTEGER;

-- DropTable
DROP TABLE "UsersOnArtists";

-- CreateTable
CREATE TABLE "_ArtistToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArtistToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ArtistToUser_B_index" ON "_ArtistToUser"("B");

-- AddForeignKey
ALTER TABLE "_ArtistToUser" ADD CONSTRAINT "_ArtistToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToUser" ADD CONSTRAINT "_ArtistToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
