import { IQuery } from '@nestjs/cqrs';
import { PaginatedParams, PaginatedQueryBase } from '@libs/ddd/query.base';

export class FindUsersQuery extends PaginatedQueryBase implements IQuery {
  constructor(props: PaginatedParams<FindUsersQuery>) {
    super(props);
  }
}
