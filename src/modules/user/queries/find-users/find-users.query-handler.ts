import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Ok, Result } from 'oxide.ts';
import { Paginated } from '@src/libs/ddd';
import { PRISMA_CLIENT } from '@libs/db/prisma.di-tokens';
import { Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FindUsersQuery } from '@modules/user/queries/find-users/find-users.query';
import { UserModel } from '@modules/user/database/user.repository';

@QueryHandler(FindUsersQuery)
export class FindUsersQueryHandler implements IQueryHandler {
  constructor(@Inject(PRISMA_CLIENT) private prisma: PrismaClient) {}

  /**
   * In read model we don't need to execute
   * any business logic, so we can bypass
   * domain and repository layers completely
   * and execute query directly
   */
  async execute(
    query: FindUsersQuery,
  ): Promise<Result<Paginated<UserModel>, Error>> {
    const { limit, orderBy, page } = query;
    const [records, rowCount] = await Promise.all([
      this.prisma.user.findMany({
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
          removedAt: null,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderBy.field ? { id: orderBy.param } : {},
      }),
      this.prisma.user.count({
        where: {
          removedAt: null,
        },
      }),
    ]);
    return Ok(
      new Paginated({
        data: records,
        count: rowCount,
        limit: query.limit,
        page: query.page,
      }),
    );
  }
}
