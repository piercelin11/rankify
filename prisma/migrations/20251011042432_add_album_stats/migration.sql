-- CreateTable
CREATE TABLE "public"."AlbumStat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "previousPoints" INTEGER,
    "pointsChange" INTEGER,
    "overallRank" INTEGER NOT NULL,
    "previousOverallRank" INTEGER,
    "overallRankChange" INTEGER,
    "averageTrackRank" DOUBLE PRECISION NOT NULL,
    "trackCount" INTEGER NOT NULL,
    "submissionCount" INTEGER NOT NULL,
    "top5PercentCount" INTEGER NOT NULL,
    "top10PercentCount" INTEGER NOT NULL,
    "top25PercentCount" INTEGER NOT NULL,
    "top50PercentCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlbumStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlbumStat_userId_artistId_idx" ON "public"."AlbumStat"("userId", "artistId");

-- CreateIndex
CREATE INDEX "AlbumStat_overallRank_idx" ON "public"."AlbumStat"("overallRank");

-- CreateIndex
CREATE UNIQUE INDEX "AlbumStat_userId_albumId_key" ON "public"."AlbumStat"("userId", "albumId");

-- AddForeignKey
ALTER TABLE "public"."AlbumStat" ADD CONSTRAINT "AlbumStat_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "public"."Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AlbumStat" ADD CONSTRAINT "AlbumStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AlbumStat" ADD CONSTRAINT "AlbumStat_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
