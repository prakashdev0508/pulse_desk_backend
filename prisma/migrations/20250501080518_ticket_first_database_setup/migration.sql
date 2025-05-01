/*
  Warnings:

  - The `role_slug` column on the `Roles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `projectId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the `TicketComment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[refreshToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusID` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRoleSlug" AS ENUM ('account_owner', 'admin', 'user', 'guest', 'super_admin', 'project_manager', 'developer');

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_projectId_fkey";

-- DropForeignKey
ALTER TABLE "TicketComment" DROP CONSTRAINT "TicketComment_ticketId_fkey";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "address" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "Roles" DROP COLUMN "role_slug",
ADD COLUMN     "role_slug" "UserRoleSlug";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "projectId",
DROP COLUMN "status",
ADD COLUMN     "assignedgroupId" TEXT,
ADD COLUMN     "automationRuleId" TEXT,
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "customFields" JSONB,
ADD COLUMN     "customerId" TEXT NOT NULL,
ADD COLUMN     "escalationRuleId" TEXT,
ADD COLUMN     "resolutionTime" TIMESTAMP(3),
ADD COLUMN     "responseTime" TIMESTAMP(3),
ADD COLUMN     "statusID" TEXT NOT NULL,
ADD COLUMN     "subCategoryId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT;

-- DropTable
DROP TABLE "TicketComment";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "TicketCustomer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketAttachments" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketAttachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketComments" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketComments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketsAutomations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketsAutomations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketCategories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketSubCategories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "ticketCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketSubCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketStatuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketStatuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "maxUsers" INTEGER NOT NULL,
    "maxProjects" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketEscalationRules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "priority" "TicketPriority" NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "resolutionTime" INTEGER NOT NULL,
    "escalationLevels" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketEscalationRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketEscalations" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "escalatedTo" TEXT NOT NULL,
    "escalatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketEscalations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserTicketGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserTicketGroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserTicketGroups_B_index" ON "_UserTicketGroups"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_role_slug_key" ON "Roles"("role_slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_refreshToken_key" ON "User"("refreshToken");

-- AddForeignKey
ALTER TABLE "TicketCustomer" ADD CONSTRAINT "TicketCustomer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TicketCategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "TicketSubCategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "TicketCustomer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_statusID_fkey" FOREIGN KEY ("statusID") REFERENCES "TicketStatuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_automationRuleId_fkey" FOREIGN KEY ("automationRuleId") REFERENCES "TicketsAutomations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_escalationRuleId_fkey" FOREIGN KEY ("escalationRuleId") REFERENCES "TicketEscalationRules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedgroupId_fkey" FOREIGN KEY ("assignedgroupId") REFERENCES "TicketGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketAttachments" ADD CONSTRAINT "TicketAttachments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketComments" ADD CONSTRAINT "TicketComments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketGroup" ADD CONSTRAINT "TicketGroup_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketsAutomations" ADD CONSTRAINT "TicketsAutomations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketCategories" ADD CONSTRAINT "TicketCategories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketSubCategories" ADD CONSTRAINT "TicketSubCategories_ticketCategoryId_fkey" FOREIGN KEY ("ticketCategoryId") REFERENCES "TicketCategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketSubCategories" ADD CONSTRAINT "TicketSubCategories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketStatuses" ADD CONSTRAINT "TicketStatuses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketEscalationRules" ADD CONSTRAINT "TicketEscalationRules_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketEscalationRules" ADD CONSTRAINT "TicketEscalationRules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TicketCategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketEscalations" ADD CONSTRAINT "TicketEscalations_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTicketGroups" ADD CONSTRAINT "_UserTicketGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "TicketGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTicketGroups" ADD CONSTRAINT "_UserTicketGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
