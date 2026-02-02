/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `AdoptionForm` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clerkId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `location` on the `HelpAnimal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `clerkId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdoptionForm" ADD COLUMN     "petInfo" TEXT;

-- AlterTable
ALTER TABLE "HelpAnimal" DROP COLUMN "location",
ADD COLUMN     "location" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "petImg" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "clerkId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AdoptionForm_userId_key" ON "AdoptionForm"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
