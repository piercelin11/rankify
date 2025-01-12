/*
  Warnings:

  - Made the column `type` on table `Track` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Track" ALTER COLUMN "type" SET NOT NULL;
