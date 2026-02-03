import { SetMetadata } from '@nestjs/common';

/**
 * @Timeout Decorator
 * 
 * Why we need this?
 * - Different routes have different timeout requirements
 * - File uploads need longer timeout
 * - Simple queries can have shorter timeout
 * 
 * Usage:
 * @Timeout(60000) // 60 seconds for file upload
 * @Post('upload')
 * async uploadFile(@UploadedFile() file: Express.Multer.File) {
 *   return this.filesService.upload(file);
 * }
 * 
 * How it works:
 * - Sets metadata 'timeout' = milliseconds
 * - TimeoutInterceptor reads this metadata
 * - Overrides default timeout (30s)
 */
export const TIMEOUT_KEY = 'timeout';
export const Timeout = (ms: number) => SetMetadata(TIMEOUT_KEY, ms);
