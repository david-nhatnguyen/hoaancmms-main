import { SetMetadata } from '@nestjs/common';

/**
 * @Public Decorator
 * 
 * Why we need this?
 * - By default, all routes will require authentication (via global guard)
 * - Some routes like login, register should be public
 * - This decorator marks routes as public
 * 
 * Usage:
 * @Public()
 * @Post('login')
 * async login(@Body() dto: LoginDto) {
 *   return this.authService.login(dto);
 * }
 * 
 * How it works:
 * - Sets metadata 'isPublic' = true
 * - JwtAuthGuard checks this metadata
 * - If true, skip authentication
 * 
 * Bad Practice:
 * if (req.path === '/login' || req.path === '/register') {
 *   // Skip auth
 * }
 * // Hard to maintain, error-prone
 * 
 * Best Practice:
 * Use decorator + metadata
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
