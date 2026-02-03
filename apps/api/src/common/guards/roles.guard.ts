import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../../prisma/generated/prisma';

/**
 * Roles Guard
 * 
 * Why we need this?
 * - Enforce role-based access control (RBAC)
 * - Different users have different permissions
 * - ADMIN > MANAGER > TECHNICIAN
 * 
 * How it works:
 * 1. Check if route has @Roles() decorator
 * 2. If no roles required, allow access
 * 3. Get user from request (attached by JwtAuthGuard)
 * 4. Check if user's role is in required roles
 * 5. If yes, allow access. If no, throw ForbiddenException
 * 
 * Why run AFTER JwtAuthGuard?
 * - Need user info from JWT first
 * - Guards run in order they're registered
 * 
 * Example flow:
 * Request → JwtAuthGuard (authenticate) → RolesGuard (authorize) → Controller
 * 
 * Bad Practice:
 * if (user.role !== 'ADMIN') {
 *   throw new Error('Not admin');
 * }
 * // Scattered throughout controllers
 * 
 * Best Practice:
 * @Roles(UserRole.ADMIN)
 * // Centralized, reusable, declarative
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Get required roles from @Roles() decorator
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        // If no roles required, allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // Get user from request (set by JwtAuthGuard)
        const { user } = context.switchToHttp().getRequest();

        // If no user (shouldn't happen if JwtAuthGuard ran first)
        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Check if user's role is in required roles
        const hasRole = requiredRoles.includes(user.role);

        if (!hasRole) {
            throw new ForbiddenException(
                `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
            );
        }

        return true;
    }
}
