-- CreateTable
CREATE TABLE "RankingDraft" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "artistId" TEXT,
    "draft" JSONB NOT NULL,
    "type" "RankingType",

    CONSTRAINT "RankingDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RankingDraft_date_idx" ON "RankingDraft"("date");

-- AddForeignKey
ALTER TABLE "RankingDraft" ADD CONSTRAINT "RankingDraft_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingDraft" ADD CONSTRAINT "RankingDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
