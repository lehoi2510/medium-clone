import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ListArticlesDto {
  @ApiProperty({
    description: 'Number of articles to return (default: 20)',
    minimum: 1,
    default: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    description: 'Number of articles to skip (default: 0)',
    minimum: 0,
    default: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({
    description: 'Filter by tag',
    required: false,
  })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiProperty({
    description: 'Filter by author username',
    required: false,
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({
    description: 'Filter by articles favorited by username',
    required: false,
  })
  @IsOptional()
  @IsString()
  favorited?: string;
}
