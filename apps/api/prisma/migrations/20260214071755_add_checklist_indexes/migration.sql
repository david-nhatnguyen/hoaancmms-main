-- CreateIndex
CREATE INDEX "checklist_templates_status_createdAt_idx" ON "checklist_templates"("status", "createdAt");

-- CreateIndex
CREATE INDEX "checklist_templates_equipmentId_status_idx" ON "checklist_templates"("equipmentId", "status");
