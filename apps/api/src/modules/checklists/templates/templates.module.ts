import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { PrismaModule } from '../../../database/prisma.module';
import { QueueModule } from '../../queue/queue.module';
import { QUEUE_NAMES } from '@/common/constants';
import { ChecklistImportProcessor } from './checklist-import.processor';

@Module({
  imports: [
    PrismaModule,
    QueueModule,
    BullModule.registerQueue({
      name: QUEUE_NAMES.CHECKLIST_IMPORT,
    }),
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService, ChecklistImportProcessor],
  exports: [TemplatesService],
})
export class TemplatesModule {}
