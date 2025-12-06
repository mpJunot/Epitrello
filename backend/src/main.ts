import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Enable CORS.
   * origin: process.env.FRONTEND_URL || 'http://localhost:3000' - The origin of the request.
   * credentials: true - Allow credentials.
   */
  // Enable CORS. In development reflect the request origin (origin: true)
  // so the Access-Control-Allow-Origin header is set dynamically. In
  // production, restrict to configured frontends.
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = isProduction
    ? [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://postgres:3000', 'http://localhost:4000']
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

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/graphql`);
}
bootstrap();

