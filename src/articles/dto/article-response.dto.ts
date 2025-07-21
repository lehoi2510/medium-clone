import { ApiProperty } from '@nestjs/swagger';

export class ArticleAuthor {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'Software developer', nullable: true })
  bio: string | null;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  image: string | null;
}

export class ArticleResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'How to Use TypeScript with NestJS' })
  title: string;

  @ApiProperty({ example: 'how-to-use-typescript-with-nestjs' })
  slug: string;

  @ApiProperty({ example: 'A comprehensive guide to using TypeScript with NestJS framework' })
  description: string;

  @ApiProperty({ example: 'In this article, we will explore...' })
  body: string;

  @ApiProperty({ example: 1 })
  authorId: number;

  @ApiProperty({ type: ArticleAuthor })
  author: ArticleAuthor;

  @ApiProperty({ example: '2025-07-22T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-07-22T10:30:00.000Z' })
  updatedAt: Date;
}

export class PaginationMeta {
  @ApiProperty({ example: 25, description: 'Total number of articles' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ example: 3, description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ example: true, description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({ example: false, description: 'Whether there is a previous page' })
  hasPrevPage: boolean;
}

export class PaginatedArticlesResponseDto {
  @ApiProperty({ 
    type: [ArticleResponseDto],
    description: 'Array of articles (empty if no articles found)'
  })
  data: ArticleResponseDto[];

  @ApiProperty({ type: PaginationMeta })
  meta: PaginationMeta;

  @ApiProperty({ 
    example: 'Articles retrieved successfully',
    description: 'Response message',
    required: false
  })
  message?: string;
}
