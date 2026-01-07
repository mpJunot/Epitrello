import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, LogLevel } from '@nestjs/common';
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

    // Enable global logging interceptor for all requests
    app.useGlobalInterceptors(new LoggingInterceptor());

    /**
     * Enable CORS.
     * origin: process.env.FRONTEND_URL || 'http://localhost:3000' - The origin of the request.
     * credentials: true - Allow credentials.
     */
    // Enable CORS. In development reflect the request origin (origin: true)
    // so the Access-Control-Allow-Origin header is set dynamically. In
    // production, restrict to configured frontends.
    const isProduction = process.env.NODE_ENV === 'production';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendPort = process.env.PORT || '8080';

    const allowedOrigins = isProduction
      ? [frontendUrl, `http://localhost:${backendPort}`]
      : true; // reflect request origin in dev

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


