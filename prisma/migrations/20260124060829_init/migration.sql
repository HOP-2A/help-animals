/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `AdoptAnimal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `AdoptionForm` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AdoptionForm" ADD COLUMN     "petInfo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AdoptAnimal_userId_key" ON "AdoptAnimal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdoptionForm_userId_key" ON "AdoptionForm"("userId");
