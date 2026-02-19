import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        try {
            const adapter = new PrismaPg({ url: process.env.DATABASE_URL });
            super({ adapter });
        } catch {
            throw new Error("Postgre connection failed")
        }
    }
}