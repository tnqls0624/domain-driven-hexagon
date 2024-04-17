import { Logger, Module, Provider } from '@nestjs/common';
import { UserRepository } from './database/user.repository';
import { CreateUserHttpController } from './controller/create-user.http.controller';
import { DeleteUserHttpController } from './controller/delete-user.http-controller';
import { CreateUserCliController } from './controller/create-user.cli.controller';
import { FindUsersHttpController } from './controller/find-users.http.controller';
import { CreateUserMessageController } from './controller/create-user.message.controller';
import { CreateUserService } from './commands/create-user/create-user.service';
import { DeleteUserService } from './commands/delete-user/delete-user.service';
import { FindUsersQueryHandler } from './queries/find-users/find-users.query-handler';
import { UserMapper } from './user.mapper';
import { CqrsModule } from '@nestjs/cqrs';
import { USER_REPOSITORY } from './user.di-tokens';
import { UpdateUserAddressHttpController } from '@modules/user/controller/update-user-address.http-controller';
import { UpdateUserAddressService } from '@modules/user/commands/update-address-user/update-user-address.service';
import { FindUserQueryHandler } from '@modules/user/queries/find-user/find-user.query-handler';
import { FindUserHttpController } from '@modules/user/controller/find-user.http.controller';

const httpControllers = [
  CreateUserHttpController,
  FindUsersHttpController,
  FindUserHttpController,
  UpdateUserAddressHttpController,
  DeleteUserHttpController,
];

const messageControllers = [CreateUserMessageController];

const cliControllers: Provider[] = [CreateUserCliController];

const commandHandlers: Provider[] = [
  CreateUserService,
  UpdateUserAddressService,
  DeleteUserService,
];

const queryHandlers: Provider[] = [FindUsersQueryHandler, FindUserQueryHandler];

const mappers: Provider[] = [UserMapper];

const repositories: Provider[] = [
  { provide: USER_REPOSITORY, useClass: UserRepository },
];

@Module({
  imports: [CqrsModule],
  controllers: [...httpControllers, ...messageControllers],
  providers: [
    Logger,
    ...cliControllers,
    ...repositories,
    ...commandHandlers,
    ...queryHandlers,
    ...mappers,
  ],
})
export class UserModule {}
