/*
  Warnings:

  - You are about to drop the column `to` on the `OperationTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `toId` to the `OperationTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OperationTransaction" DROP COLUMN "to",
ADD COLUMN     "toId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "Status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "OperationTransaction" ADD CONSTRAINT "OperationTransaction_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
