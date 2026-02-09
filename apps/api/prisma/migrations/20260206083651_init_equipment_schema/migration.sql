/*
  Warnings:

  - The `priority` column on the `equipments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `equipments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EquipmentPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- AlterTable
ALTER TABLE "equipments" DROP COLUMN "priority",
ADD COLUMN     "priority" "EquipmentPriority" NOT NULL DEFAULT 'MEDIUM',
DROP COLUMN "status",
ADD COLUMN     "status" "EquipmentStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "equipments_status_idx" ON "equipments"("status");

-- CreateIndex
CREATE INDEX "equipments_priority_idx" ON "equipments"("priority");

-- CreateIndex
CREATE INDEX "equipments_groupId_idx" ON "equipments"("groupId");

-- CreateIndex
CREATE INDEX "equipments_name_idx" ON "equipments"("name");

-- CreateIndex
CREATE INDEX "equipments_factoryId_status_idx" ON "equipments"("factoryId", "status");
