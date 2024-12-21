-- AlterTable
ALTER TABLE "Song" ADD COLUMN "img" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Album" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "spotifyUrl" TEXT NOT NULL,
    "img" TEXT,
    "releaseDate" DATETIME NOT NULL,
    CONSTRAINT "Album_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Album" ("artistId", "id", "img", "name", "releaseDate", "spotifyUrl") SELECT "artistId", "id", "img", "name", "releaseDate", "spotifyUrl" FROM "Album";
DROP TABLE "Album";
ALTER TABLE "new_Album" RENAME TO "Album";
CREATE UNIQUE INDEX "Album_spotifyUrl_key" ON "Album"("spotifyUrl");
CREATE UNIQUE INDEX "Album_name_artistId_key" ON "Album"("name", "artistId");
CREATE TABLE "new_Artist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "spotifyUrl" TEXT NOT NULL,
    "img" TEXT
);
INSERT INTO "new_Artist" ("id", "img", "name", "spotifyUrl") SELECT "id", "img", "name", "spotifyUrl" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE UNIQUE INDEX "Artist_spotifyUrl_key" ON "Artist"("spotifyUrl");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
