import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;
}