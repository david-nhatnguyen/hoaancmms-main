import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT Authentication Guard
 *
 * Why we need this?
 * - Protect routes from unauthorized access
 * - Validate JWT tokens
 * - Extract user info from token
 *
 * How it works:
 * 1. Check if route is marked as @Public()
 * 2. If public, allow access
 * 3. If not public, check for JWT token
 * 4. Validate token
 * 5. Attach user to request
 *
 * Why use Reflector?
 * - Read metadata set by decorators
 * - Check if route has @Public() decorator
 *
 * Note: This is a placeholder implementation
 * Full JWT validation will be added when implementing AuthModule
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // TODO: Implement JWT validation
    // For now, we'll just check for Authorization header
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    // TODO: Validate token with JWT service
    // TODO: Attach user to request
    // request.user = decodedToken;

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
