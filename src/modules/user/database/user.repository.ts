import { UserRepositoryPort } from './user.repository.port';
import { z } from 'zod';
import { UserMapper } from '../user.mapper';
import { UserEntity } from '../domain/user.entity';
import { SqlRepositoryBase } from '@src/libs/db/sql-repository.base';
import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, PrismaClient, UserRoles } from '@prisma/client';
import { RequestContextService } from '@libs/application/context/AppRequestContext';
import { PRISMA_CLIENT } from '@libs/db/prisma.di-tokens';
import { None, Option, Some } from 'oxide.ts';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NotFoundException } from '@libs/exceptions';

/**
 * Runtime validation of user object for extra safety (in case database schema changes).
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
    @Inject(PRISMA_CLIENT) prisma: PrismaClient,
    mapper: UserMapper,
    eventEmitter: EventEmitter2,
  ) {
    super(prisma, mapper, eventEmitter, new Logger(UserRepository.name));
  }

  async findOneById(id: string): Promise<Option<UserEntity>> {
    const result = await this.prisma.user.findFirst({
      where: {
        id,
      },
    });
    return result ? Some(this.mapper.toDomain(result)) : None;
  }

  // async findAll(): Promise<Aggregate[]> {
  //   const query = sql.type(this.schema)`SELECT *
  //                                       FROM ${sql.identifier([
  //                                           this.tableName,
  //                                       ])}`;
  //
  //   const result = await this.pool.query(query);
  //
  //   return result.rows.map(this.mapper.toDomain);
  // }
  //
  // async findAllPaginated(
  //   params: PaginatedQueryParams,
  // ): Promise<Paginated<Aggregate>> {
  //   const query = sql.type(this.schema)`
  //       SELECT *
  //       FROM ${sql.identifier([this.tableName])} LIMIT ${params.limit}
  //       OFFSET ${params.offset}
  //   `;
  //
  //   const result = await this.pool.query(query);
  //
  //   const entities = result.rows.map(this.mapper.toDomain);
  //   return new Paginated({
  //     data: entities,
  //     count: result.rowCount,
  //     limit: params.limit,
  //     page: params.page,
  //   });
  // }

  // async insert(entity: UserEntity): Promise<UserEntity | null> {
  async insert(entity: UserEntity): Promise<Prisma.BatchPayload | undefined> {
    try {
      this.logger.debug(
        `[${RequestContextService.getRequestId()}] creating entities ${
          entity.id
        } from ${this.tableName}`,
      );

      const tx = RequestContextService.getTransactionConnection();
      const entities = Array.isArray(entity) ? entity : [entity];
      const records = entities.map(this.mapper.toPersistence);
      return await tx?.user.createMany({
        data: records,
      });
    } catch (error: any) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.debug(
          `[${RequestContextService.getRequestId()}] ${error.message}`,
        );
        throw new ConflictException(
          'Record already exists',
          `${(error as any).meta.modelName} model, ${
            (error as any).meta.target
          } request error`,
        );
      }
      throw error;
    }
  }

  async delete(entity: UserEntity): Promise<boolean> {
    try {
      this.logger.debug(
        `[${RequestContextService.getRequestId()}] deleting entities ${
          entity.id
        } from ${this.tableName}`,
      );
      const record = this.mapper.toPersistence(entity);
      await this.prisma.user.update({
        where: {
          id: record.id,
        },
        data: {
          removedAt: new Date(),
        },
      });
      await entity.publishEvents(this.logger, this.eventEmitter);
      return true;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.debug(
          `[${RequestContextService.getRequestId()}] ${error.message}`,
        );
        throw new NotFoundException('Record not found');
      }
      throw error;
    }
  }

  async updateAddress(entity: UserEntity): Promise<boolean> {
    try {
      this.logger.debug(
        `[${RequestContextService.getRequestId()}] update Address entities ${
          entity.id
        } from ${this.tableName}`,
      );
      const record = this.mapper.toPersistence(entity);
      await this.prisma.user.update({
        where: {
          id: record.id,
        },
        data: record,
      });
      await entity.publishEvents(this.logger, this.eventEmitter);
      return true;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.debug(
          `[${RequestContextService.getRequestId()}] ${error.message}`,
        );
        throw new NotFoundException('Record not found');
      }
      throw error;
    }
  }
}
