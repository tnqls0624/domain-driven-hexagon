import { RequestContext } from 'nestjs-request-context';
import { PrismaClient } from '@prisma/client';
import * as runtime from '@prisma/client/runtime/library';

/**
 * Setting some isolated context for each request.
 */

export class AppRequestContext extends RequestContext {
  requestId: string;
  transactionConnection?: Omit<PrismaClient, runtime.ITXClientDenyList>; // For global transactions
}

export class RequestContextService {
  constructor() {}
  static getContext(): AppRequestContext {
    const ctx: AppRequestContext = RequestContext.currentContext.req;
    return ctx;
  }

  static setRequestId(id: string): void {
    const ctx = this.getContext();
    ctx.requestId = id;
  }

  static getRequestId(): string {
    return this.getContext().requestId;
  }

  static getTransactionConnection():
    | Omit<PrismaClient, runtime.ITXClientDenyList>
    | undefined {
    const ctx = this.getContext();
    return ctx.transactionConnection;
  }

  static setTransactionConnection(
    transactionConnection?: Omit<PrismaClient, runtime.ITXClientDenyList>,
  ): void {
    const ctx = this.getContext();
    ctx.transactionConnection = transactionConnection;
  }

  static cleanTransactionConnection(): void {
    const ctx = this.getContext();
    ctx.transactionConnection = undefined;
  }
}
