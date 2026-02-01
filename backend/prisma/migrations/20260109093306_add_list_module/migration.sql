/*
  Warnings:

  - You are about to alter the column `position` on the `lists` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "lists" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "position" SET DEFAULT 0,
ALTER COLUMN "position" SET DATA TYPE INTEGER;
