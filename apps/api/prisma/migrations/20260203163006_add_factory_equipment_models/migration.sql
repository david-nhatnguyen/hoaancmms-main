/*
  Warnings:

  - You are about to drop the column `address` on the `factories` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `factories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `factories` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FactoryStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- Step 1: Add new columns with temporary defaults
ALTER TABLE "factories" 
ADD COLUMN "code" TEXT,
ADD COLUMN "location" TEXT,
ADD COLUMN "status" "FactoryStatus" NOT NULL DEFAULT 'ACTIVE';

-- Step 2: Migrate existing data
-- Copy address to location
UPDATE "factories" SET "location" = "address";

-- Generate code from row number (F01, F02, etc.)
WITH numbered_factories AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") as row_num
  FROM "factories"
)
UPDATE "factories" f
SET "code" = 'F' || LPAD(nf.row_num::TEXT, 2, '0')
FROM numbered_factories nf
WHERE f.id = nf.id;

-- Step 3: Drop old column and make code required
ALTER TABLE "factories" DROP COLUMN "address";
ALTER TABLE "factories" ALTER COLUMN "code" SET NOT NULL;

-- CreateTable
CREATE TABLE "equipments" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "groupId" TEXT,
    "machineType" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "yearInService" INTEGER,
    "department" TEXT,
    "priority" TEXT,
    "status" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "equipments_code_key" ON "equipments"("code");

-- CreateIndex
CREATE INDEX "equipments_factoryId_idx" ON "equipments"("factoryId");

-- CreateIndex
CREATE INDEX "equipments_code_idx" ON "equipments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "factories_code_key" ON "factories"("code");

-- CreateIndex
CREATE INDEX "factories_status_idx" ON "factories"("status");

-- CreateIndex
CREATE INDEX "factories_code_idx" ON "factories"("code");

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "factories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
