-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "operationTransactionId" INTEGER;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_operationTransactionId_fkey" FOREIGN KEY ("operationTransactionId") REFERENCES "OperationTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
