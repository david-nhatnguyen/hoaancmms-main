import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../prisma/generated/prisma';

/**
 * @Roles Decorator
 *
 * Why we need this?
 * - Different routes require different permission levels
 * - ADMIN can do everything
 * - MANAGER can manage factories and equipment
 * - TECHNICIAN can only view and update maintenance
 *
 * Usage:
 * @Roles(UserRole.ADMIN)
 * @Delete(':id')
 * async deleteFactory(@Param('id') id: string) {
 *   return this.factoriesService.delete(id);
 * }
 *
 * @Roles(UserRole.ADMIN, UserRole.MANAGER)
 * @Post()
 * async createFactory(@Body() dto: CreateFactoryDto) {
 *   return this.factoriesService.create(dto);
 * }
 *
 * How it works:
 * - Sets metadata 'roles' = [UserRole.ADMIN, ...]
 * - RolesGuard checks user's role against required roles
 * - If user's role is in the list, allow access
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
