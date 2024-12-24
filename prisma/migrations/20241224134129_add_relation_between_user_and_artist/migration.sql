-- CreateEnum
CREATE TYPE "RankingType" AS ENUM ('ALBUM', 'ARTIST');

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "RankingSession" ADD COLUMN     "type" "RankingType";

-- CreateTable
CREATE TABLE "UsersOnArtists" (
    "userId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsersOnArtists_pkey" PRIMARY KEY ("userId","artistId")
);

-- AddForeignKey
ALTER TABLE "UsersOnArtists" ADD CONSTRAINT "UsersOnArtists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnArtists" ADD CONSTRAINT "UsersOnArtists_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
