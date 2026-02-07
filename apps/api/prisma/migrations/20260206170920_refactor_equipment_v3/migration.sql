/*
  Warnings:

  - You are about to drop the column `department` on the `equipments` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `equipments` table. All the data in the column will be lost.
  - You are about to drop the column `machineType` on the `equipments` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `equipments` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `equipments` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `equipments` table. All the data in the column will be lost.
  - You are about to drop the column `serialNumber` on the `equipments` table. All the data in the column will be lost.
  - You are about to drop the column `yearInService` on the `equipments` table. All the data in the column will be lost.
  - Added the required column `category` to the `equipments` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "equipments_factoryId_idx";

-- DropIndex
DROP INDEX "equipments_factoryId_status_idx";

-- DropIndex
DROP INDEX "equipments_groupId_idx";

-- DropIndex
DROP INDEX "equipments_priority_idx";

-- AlterTable
ALTER TABLE "equipments" DROP COLUMN "department",
DROP COLUMN "groupId",
DROP COLUMN "machineType",
DROP COLUMN "manufacturer",
DROP COLUMN "model",
DROP COLUMN "priority",
DROP COLUMN "serialNumber",
DROP COLUMN "yearInService",
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "dimension" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "modelYear" INTEGER,
ADD COLUMN     "origin" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "equipments_category_idx" ON "equipments"("category");
