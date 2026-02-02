/*
  Warnings:

  - The values [CLOSED] on the enum `HelpStatus` will be removed. If these variants are still used in the database, this will fail.

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
