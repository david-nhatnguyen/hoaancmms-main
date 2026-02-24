-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'LOCKED');

-- CreateEnum
CREATE TYPE "FactoryStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EquipmentPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ChecklistCycle" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "ChecklistStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ChecklistExecutionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'FAILED');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "permission_modules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "permission_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT false,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canExport" BOOLEAN NOT NULL DEFAULT false,
    "canApprove" BOOLEAN NOT NULL DEFAULT false,
    "canLock" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "forcePasswordChange" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "roleId" TEXT,
    "factoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factories" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "status" "FactoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipments" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "origin" TEXT,
    "brand" TEXT,
    "modelYear" INTEGER,
    "image" TEXT,
    "qrCode" TEXT,
    "dimension" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "factoryId" TEXT,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

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
    "equipmentId" TEXT NOT NULL,
    "department" TEXT,
    "cycle" "ChecklistCycle" NOT NULL DEFAULT 'MONTHLY',
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
CREATE INDEX "role_permissions_roleId_idx" ON "role_permissions"("roleId");

-- CreateIndex
CREATE INDEX "role_permissions_moduleId_idx" ON "role_permissions"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_moduleId_key" ON "role_permissions"("roleId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_roleId_idx" ON "users"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "factories_code_key" ON "factories"("code");

-- CreateIndex
CREATE INDEX "factories_status_idx" ON "factories"("status");

-- CreateIndex
CREATE INDEX "factories_code_idx" ON "factories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "equipments_code_key" ON "equipments"("code");

-- CreateIndex
CREATE INDEX "equipments_category_idx" ON "equipments"("category");

-- CreateIndex
CREATE INDEX "equipments_status_idx" ON "equipments"("status");

-- CreateIndex
CREATE INDEX "equipments_code_idx" ON "equipments"("code");

-- CreateIndex
CREATE INDEX "equipments_name_idx" ON "equipments"("name");

-- CreateIndex
CREATE INDEX "equipment_documents_equipmentId_idx" ON "equipment_documents"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_templates_code_key" ON "checklist_templates"("code");

-- CreateIndex
CREATE INDEX "checklist_templates_equipmentId_idx" ON "checklist_templates"("equipmentId");

-- CreateIndex
CREATE INDEX "checklist_templates_status_idx" ON "checklist_templates"("status");

-- CreateIndex
CREATE INDEX "checklist_templates_cycle_idx" ON "checklist_templates"("cycle");

-- CreateIndex
CREATE INDEX "checklist_templates_status_createdAt_idx" ON "checklist_templates"("status", "createdAt");

-- CreateIndex
CREATE INDEX "checklist_templates_equipmentId_status_idx" ON "checklist_templates"("equipmentId", "status");

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
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "permission_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "factories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_documents" ADD CONSTRAINT "equipment_documents_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
