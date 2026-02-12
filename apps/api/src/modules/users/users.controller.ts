import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Public() // Skip authentication for now as requested
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search users for autocomplete' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully.' })
  search(@Query('q') query: string) {
    return this.usersService.search(query);
  }
}
