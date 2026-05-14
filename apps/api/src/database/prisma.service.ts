import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    console.log('✓ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Cleanup method for tests
  async cleanDatabase() {
    const models = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    for (const model of models) {
      const value = (this as Record<string, unknown>)[model];
      if (typeof (value as { deleteMany?: () => Promise<unknown> })?.deleteMany === 'function') {
        await (value as { deleteMany: () => Promise<unknown> }).deleteMany();
      }
    }
  }
}
