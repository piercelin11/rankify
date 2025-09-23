-- AlterTable
ALTER TABLE "AlbumRanking" ADD COLUMN     "submissionId" TEXT;

-- AddForeignKey
ALTER TABLE "AlbumRanking" ADD CONSTRAINT "AlbumRanking_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "RankingSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
