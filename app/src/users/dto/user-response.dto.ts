import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Unique identifier for the user',
  })
  id: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'Username of the user',
  })
  username: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address of the user',
  })
  email: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date when the user was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-20T15:45:00.000Z',
    description: 'Date when the user was last updated',
  })
  updatedAt: Date;
}