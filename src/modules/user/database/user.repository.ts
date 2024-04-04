import { UserRepositoryPort } from './user.repository.port';
import { z } from 'zod';
import { UserMapper } from '../user.mapper';
import { UserRoles } from '../domain/user.types';
import { UserEntity } from '../domain/user.entity';
import { SqlRepositoryBase } from '@src/libs/db/sql-repository.base';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, PrismaClient } from '@prisma/client';
import { RequestContextService } from '@libs/application/context/AppRequestContext';
import { PRISMA_CLIENT } from '@libs/db/prisma.di-tokens';

/**
 * Runtime validation of user object for extra safety (in case database schema changes).
 * https://github.com/gajus/slonik#runtime-validation
 * If you prefer to avoid performance penalty of validation, use interfaces instead.
 */
export const userSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.preprocess((val: any) => new Date(val), z.date()),
  updatedAt: z.preprocess((val: any) => new Date(val), z.date()),
  email: z.string().email(),
  country: z.string().min(1).max(255),
  postalCode: z.string().min(1).max(20),
  street: z.string().min(1).max(255),
  role: z.nativeEnum(UserRoles),
});

export type UserModel = z.TypeOf<typeof userSchema>;

/**
 *  Repository is used for retrieving/saving domain entities
 * */
@Injectable()
export class UserRepository
  extends SqlRepositoryBase<UserEntity, UserModel>
  implements UserRepositoryPort
{
  protected tableName = 'users';

  protected schema = userSchema;

  constructor(
    @Inject(PRISMA_CLIENT)
    prisma: PrismaClient,
    mapper: UserMapper,
    eventEmitter: EventEmitter2,
  ) {
    super(prisma, mapper, eventEmitter, new Logger(UserRepository.name));
  }

  // async insert(entity: UserEntity): Promise<UserEntity | null> {
  async insert(entity: UserEntity): Promise<Prisma.BatchPayload | undefined> {
    try {
      const tx = RequestContextService.getTransactionConnection();
      const entities = Array.isArray(entity) ? entity : [entity];
      const records = entities.map(this.mapper.toPersistence);

      const users = await tx?.user.createMany({
        data: records,
      });
      return users;
    } catch (error) {
      throw error;
    }
  }
}
