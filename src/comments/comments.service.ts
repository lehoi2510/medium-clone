import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateCommentResponseDto, CommentsResponseDto, DeleteCommentResponseDto } from './dto/comment-response.dto';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../common/constants/messages.constant';
import { AUTHOR_SELECT_FIELDS } from '../common/constants/database-selectors.constant';
import { Article, Comment } from '@prisma/client';

interface CommentWithAuthor extends Comment {
  author: {
    id: number;
    username: string;
    bio: string | null;
    image: string | null;
  };
}

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(private prisma: PrismaService) {}

  private async findArticleBySlug(articleSlug: string): Promise<Article> {
    const article = await this.prisma.article.findUnique({ where: { slug: articleSlug } });
    if (!article) {
      throw new NotFoundException(ERROR_MESSAGES.ARTICLE_NOT_FOUND);
    }
    return article;
  }

  private async findCommentWithAuthor(commentId: number): Promise<CommentWithAuthor> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: { select: AUTHOR_SELECT_FIELDS } },
    });
    if (!comment) {
      throw new NotFoundException(ERROR_MESSAGES.COMMENT_NOT_FOUND);
    }
    return comment as CommentWithAuthor;
  }

  private validateCommentOwnership(comment: CommentWithAuthor, userId: number, articleId: number): void {
    if (comment.authorId !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.COMMENT_FORBIDDEN_DELETE);
    }
    if (comment.articleId !== articleId) {
      throw new NotFoundException(ERROR_MESSAGES.COMMENT_NOT_FOUND);
    }
  }

  async create(articleSlug: string, createCommentData: CreateCommentDto, userId: number): Promise<CreateCommentResponseDto> {
    const article = await this.findArticleBySlug(articleSlug);
    
    const comment = await this.prisma.comment.create({
      data: {
        body: createCommentData.body,
        authorId: userId,
        articleId: article.id,
      },
      include: {
        author: {
          select: AUTHOR_SELECT_FIELDS,
        },
      },
    });
    
    this.logger.log(`Comment created successfully on article ${articleSlug} by user ${userId}`);
    return { comment };
  }

  async findAll(articleSlug: string): Promise<CommentsResponseDto> {
    const article = await this.findArticleBySlug(articleSlug);
    
    const comments = await this.prisma.comment.findMany({
      where: { articleId: article.id },
      include: {
        author: {
          select: AUTHOR_SELECT_FIELDS,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    this.logger.log(`Retrieved ${comments.length} comments for article ${articleSlug}`);
    return { comments };
  }

  async remove(articleSlug: string, commentId: number, userId: number): Promise<DeleteCommentResponseDto> {
    const article = await this.findArticleBySlug(articleSlug);
    const comment = await this.findCommentWithAuthor(commentId);
    
    this.validateCommentOwnership(comment, userId, article.id);
    
    await this.prisma.comment.delete({ where: { id: commentId } });
    
    this.logger.log(`Comment ${commentId} deleted successfully from article ${articleSlug} by user ${userId}`);
    return { message: SUCCESS_MESSAGES.COMMENT_DELETED };
  }
}