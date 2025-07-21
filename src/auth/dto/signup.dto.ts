import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'johndoe' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}