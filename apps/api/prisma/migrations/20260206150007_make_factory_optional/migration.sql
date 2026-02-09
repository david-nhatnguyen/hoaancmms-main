-- DropForeignKey
ALTER TABLE "equipments" DROP CONSTRAINT "equipments_factoryId_fkey";

-- AlterTable
ALTER TABLE "equipments" ALTER COLUMN "factoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "factories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
