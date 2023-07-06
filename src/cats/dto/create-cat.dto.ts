import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  path: string;
}
