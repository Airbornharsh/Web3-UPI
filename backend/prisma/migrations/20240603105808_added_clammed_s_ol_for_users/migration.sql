-- CreateTable
CREATE TABLE "ClaimedSol" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimedSol_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClaimedSol" ADD CONSTRAINT "ClaimedSol_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
