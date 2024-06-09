-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('WALLET1', 'WALLET2');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "wallet" "WalletType" NOT NULL DEFAULT 'WALLET1',
ALTER COLUMN "signature" SET DEFAULT '';
