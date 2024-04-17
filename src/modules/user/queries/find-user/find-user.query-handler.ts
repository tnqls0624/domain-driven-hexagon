import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { PRISMA_CLIENT } from '@libs/db/prisma.di-tokens';
import { Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FindUserQuery } from '@modules/user/queries/find-user/find-user.query';
import { UserNotFoundError } from '@modules/user/domain/user.errors';
import { UserModel } from '@modules/user/database/user.repository';

@QueryHandler(FindUserQuery)
export class FindUserQueryHandler implements IQueryHandler {
  constructor(@Inject(PRISMA_CLIENT) private prisma: PrismaClient) {}

  /**
   * In read model we don't need to execute
   * any business logic, so we can bypass
   * domain and repository layers completely
   * and execute query directly
   */
  async execute(
    query: FindUserQuery,
  ): Promise<Result<UserModel, UserNotFoundError>> {
    const { id } = query;
    const found = await this.prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        country: true,
        postalCode: true,
        street: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        id,
      },
    });
    if (!found) return Err(new UserNotFoundError());
    return Ok(found);
  }
}
