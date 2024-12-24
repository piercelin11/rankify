-- DropForeignKey
ALTER TABLE "Ranking" DROP CONSTRAINT "Ranking_albumId_fkey";

-- DropForeignKey
ALTER TABLE "Ranking" DROP CONSTRAINT "Ranking_artistid_fkey";

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_artistid_fkey" FOREIGN KEY ("artistid") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
