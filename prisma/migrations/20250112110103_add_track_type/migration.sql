-- CreateEnum
CREATE TYPE "TrackType" AS ENUM ('STANDARD', 'REISSUE');

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "type" "TrackType" DEFAULT 'STANDARD';
