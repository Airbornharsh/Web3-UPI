-- CreateEnum
CREATE TYPE "OPERATION" AS ENUM ('DEPOSIT', 'WITHDRAW');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "Locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "walletBalance" TEXT NOT NULL DEFAULT '0';

-- CreateTable
CREATE TABLE "OperationTransaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "operation" "OPERATION" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OperationTransaction" ADD CONSTRAINT "OperationTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
