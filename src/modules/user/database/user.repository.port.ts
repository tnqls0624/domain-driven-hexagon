import { PaginatedQueryParams, RepositoryPort } from '@libs/ddd';
import { UserEntity } from '../domain/user.entity';
import { Prisma } from '@prisma/client';

export interface FindUsersParams extends PaginatedQueryParams {
  readonly country?: string;
  readonly postalCode?: string;
  readonly street?: string;
}

export interface UserRepositoryPort extends RepositoryPort {
  insert(entity: UserEntity): Promise<Prisma.BatchPayload | undefined>;
}
