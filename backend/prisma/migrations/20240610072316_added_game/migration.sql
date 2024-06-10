-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('DICE');

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "gameType" "GameType" NOT NULL,
    "userId" INTEGER NOT NULL,
    "betAmount" TEXT NOT NULL,
    "multiplier" TEXT NOT NULL,
    "winAmount" TEXT NOT NULL,
    "winChance" TEXT NOT NULL,
    "rollUnder" TEXT NOT NULL,
    "win" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
