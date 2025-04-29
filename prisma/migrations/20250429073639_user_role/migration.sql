/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_Verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLogin" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Roles" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,
    "role_slug" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoles" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRoles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roles_role_slug_key" ON "Roles"("role_slug");

-- AddForeignKey
ALTER TABLE "UserRoles" ADD CONSTRAINT "UserRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoles" ADD CONSTRAINT "UserRoles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
