/*
  Warnings:

  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Blog_isPublished_idx";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
