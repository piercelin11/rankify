/*
  Warnings:

  - You are about to drop the `ArtistToGenre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Genre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Song` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ArtistToGenre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `songId` on the `Ranking` table. All the data in the column will be lost.
  - Added the required column `trackId` to the `Ranking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Song_albumId_name_key";

-- DropIndex
DROP INDEX "Song_spotifyUrl_key";

-- DropIndex
DROP INDEX "_ArtistToGenre_B_index";

-- DropIndex
DROP INDEX "_ArtistToGenre_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ArtistToGenre";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Genre";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Song";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ArtistToGenre";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "albumId" TEXT,
    "trackNumber" INTEGER NOT NULL,
    "spotifyUrl" TEXT NOT NULL,
    "img" TEXT,
    "artistId" TEXT NOT NULL,
    "release_date" DATETIME,
    CONSTRAINT "Track_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Track_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ranking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ranking" INTEGER NOT NULL,
    "dateId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "albumId" TEXT,
    "artistid" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Ranking_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "RankingSession" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT "Ranking_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ranking_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ranking_artistid_fkey" FOREIGN KEY ("artistid") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ranking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Ranking" ("albumId", "artistid", "dateId", "id", "ranking", "userId") SELECT "albumId", "artistid", "dateId", "id", "ranking", "userId" FROM "Ranking";
DROP TABLE "Ranking";
ALTER TABLE "new_Ranking" RENAME TO "Ranking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Track_spotifyUrl_key" ON "Track"("spotifyUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Track_albumId_name_key" ON "Track"("albumId", "name");
