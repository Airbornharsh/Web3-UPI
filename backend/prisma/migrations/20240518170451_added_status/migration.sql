-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "Status" "Status" NOT NULL DEFAULT 'PENDING';
