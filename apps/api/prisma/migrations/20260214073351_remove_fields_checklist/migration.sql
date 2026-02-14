/*
  Warnings:

  - You are about to drop the column `assignedUserId` on the `checklist_templates` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `checklist_templates` table. All the data in the column will be lost.
  - You are about to drop the column `maintenanceStartDate` on the `checklist_templates` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "checklist_templates" DROP CONSTRAINT "checklist_templates_assignedUserId_fkey";

-- DropIndex
DROP INDEX "checklist_templates_assignedUserId_idx";

-- AlterTable
ALTER TABLE "checklist_templates" DROP COLUMN "assignedUserId",
DROP COLUMN "department",
DROP COLUMN "maintenanceStartDate";
