import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FactoriesService } from './factories.service';
import { CreateFactoryDto } from './dto/create-factory.dto';
import { UpdateFactoryDto } from './dto/update-factory.dto';
import { FactoryQueryDto } from './dto/factory-query.dto';
import { FactoryResponseDto } from './dto/factory-response.dto';
import { BulkDeleteFactoriesDto } from './dto/bulk-delete-factories.dto';
import { Public } from '@common/decorators/public.decorator';

/**
 * Factories Controller
 *
 * Endpoints:
 * - GET    /api/factories          - List all factories (with pagination)
 * - GET    /api/factories/stats    - Get dashboard stats
 * - GET    /api/factories/:id      - Get single factory
 * - POST   /api/factories          - Create new factory
 * - PATCH  /api/factories/:id      - Update factory
 * - DELETE /api/factories/:id      - Delete factory
 *
 * Why @Public()?
 * - For now, all endpoints are public for development
 * - Later, add @Roles() decorator for authorization
 *
 * Example with auth:
 * @Roles(UserRole.ADMIN, UserRole.MANAGER)
 * @Post()
 * async create(@Body() dto: CreateFactoryDto) { ... }
 */
@ApiTags('factories')
@Controller('factories')
@Public() // Remove this when implementing authentication
export class FactoriesController {
  constructor(private readonly factoriesService: FactoriesService) {}

  /**
   * GET /api/factories/stats
   *
   * Get dashboard statistics
   * Must be BEFORE /:id route to avoid conflict
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get factory statistics',
    description: 'Returns total factories, active factories, and total equipment count',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        totalFactories: 3,
        activeFactories: 2,
        totalEquipment: 25,
      },
    },
  })
  async getStats() {
    return this.factoriesService.getStats();
  }

  /**
   * GET /api/factories
   *
   * List all factories with pagination and filters
   */
  @Get()
  @ApiOperation({
    summary: 'Get all factories',
    description: 'Returns paginated list of factories with equipment count',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE'] })
  @ApiQuery({ name: 'search', required: false, example: 'Nhà máy A' })
  @ApiResponse({
    status: 200,
    description: 'Factories retrieved successfully',
    type: [FactoryResponseDto],
  })
  async findAll(@Query() query: FactoryQueryDto) {
    return this.factoriesService.findAll(query);
  }

  /**
   * GET /api/factories/:id
   *
   * Get single factory by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get factory by ID',
    description: 'Returns a single factory with equipment count',
  })
  @ApiParam({
    name: 'id',
    description: 'Factory UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Factory found',
    type: FactoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Factory not found',
  })
  async findOne(@Param('id') id: string) {
    return this.factoriesService.findOne(id);
  }

  /**
   * POST /api/factories
   *
   * Create new factory
   */
  @Post()
  @ApiOperation({
    summary: 'Create new factory',
    description: 'Creates a new factory with unique code',
  })
  @ApiResponse({
    status: 201,
    description: 'Factory created successfully',
    type: FactoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Factory code already exists',
  })
  async create(@Body() createFactoryDto: CreateFactoryDto) {
    return this.factoriesService.create(createFactoryDto);
  }

  /**
   * PATCH /api/factories/:id
   *
   * Update factory (partial update)
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update factory',
    description: 'Updates factory fields (partial update supported)',
  })
  @ApiParam({
    name: 'id',
    description: 'Factory UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Factory updated successfully',
    type: FactoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Factory not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Factory code already exists',
  })
  async update(@Param('id') id: string, @Body() updateFactoryDto: UpdateFactoryDto) {
    return this.factoriesService.update(id, updateFactoryDto);
  }

  /**
   * DELETE /api/factories/:id
   *
   * Delete factory
   * Note: Will fail if factory has equipments
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete factory',
    description: 'Deletes a factory (fails if factory has equipments)',
  })
  @ApiParam({
    name: 'id',
    description: 'Factory UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Factory deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Factory not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Factory has equipments, cannot delete',
  })
  async remove(@Param('id') id: string) {
    return this.factoriesService.remove(id);
  }

  /**
   * POST /api/factories/bulk-delete
   *
   * Delete multiple factories
   */
  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete multiple factories',
    description: 'Deletes several factories at once (skips the ones with equipment)',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk delete report returned',
  })
  async bulkDelete(@Body() dto: BulkDeleteFactoriesDto) {
    return this.factoriesService.removeMany(dto.ids);
  }
}
