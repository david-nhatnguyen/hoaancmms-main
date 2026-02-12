-- CreateEnum
CREATE TYPE "ChecklistCycle" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "ChecklistStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ChecklistExecutionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'FAILED');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "equipments" ADD COLUMN     "qrCode" TEXT;

-- CreateTable
CREATE TABLE "equipment_documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT,
    "size" INTEGER,
    "equipmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_histories" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "processedRecords" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "errorFileUrl" TEXT,
    "importType" TEXT NOT NULL DEFAULT 'EQUIPMENT',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_templates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "cycle" "ChecklistCycle" NOT NULL DEFAULT 'MONTHLY',
    "estimatedDuration" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "ChecklistStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_template_items" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "maintenanceTask" TEXT NOT NULL,
    "judgmentStandard" TEXT,
    "inspectionMethod" TEXT,
    "maintenanceContent" TEXT,
    "expectedResult" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "requiresImage" BOOLEAN NOT NULL DEFAULT false,
    "requiresNote" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_template_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_checklist_assignments" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "equipment_checklist_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_executions" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "workOrderId" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "actualStartDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "status" "ChecklistExecutionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "assignedTo" TEXT,
    "completedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "overallResult" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_execution_items" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "templateItemId" TEXT,
    "order" INTEGER NOT NULL,
    "maintenanceTask" TEXT NOT NULL,
    "judgmentStandard" TEXT,
    "inspectionMethod" TEXT,
    "maintenanceContent" TEXT,
    "expectedResult" TEXT,
    "actualResult" TEXT,
    "equipmentStatus" TEXT,
    "isPassed" BOOLEAN,
    "notes" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "requiresImage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_execution_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_execution_item_images" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "description" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT,

    CONSTRAINT "checklist_execution_item_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_execution_attachments" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT,
    "size" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT,

    CONSTRAINT "checklist_execution_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "equipment_documents_equipmentId_idx" ON "equipment_documents"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_templates_code_key" ON "checklist_templates"("code");

-- CreateIndex
CREATE INDEX "checklist_templates_status_idx" ON "checklist_templates"("status");

-- CreateIndex
CREATE INDEX "checklist_templates_cycle_idx" ON "checklist_templates"("cycle");

-- CreateIndex
CREATE INDEX "checklist_templates_category_idx" ON "checklist_templates"("category");

-- CreateIndex
CREATE INDEX "checklist_template_items_templateId_idx" ON "checklist_template_items"("templateId");

-- CreateIndex
CREATE INDEX "equipment_checklist_assignments_equipmentId_idx" ON "equipment_checklist_assignments"("equipmentId");

-- CreateIndex
CREATE INDEX "equipment_checklist_assignments_templateId_idx" ON "equipment_checklist_assignments"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_checklist_assignments_equipmentId_templateId_key" ON "equipment_checklist_assignments"("equipmentId", "templateId");

-- CreateIndex
CREATE INDEX "checklist_executions_equipmentId_idx" ON "checklist_executions"("equipmentId");

-- CreateIndex
CREATE INDEX "checklist_executions_templateId_idx" ON "checklist_executions"("templateId");

-- CreateIndex
CREATE INDEX "checklist_executions_status_idx" ON "checklist_executions"("status");

-- CreateIndex
CREATE INDEX "checklist_executions_scheduledDate_idx" ON "checklist_executions"("scheduledDate");

-- CreateIndex
CREATE INDEX "checklist_execution_items_executionId_idx" ON "checklist_execution_items"("executionId");

-- CreateIndex
CREATE INDEX "checklist_execution_item_images_itemId_idx" ON "checklist_execution_item_images"("itemId");

-- CreateIndex
CREATE INDEX "checklist_execution_attachments_executionId_idx" ON "checklist_execution_attachments"("executionId");

-- AddForeignKey
ALTER TABLE "equipment_documents" ADD CONSTRAINT "equipment_documents_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_template_items" ADD CONSTRAINT "checklist_template_items_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "checklist_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_checklist_assignments" ADD CONSTRAINT "equipment_checklist_assignments_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_checklist_assignments" ADD CONSTRAINT "equipment_checklist_assignments_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "checklist_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_executions" ADD CONSTRAINT "checklist_executions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "checklist_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_executions" ADD CONSTRAINT "checklist_executions_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_execution_items" ADD CONSTRAINT "checklist_execution_items_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "checklist_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_execution_item_images" ADD CONSTRAINT "checklist_execution_item_images_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "checklist_execution_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_execution_attachments" ADD CONSTRAINT "checklist_execution_attachments_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "checklist_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
