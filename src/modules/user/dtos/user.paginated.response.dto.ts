import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@src/libs/api/paginated.response.base';
import { UserResponseDto } from './user.response.dto';
import { Paginated } from '@libs/ddd';

export class UserPaginatedResponseDto extends PaginatedResponseDto<UserResponseDto> {
  constructor(props: Paginated<UserResponseDto>) {
    super(props);
    this.data = props.data;
  }
  @ApiProperty({ type: UserResponseDto, isArray: true })
  readonly data: readonly UserResponseDto[];
}
