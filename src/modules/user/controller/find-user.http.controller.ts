import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { routesV1 } from '@config/app.routes';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Result } from 'oxide.ts';
import { UserPaginatedResponseDto } from '../dtos/user.paginated.response.dto';
import { UserModel } from '../database/user.repository';
import { FindUserQuery } from '@modules/user/queries/find-user/find-user.query';
import { UserResponseDto } from '@modules/user/dtos/user.response.dto';
import { ResponseBase } from '@libs/api/response.base';

@Controller(routesV1.version)
export class FindUserHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(routesV1.user.find)
  @ApiOperation({ summary: 'Find user' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserPaginatedResponseDto,
  })
  @ApiParam({
    description: 'User primary Id',
    example: 'asndas-fdsds-dwq-dsadsa',
    type: 'string',
    name: 'id',
  })
  async findUser(@Param('id') id: string): Promise<UserResponseDto> {
    const query = new FindUserQuery(id);
    const result: Result<UserModel, Error> = await this.queryBus.execute(query);
    const user = result.unwrap();
    // Whitelisting returned properties
    return {
      ...new ResponseBase(user),
      email: user.email,
      country: user.country,
      street: user.street,
      postalCode: user.postalCode,
    };
  }
}
