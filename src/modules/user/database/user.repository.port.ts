import { PaginatedQueryParams, RepositoryPort } from '@libs/ddd';
import { UserEntity } from '../domain/user.entity';
import { Prisma } from '@prisma/client';
import { Option } from 'oxide.ts';

export interface FindUsersParams extends PaginatedQueryParams {
  readonly country?: string;
  readonly postalCode?: string;
  readonly street?: string;
}

export interface UserRepositoryPort extends RepositoryPort {
  insert(entity: UserEntity): Promise<Prisma.BatchPayload | undefined>;
  updateAddress(entity: UserEntity): Promise<boolean>;
  delete(entity: UserEntity): Promise<boolean>;
  findOneById(id: string): Promise<Option<UserEntity>>;
}
