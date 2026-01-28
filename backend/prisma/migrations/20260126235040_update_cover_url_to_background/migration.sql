/*
  Warnings:

  - You are about to drop the column `coverUrl` on the `cards` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cards" DROP COLUMN "coverUrl",
ADD COLUMN     "background" TEXT;
