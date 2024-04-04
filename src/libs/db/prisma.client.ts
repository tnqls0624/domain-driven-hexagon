import { PrismaClient } from '@prisma/client';
import { readReplicas } from '@prisma/extension-read-replicas';

const prisma = new PrismaClient().$extends(
  readReplicas({
    url: process.env.READ_DATABASE_URL as string,
  }),
) as unknown as PrismaClient;

// {
//   log: [
//     { emit: 'event', level: 'query' }
//     // 필요한 경우 다른 로그 레벨 추가
//   ];
// }

// prisma.$on('query', (e: Prisma.QueryEvent) => {
//   console.log(`Query: ${e.query}`);
//   console.log(`Duration: ${e.duration}ms`);
// });

export default prisma;
