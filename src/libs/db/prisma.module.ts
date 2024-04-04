import { Global, Module } from '@nestjs/common';
import prisma from '@libs/db/prisma.client';
import { PRISMA_CLIENT } from '@libs/db/prisma.di-tokens';

@Global()
@Module({
  providers: [
    {
      provide: PRISMA_CLIENT,
      useValue: prisma,
    },
  ],
  exports: [PRISMA_CLIENT],
})
export class PrismaModule {}
