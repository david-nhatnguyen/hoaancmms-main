import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto, QueryTemplateDto } from './dto';

@ApiTags('Checklist Templates')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('checklist-templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new checklist template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 409, description: 'Template code already exists' })
  create(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templatesService.create(createTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all checklist templates with filtering' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  findAll(@Query() query: QueryTemplateDto) {
    return this.templatesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a checklist template by ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a checklist template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  update(@Param('id') id: string, @Body() updateTemplateDto: UpdateTemplateDto) {
    return this.templatesService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a checklist template' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete active template' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate a checklist template' })
  @ApiResponse({ status: 200, description: 'Template activated successfully' })
  @ApiResponse({ status: 400, description: 'Template already active' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  activate(@Param('id') id: string) {
    return this.templatesService.activate(id);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a checklist template' })
  @ApiResponse({ status: 200, description: 'Template deactivated successfully' })
  @ApiResponse({ status: 400, description: 'Template not active' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  deactivate(@Param('id') id: string) {
    return this.templatesService.deactivate(id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a checklist template' })
  @ApiResponse({ status: 201, description: 'Template duplicated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  duplicate(@Param('id') id: string) {
    return this.templatesService.duplicate(id);
  }
}
