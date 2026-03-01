/*
  Warnings:

  - The values [CLOSED] on the enum `HelpStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `type` on the `Reaction` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "HelpStatus_new" AS ENUM ('LOST', 'HOMELESS', 'IN_PROGRESS', 'RESCUED');
ALTER TABLE "public"."HelpAnimal" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "HelpAnimal" ALTER COLUMN "status" TYPE "HelpStatus_new" USING ("status"::text::"HelpStatus_new");
ALTER TYPE "HelpStatus" RENAME TO "HelpStatus_old";
ALTER TYPE "HelpStatus_new" RENAME TO "HelpStatus";
DROP TYPE "public"."HelpStatus_old";
ALTER TABLE "HelpAnimal" ALTER COLUMN "status" SET DEFAULT 'LOST';
COMMIT;

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "parentCommentId" TEXT;

-- AlterTable
ALTER TABLE "HelpAnimal" ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "Reaction" DROP COLUMN "type";

-- DropEnum
DROP TYPE "ReactionType";

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
