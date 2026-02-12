/*
  Warnings:

  - You are about to drop the column `category` on the `checklist_templates` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedDuration` on the `checklist_templates` table. All the data in the column will be lost.
  - Added the required column `equipmentId` to the `checklist_templates` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add nullable equipmentId column first  
ALTER TABLE "checklist_templates" ADD COLUMN IF NOT EXISTS "equipmentId" TEXT;

--Step 2: Add other new optional columns
ALTER TABLE "checklist_templates" ADD COLUMN IF NOT EXISTS "assignedUserId" TEXT;
ALTER TABLE "checklist_templates" ADD COLUMN IF NOT EXISTS "department" TEXT;
ALTER TABLE "checklist_templates" ADD COLUMN IF NOT EXISTS "maintenanceStartDate" TIMESTAMP(3);

-- Step 3: Migrate existing data - assign first equipment to existing templates
DO $$
DECLARE
  first_equipment_id TEXT;
BEGIN
  -- Get the first equipment ID
  SELECT "id" INTO first_equipment_id FROM "equipments" ORDER BY "createdAt" ASC LIMIT 1;
  
  -- Update existing templates
  IF first_equipment_id IS NOT NULL THEN
    UPDATE "checklist_templates"
    SET "equipmentId" = first_equipment_id
    WHERE "equipmentId" IS NULL;
  END IF;
END $$;

-- Step 4: Make equipmentId NOT NULL after data migration
ALTER TABLE "checklist_templates" ALTER COLUMN "equipmentId" SET NOT NULL;

-- Step 5: Drop old columns if they exist
ALTER TABLE "checklist_templates" DROP COLUMN IF EXISTS "category";
ALTER TABLE "checklist_templates" DROP COLUMN IF EXISTS "estimatedDuration";

-- Step 6: Drop old index if exists
DROP INDEX IF EXISTS "checklist_templates_category_idx";

-- Step 7: Create new indexes if they don't exist
CREATE INDEX IF NOT EXISTS "checklist_templates_equipmentId_idx" ON "checklist_templates"("equipmentId");
CREATE INDEX IF NOT EXISTS "checklist_templates_assignedUserId_idx" ON "checklist_templates"("assignedUserId");

-- Step 8: Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'checklist_templates_equipmentId_fkey') THEN
    ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_equipmentId_fkey" 
    FOREIGN KEY ("equipmentId") REFERENCES "equipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'checklist_templates_assignedUserId_fkey') THEN
    ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_assignedUserId_fkey" 
    FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
