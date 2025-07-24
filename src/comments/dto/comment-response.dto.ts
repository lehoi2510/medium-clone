import { ApiProperty } from '@nestjs/swagger';

class CommentAuthorDto {
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

export class CommentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'This is a great article!' })
  body: string;

  @ApiProperty({ example: 1 })
  authorId: number;

  @ApiProperty({ type: CommentAuthorDto })
  author: CommentAuthorDto;

  @ApiProperty({ example: 1 })
  articleId: number;

  @ApiProperty({ example: '2025-07-22T08:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-07-22T08:00:00.000Z' })
  updatedAt: Date;
}

export class CommentsResponseDto {
  @ApiProperty({ type: [CommentResponseDto] })
  comments: CommentResponseDto[];
}

export class CreateCommentResponseDto {
  @ApiProperty({ type: CommentResponseDto })
  comment: CommentResponseDto;
}

export class DeleteCommentResponseDto {
  @ApiProperty({ example: 'Comment deleted successfully' })
  message: string;
}
