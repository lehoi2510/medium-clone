import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}