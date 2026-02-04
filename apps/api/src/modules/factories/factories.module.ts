import { Module } from '@nestjs/common';
import { FactoriesService } from './factories.service';
import { FactoriesController } from './factories.controller';
import { PrismaModule } from '@/database/prisma.module';

/**
 * Factories Module
 * 
 * Responsibilities:
 * - Factory CRUD operations
 * - Factory statistics
 * - Equipment count computation
 * 
 * Dependencies:
 * - PrismaModule for database access
 * 
 * Exports:
 * - FactoriesService (for use in other modules if needed)
 */
@Module({
    imports: [PrismaModule],
    controllers: [FactoriesController],
    providers: [FactoriesService],
    exports: [FactoriesService], // Export for potential use in EquipmentsModule
})
export class FactoriesModule { }
