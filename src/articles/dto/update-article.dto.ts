import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateArticleDto {
  @ApiProperty({
    description: 'Article title',
    example: 'How to Build a REST API with NestJS - Updated',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Article description/summary',
    example: 'An updated comprehensive guide to building REST APIs using NestJS framework',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Article content body',
    example: 'In this updated comprehensive guide, we will explore...',
    required: false,
  })
  @IsOptional()
  @IsString()
  body?: string;
}