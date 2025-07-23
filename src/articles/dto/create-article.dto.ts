import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({
    description: 'Article title',
    example: 'How to Build a REST API with NestJS',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Article description/summary',
    example: 'A comprehensive guide to building REST APIs using NestJS framework',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Article content body',
    example: 'In this comprehensive guide, we will explore how to build a REST API...',
  })
  @IsNotEmpty()
  @IsString()
  body: string;
}