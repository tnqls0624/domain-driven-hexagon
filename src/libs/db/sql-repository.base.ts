import { RequestContextService } from '@libs/application/context/AppRequestContext';
import { AggregateRoot, Mapper, RepositoryPort } from '@libs/ddd';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ZodObject } from 'zod';
import { LoggerPort } from '../ports/logger.port';
import { ObjectLiteral } from '../types';
import { PrismaClient } from '@prisma/client';

export abstract class SqlRepositoryBase<
  Aggregate extends AggregateRoot<any>,
  DbModel extends ObjectLiteral,
> implements RepositoryPort
{
  protected abstract tableName: string;

  protected abstract schema: ZodObject<any>;

  protected constructor(
    protected readonly prisma: PrismaClient,
    protected readonly mapper: Mapper<Aggregate, DbModel>,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly logger: LoggerPort,
  ) {}

  /**
   * start a global transaction to save
   * results of all event handlers in one operation
   */
  public async transaction<T>(handler: () => Promise<T>): Promise<T> {
    try {
      return await this.prisma.$transaction(async (tx: any) => {
        this.logger.debug(
          `[${RequestContextService.getRequestId()}] transaction started`,
        );
        if (!RequestContextService.getTransactionConnection()) {
          RequestContextService.setTransactionConnection(tx);
        }
        const result = await handler();
        this.logger.debug(
          `[${RequestContextService.getRequestId()}] transaction committed`,
        );
        return result;
      });
    } catch (e) {
      this.logger.debug(
        `[${RequestContextService.getRequestId()}] transaction aborted`,
      );
      throw e;
    } finally {
      RequestContextService.cleanTransactionConnection();
    }
  }
}
