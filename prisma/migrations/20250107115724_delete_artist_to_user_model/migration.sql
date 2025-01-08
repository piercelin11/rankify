/*
  Warnings:

  - You are about to drop the `_ArtistToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ArtistToUser" DROP CONSTRAINT "_ArtistToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArtistToUser" DROP CONSTRAINT "_ArtistToUser_B_fkey";

-- DropTable
DROP TABLE "_ArtistToUser";
