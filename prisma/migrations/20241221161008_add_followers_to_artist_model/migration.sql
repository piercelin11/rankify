/*
  Warnings:

  - Added the required column `spotifyFollowers` to the `Artist` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Artist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "spotifyUrl" TEXT NOT NULL,
    "img" TEXT,
    "spotifyFollowers" INTEGER NOT NULL
);
INSERT INTO "new_Artist" ("id", "img", "name", "spotifyUrl") SELECT "id", "img", "name", "spotifyUrl" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE UNIQUE INDEX "Artist_spotifyUrl_key" ON "Artist"("spotifyUrl");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
