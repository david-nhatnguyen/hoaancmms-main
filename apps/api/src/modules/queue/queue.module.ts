import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from '../../common/constants';

/**
 * Queue Module - BullMQ Setup
 *
 * Why BullMQ instead of synchronous processing?
 * - Non-blocking operations (critical requirement!)
 * - File uploads don't block API responses
 * - Excel import/export can take minutes
 * - QR code generation can be batched
 * - Better scalability (can add more workers)
 *
 * How it works:
 * 1. Producer (API) adds job to queue
 * 2. Redis stores the job
 * 3. Consumer (Worker) processes job in background
 * 4. Results can be retrieved later
 *
 * Example flow:
 * POST /api/equipments/import
 * → Add job to EXCEL_IMPORT queue
 * → Return immediately with job ID
 * → Worker processes Excel file
 * → Frontend polls for status
 *
 * Bad Practice (Synchronous):
 * @Post('import')
 * async import(@UploadedFile() file) {
 *   const data = await parseExcel(file); // Blocks for minutes!
 *   await this.save(data);
 *   return { success: true };
 * }
 * // User waits for minutes, request might timeout
 *
 * Best Practice (Async with Queue):
 * @Post('import')
 * async import(@UploadedFile() file) {
 *   const job = await this.queue.add('import', { file });
 *   return { jobId: job.id }; // Returns immediately!
 * }
 * // User gets job ID, can check progress
 */
@Module({
  imports: [
    // Register BullMQ with Redis connection
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);

        return {
          connection: {
            host,
            port,
            // Optional: add more redis options if needed
            // password: configService.get<string>('REDIS_PASSWORD'),
            // db: configService.get<number>('REDIS_DB', 0),
          },
        };
      },
      inject: [ConfigService],
    }),

    // Register all queues
    BullModule.registerQueue(
      { name: QUEUE_NAMES.FILE_UPLOAD },
      { name: QUEUE_NAMES.EXCEL_IMPORT },
      { name: QUEUE_NAMES.EXCEL_EXPORT },
      { name: QUEUE_NAMES.QR_CODE_GENERATION },
      { name: QUEUE_NAMES.EMAIL_NOTIFICATION },
    ),
  ],
  exports: [BullModule], // Export so other modules can inject queues
})
export class QueueModule {}
