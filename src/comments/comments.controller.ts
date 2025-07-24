import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth,
  ApiParam 
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { 
  CommentsResponseDto, 
  CreateCommentResponseDto, 
  DeleteCommentResponseDto 
} from './dto/comment-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { 
  CommonApiResponses, 
  AuthRequiredResponses,
  CommentApiResponses,
  CommentOwnerResponses,
  ArticleApiResponses
} from '../common/decorators/api-responses.decorator';

@ApiTags('comments')
@Controller('api/articles/:slug/comments')
export class CommentsController {
  private readonly logger = new Logger(CommentsController.name);

  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create a comment on an article' })
  @ApiParam({ name: 'slug', description: 'Article slug' })
  @CommentApiResponses.Created(CreateCommentResponseDto)
  @ArticleApiResponses.ArticleNotFound()
  @AuthRequiredResponses()
  async create(
    @Param('slug') articleSlug: string,
    @Body() createCommentData: CreateCommentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CreateCommentResponseDto> {
    this.logger.log(`Creating comment on article ${articleSlug} by user ${req.user.id}`);
    return await this.commentsService.create(articleSlug, createCommentData, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments for an article' })
  @ApiParam({ name: 'slug', description: 'Article slug' })
  @CommentApiResponses.Success(CommentsResponseDto)
  @ArticleApiResponses.ArticleNotFound()
  async findAll(@Param('slug') articleSlug: string): Promise<CommentsResponseDto> {
    this.logger.log(`Getting all comments for article ${articleSlug}`);
    return await this.commentsService.findAll(articleSlug);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'slug', description: 'Article slug' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @CommentApiResponses.Success(DeleteCommentResponseDto)
  @CommentOwnerResponses()
  async remove(
    @Param('slug') articleSlug: string,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<DeleteCommentResponseDto> {
    this.logger.log(`Deleting comment ${commentId} from article ${articleSlug} by user ${req.user.id}`);
    return await this.commentsService.remove(articleSlug, commentId, req.user.id);
  }
}
