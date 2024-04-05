import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Ok } from 'oxide.ts';
import { PaginatedParams, PaginatedQueryBase } from '@libs/ddd/query.base';
import { Paginated } from '@src/libs/ddd';
import { PRISMA_CLIENT } from '@libs/db/prisma.di-tokens';
import { Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export class FindUsersQuery extends PaginatedQueryBase {
  constructor(props: PaginatedParams<FindUsersQuery>) {
    super(props);
  }
}

@QueryHandler(FindUsersQuery)
export class FindUsersQueryHandler implements IQueryHandler {
  constructor(@Inject(PRISMA_CLIENT) private prisma: PrismaClient) {
  }

  /**
   * In read model we don't need to execute
   * any business logic, so we can bypass
   * domain and repository layers completely
   * and execute query directly
   */
  async execute(
    query: FindUsersQuery,
    // ): Promise<Result<Paginated<UserModel>, Error>> {
  ): Promise<any> {
    const { limit, orderBy, page } = query;
    const [records, rowCount] = await Promise.all([
        this.prisma.user.findMany({
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
      ],
    );
    return Ok(
      new Paginated({
        data: records,
        count: rowCount,
        limit: query.limit,
        page: query.page,
      }),
    );
    /**
     * Constructing a query with Slonik.
     * More info: https://contra.com/p/AqZWWoUB-writing-composable-sql-using-java-script
     */
    // const statement = sql.type(userSchema)`
    //      SELECT *
    //      FROM users
    //      WHERE
    //        ${query.country ? sql`country = ${query.country}` : true} AND
    //        ${query.street ? sql`street = ${query.street}` : true} AND
    //        ${query.postalCode ? sql`"postalCode" = ${query.postalCode}` : true}
    //      LIMIT ${query.limit}
    //      OFFSET ${query.offset}`;
    //
    // const records = await this.pool.query(statement);

    // return Ok(
    //   new Paginated({
    //     data: records.rows,
    //     count: records.rowCount,
    //     limit: query.limit,
    //     page: query.page,
    //   }),
    // );
  }
}
