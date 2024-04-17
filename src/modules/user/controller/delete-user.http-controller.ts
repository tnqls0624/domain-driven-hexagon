import {
  BadRequestException,
  Controller,
  Delete,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { routesV1 } from '@config/app.routes';
import { CommandBus } from '@nestjs/cqrs';
import { match, Result } from 'oxide.ts';
import { NotFoundException } from '@libs/exceptions';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import { DeleteUserCommand } from '@modules/user/commands/delete-user/delete-user.command';

@Controller(routesV1.version)
export class DeleteUserHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    description: 'User deleted',
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: NotFoundException.message,
    type: ApiErrorResponse,
  })
  @ApiParam({
    description: 'User primary Id',
    example: 'asndas-fdsds-dwq-dsadsa',
    type: 'string',
    name: 'id',
  })
  @Delete(routesV1.user.delete)
  async deleteUser(@Param('id') id: string): Promise<void> {
    const command = new DeleteUserCommand({ id });
    const result: Result<boolean, NotFoundException> =
      await this.commandBus.execute(command);

    match(result, {
      Ok: (isOk: boolean) => isOk,
      Err: (error: Error) => {
        if (error instanceof NotFoundException)
          throw new BadRequestException(error.message);
        throw error;
      },
    });
  }
}
