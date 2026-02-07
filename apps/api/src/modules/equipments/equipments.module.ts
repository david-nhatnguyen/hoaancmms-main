import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EquipmentsService } from './equipments.service';
import { EquipmentsController } from './equipments.controller';
import { QueueModule } from '../queue/queue.module';
import { QUEUE_NAMES } from '@/common/constants';
import { EquipmentImportProcessor } from './equipment-import.processor';

@Module({
  imports: [
    QueueModule,
    BullModule.registerQueue({
      name: QUEUE_NAMES.EXCEL_IMPORT,
    }),
  ],
  controllers: [EquipmentsController],
  providers: [EquipmentsService, EquipmentImportProcessor],
  exports: [EquipmentsService],
})
export class EquipmentsModule {}
