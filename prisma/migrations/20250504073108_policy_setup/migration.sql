/*
  Warnings:

  - Added the required column `comment` to the `TicketComments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('SYSTEM', 'CUSTOM');

-- AlterTable
ALTER TABLE "TicketComments" ADD COLUMN     "comment" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "PolicyName" TEXT NOT NULL,
    "permissions" JSONB,
    "policy" JSONB NOT NULL,
    "policyType" "PolicyType" NOT NULL DEFAULT 'SYSTEM',
    "createdBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
