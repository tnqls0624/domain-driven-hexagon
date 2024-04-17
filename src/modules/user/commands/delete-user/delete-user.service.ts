import { UserRepositoryPort } from '@modules/user/database/user.repository.port';
import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { USER_REPOSITORY } from '../../user.di-tokens';
import { DeleteUserCommand } from '@modules/user/commands/delete-user/delete-user.command';
import { UserNotFoundError } from '@modules/user/domain/user.errors';

@CommandHandler(DeleteUserCommand)
export class DeleteUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(
    command: DeleteUserCommand,
  ): Promise<Result<boolean, UserNotFoundError>> {
    const found = await this.userRepo.findOneById(command.id);
    if (found.isNone()) return Err(new UserNotFoundError());
    const user = found.unwrap();
    user.delete();
    const result = await this.userRepo.delete(user);
    return Ok(result);
  }
}
