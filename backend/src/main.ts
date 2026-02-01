import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, LogLevel } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    logger.log('Starting application bootstrap...');
    logger.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    logger.log(`PORT: ${process.env.PORT || 'not set'}`);
    logger.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'set' : 'not set'}`);

    // Configure logger based on environment
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const logLevels: LogLevel[] = isDevelopment
      ? ['log', 'error', 'warn', 'debug', 'verbose']
      : ['log', 'error', 'warn'];

    logger.log('Creating NestJS application...');
    const app = await NestFactory.create(AppModule, {
      logger: logLevels,
    });
    logger.log('NestJS application created successfully');

    // Parse Cookie header so JWT can be read from auth_token cookie (fallback to Bearer header)
    app.use(cookieParser());
    // Enable global logging interceptor for all requests
    app.useGlobalInterceptors(new LoggingInterceptor());

    /**
     * Enable CORS.
     * Supports CORS_ORIGINS environment variable (comma-separated, supports wildcards like *.run.app)
     * Falls back to FRONTEND_URL if CORS_ORIGINS is not set.
     * In development, reflects the request origin (origin: true).
     */
    const isProduction = process.env.NODE_ENV === 'production';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendPort = process.env.PORT || '8080';
    const corsOrigins = process.env.CORS_ORIGINS;

    const matchesWildcard = (origin: string, pattern: string): boolean => {
      if (pattern === origin) return true;
      if (!pattern.includes('*')) return false;

      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(origin);
    };

    let allowedOrigins: string[] | boolean | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);

    if (isProduction) {
      if (corsOrigins) {
        // Parse CORS_ORIGINS (comma-separated, supports wildcards)
        const origins = corsOrigins.split(',').map((o) => o.trim()).filter(Boolean);
        logger.log(`CORS origins configured: ${origins.join(', ')}`);

        // Create a function that checks against both exact matches and wildcards
        allowedOrigins = (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
          if (!origin) {
            callback(null, false);
            return;
          }

          // Check exact matches first
          if (origins.includes(origin)) {
            logger.debug(`CORS: Origin ${origin} matched exactly`);
            callback(null, true);
            return;
          }

          // Check wildcard patterns
          const matches = origins.some((pattern) => matchesWildcard(origin, pattern));
          if (matches) {
            logger.debug(`CORS: Origin ${origin} matched wildcard pattern`);
          } else {
            logger.warn(`CORS: Origin ${origin} not allowed. Allowed patterns: ${origins.join(', ')}`);
          }
          callback(null, matches);
        };
      } else {
        // Fallback to FRONTEND_URL if CORS_ORIGINS is not set
        logger.log(`CORS: Using FRONTEND_URL fallback: ${frontendUrl}`);
        allowedOrigins = [frontendUrl, `http://localhost:${backendPort}`];
      }
    } else {
      // In development, reflect request origin
      logger.log('CORS: Development mode - reflecting request origin');
      allowedOrigins = true;
    }

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });

    /**
     * Global validation pipe.
     * whitelist: true - Only allow properties that are defined in the DTO.
     * forbidNonWhitelisted: true - Throw an error if a property that is not defined in the DTO is provided.
     * transform: true - Transform the incoming data to the DTO type.
     */
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const port = process.env.PORT || 8080;
    const host = process.env.HOST || '0.0.0.0';

    logger.log(`Starting server on ${host}:${port}...`);
    await app.listen(port, host);

    logger.log(`Application is running on: http://${host}:${port}/graphql`);
    logger.log(`Health check available at: http://${host}:${port}/health`);
    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`Log levels: ${logLevels.join(', ')}`);
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();


