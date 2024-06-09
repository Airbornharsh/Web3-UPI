-- DropForeignKey
ALTER TABLE "OperationTransaction" DROP CONSTRAINT "OperationTransaction_toId_fkey";

-- AlterTable
ALTER TABLE "OperationTransaction" ALTER COLUMN "toId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OperationTransaction" ADD CONSTRAINT "OperationTransaction_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
