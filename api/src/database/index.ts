import { PrismaClient } from '@prisma/client';
import config from '../utils/config';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

/**
 * it checks in Node.js global for a prisma of exactly PrismaClientSingleton,
 *  and if not exist it will be undefined
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

/**
 * if prisma found in global it returns prisma of type PrismaClientSingleton.
 * or it will just create a new instance
 */
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (config.NODE_ENV === 'development') globalForPrisma.prisma = prisma;
