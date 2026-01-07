import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
      console.warn('PrismaService: DATABASE_URL is not set or empty');
      console.warn('PrismaService: Application will start, but database operations will fail');
      return;
    }

    console.log('PrismaService: Attempting database connection...');
    this.$connect()
      .then(() => {
        console.log('PrismaService: Database connection established');
      })
      .catch((error) => {
        console.warn('PrismaService: Failed to connect to database on startup:', error.message);
        console.warn('PrismaService: Application will start, but database operations may fail until connection is established');
      });
  }

  async onModuleDestroy() {
    await this.$disconnect().catch((error) => {
      console.error('Error disconnecting from database:', error);
      throw error;
    });
  }
}

