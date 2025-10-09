-- CreateTable
CREATE TABLE "public"."TrackStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "currentRank" INTEGER NOT NULL,
    "previousRank" INTEGER,
    "rankChange" INTEGER,
    "hotStreak" INTEGER NOT NULL DEFAULT 0,
    "coldStreak" INTEGER NOT NULL DEFAULT 0,
    "highestRank" INTEGER NOT NULL,
    "lowestRank" INTEGER NOT NULL,
    "averageRank" DOUBLE PRECISION NOT NULL,
    "submissionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrackStats_userId_artistId_idx" ON "public"."TrackStats"("userId", "artistId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackStats_userId_trackId_key" ON "public"."TrackStats"("userId", "trackId");

-- AddForeignKey
ALTER TABLE "public"."TrackStats" ADD CONSTRAINT "TrackStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackStats" ADD CONSTRAINT "TrackStats_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackStats" ADD CONSTRAINT "TrackStats_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "public"."Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
