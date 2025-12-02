import { SetMetadata } from '@nestjs/common';

/**
 * Public Route Decorator
 * Marks a resolver method as public (bypasses authentication).
 *
 * Usage:
 * @Public()
 * @Query(() => String)
 * async publicQuery() {
 *   return 'This is public';
 * }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

