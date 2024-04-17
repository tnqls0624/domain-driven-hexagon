import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { routesV1 } from '@config/app.routes';
import { CommandBus } from '@nestjs/cqrs';
import { match, Result } from 'oxide.ts';
import { NotFoundException } from '@libs/exceptions';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import { UpdateUserAddressRequestDto } from '@modules/user/dtos/update-user-address.request.dto';
import { UpdateUserAddressCommand } from '@modules/user/commands/update-address-user/update-user-address.command';
import { UserNotFoundError } from '@modules/user/domain/user.errors';

@Controller(routesV1.version)
export class UpdateUserAddressHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Update a user address' })
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
  @Put(routesV1.user.updateAddress)
  async updateAddressUser(
    @Param('id') id: string,
    @Body() body: UpdateUserAddressRequestDto,
  ): Promise<void> {
    const command = new UpdateUserAddressCommand({ id, ...body });
    const result: Result<boolean, NotFoundException> =
      await this.commandBus.execute(command);
    match(result, {
      Ok: (isOk: boolean) => isOk,
      Err: (error: Error) => {
        if (error instanceof UserNotFoundError)
          throw new BadRequestException(error.message);
        throw error;
      },
    });
  }
}
