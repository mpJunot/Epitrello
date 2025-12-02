import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect().catch((error) => {
      console.error('Error connecting to database:', error);
      throw error;
    });
  }

  async onModuleDestroy() {
    await this.$disconnect().catch((error) => {
      console.error('Error disconnecting from database:', error);
      throw error;
    });
  }
}

