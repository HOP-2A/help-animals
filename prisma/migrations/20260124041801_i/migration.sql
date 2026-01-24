/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `AdoptAnimal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AdoptAnimal_userId_key" ON "AdoptAnimal"("userId");
