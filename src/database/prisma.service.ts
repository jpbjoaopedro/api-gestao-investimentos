import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    try {
      const connectionString = `${process.env.DATABASE_URL}`;
      const adapter = new PrismaPg({ connectionString });
      super({ adapter });
    } catch {
      throw new Error('Postgre connection failed');
    }
  }
}
