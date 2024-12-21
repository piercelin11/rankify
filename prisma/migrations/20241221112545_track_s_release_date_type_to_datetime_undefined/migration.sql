-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "albumId" TEXT,
    "trackNumber" INTEGER NOT NULL,
    "spotifyUrl" TEXT NOT NULL,
    "img" TEXT,
    "artistId" TEXT NOT NULL,
    "releaseDate" DATETIME,
    CONSTRAINT "Track_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Track_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Track" ("albumId", "artistId", "id", "img", "name", "releaseDate", "spotifyUrl", "trackNumber") SELECT "albumId", "artistId", "id", "img", "name", "releaseDate", "spotifyUrl", "trackNumber" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE UNIQUE INDEX "Track_spotifyUrl_key" ON "Track"("spotifyUrl");
CREATE UNIQUE INDEX "Track_albumId_name_key" ON "Track"("albumId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
