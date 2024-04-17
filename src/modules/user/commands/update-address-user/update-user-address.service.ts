import { UserRepositoryPort } from '@modules/user/database/user.repository.port';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { UpdateUserAddressCommand } from './update-user-address.command';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../../user.di-tokens';
import { UserNotFoundError } from '@modules/user/domain/user.errors';

@CommandHandler(UpdateUserAddressCommand)
export class UpdateUserAddressService implements ICommandHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    protected readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(
    command: UpdateUserAddressCommand,
  ): Promise<Result<boolean, UserNotFoundError>> {
    const { id, ...body } = command;
    const found = await this.userRepo.findOneById(id);
    if (found.isNone()) return Err(new UserNotFoundError());
    const user = found.unwrap();
    user.updateAddress(body);
    const result = await this.userRepo.updateAddress(user);
    return Ok(result);
  }
}
