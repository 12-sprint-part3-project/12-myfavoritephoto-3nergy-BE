/*
  Warnings:

  - You are about to alter the column `description` on the `photocards` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - Made the column `description` on table `photocards` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "photocards" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "trades" ADD COLUMN     "description" VARCHAR(500) NOT NULL DEFAULT '';
