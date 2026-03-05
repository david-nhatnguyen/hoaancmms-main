import { SetMetadata } from "@nestjs/common";

/**
 * @Roles Decorator
 *
 * Accepts role names/IDs to restrict endpoints.
 * Since RBAC is now relational (Role table), we use strings.
 *
 * Usage:
 * @Roles('admin')
 * @Delete(':id')
 * async deleteFactory(@Param('id') id: string) { ... }
 */
export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
