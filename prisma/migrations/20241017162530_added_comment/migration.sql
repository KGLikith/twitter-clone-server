/*
  Warnings:

  - You are about to drop the `Commnet` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Commnet" DROP CONSTRAINT "Commnet_tweetId_fkey";

-- DropForeignKey
ALTER TABLE "Commnet" DROP CONSTRAINT "Commnet_userId_fkey";

-- DropTable
DROP TABLE "Commnet";

-- CreateTable
CREATE TABLE "Commet" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Commet" ADD CONSTRAINT "Commet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commet" ADD CONSTRAINT "Commet_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "Tweet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
