import {
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
  Body,
  UseGuards,
  Req,
  Query,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ListArticlesDto } from './dto/pagination.dto';
import { PaginatedArticlesResponseDto, ArticleResponseDto } from './dto/article-response.dto';
import { PaginatedResult } from './interfaces/paginated-result.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { 
  CommonApiResponses, 
  ArticleApiResponses, 
  AuthRequiredResponses, 
  ArticleOwnerResponses 
} from '../common/decorators/api-responses.decorator';
import { ArticleWithAuthor } from './interfaces/article-service.interface';
import { ArticleResponse } from './interfaces/article-response.interface';

@ApiBearerAuth('jwt')
@Controller('api/articles')
export class ArticlesController {
  private readonly logger = new Logger(ArticlesController.name);
  
  constructor(private articlesService: ArticlesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new article' })
  @ArticleApiResponses.Created(ArticleResponseDto)
  @CommonApiResponses.BadRequest()
  @AuthRequiredResponses()
  async create(
    @Body() createArticleDto: CreateArticleDto, 
    @Req() request: AuthenticatedRequest
  ): Promise<ArticleWithAuthor> {
    try {
      this.logger.log(`Creating article for user ${request.user.id}: ${createArticleDto.title}`);
      return await this.articlesService.create(createArticleDto, request.user.id);
    } catch (error) {
      this.logger.error(`Error creating article: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated lists of articles' })
  @ArticleApiResponses.Success(PaginatedArticlesResponseDto)
  @CommonApiResponses.InternalServerError()
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of articles to return (default: 20)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of articles to skip (default: 0)' })
  @ApiQuery({ name: 'tag', required: false, type: String, description: 'Filter by tag' })
  @ApiQuery({ name: 'author', required: false, type: String, description: 'Filter by author username' })
  @ApiQuery({ name: 'favorited', required: false, type: String, description: 'Filter by articles favorited by username' })
  async findAll(
    @Query() listArticlesQuery: ListArticlesDto,
    @Req() request?: AuthenticatedRequest
  ): Promise<PaginatedResult<ArticleWithAuthor>> {
    try {
      this.logger.log(`Getting articles with filters:`, listArticlesQuery);
      const userId = request?.user?.id;
      return await this.articlesService.findAll(listArticlesQuery, userId);
    } catch (error) {
      this.logger.error(`Error finding articles: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get article by slug' })
  @ArticleApiResponses.Success(ArticleResponseDto)
  @ArticleApiResponses.ArticleNotFound()
  async findBySlug(
    @Param('slug') articleSlug: string, 
    @Req() request?: AuthenticatedRequest
  ): Promise<ArticleResponse> {
    try {
      this.logger.log(`Getting article by slug: ${articleSlug}`);
      const userId = request?.user?.id;
      return await this.articlesService.findBySlug(articleSlug, userId);
    } catch (error) {
      this.logger.error(`Error finding article by slug ${articleSlug}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':slug')
  @ApiOperation({ summary: 'Update article by slug' })
  @ArticleApiResponses.Success(ArticleResponseDto)
  @ArticleOwnerResponses()
  async update(
    @Param('slug') articleSlug: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ArticleWithAuthor> {
    try {
      this.logger.log(`Updating article ${articleSlug} by user ${request.user.id}`);
      return await this.articlesService.update(articleSlug, updateArticleDto, request.user.id);
    } catch (error) {
      this.logger.error(`Error updating article ${articleSlug}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':slug')
  @ApiOperation({ summary: 'Delete article by slug' })
  @ArticleApiResponses.Success(ArticleResponseDto)
  @ArticleOwnerResponses()
  async remove(
    @Param('slug') articleSlug: string, 
    @Req() request: AuthenticatedRequest
  ): Promise<ArticleWithAuthor> {
    try {
      this.logger.log(`Deleting article ${articleSlug} by user ${request.user.id}`);
      return await this.articlesService.remove(articleSlug, request.user.id);
    } catch (error) {
      this.logger.error(`Error deleting article ${articleSlug}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':slug/favorite')
  @ApiOperation({ summary: 'Favorite an article' })
  @ArticleApiResponses.Success(ArticleResponseDto)
  @ArticleApiResponses.ArticleNotFound()
  @AuthRequiredResponses()
  async favoriteArticle(
    @Param('slug') articleSlug: string, 
    @Req() request: AuthenticatedRequest
  ): Promise<ArticleResponse> {
    try {
      this.logger.log(`User ${request.user.id} favoriting article ${articleSlug}`);
      return await this.articlesService.favoriteArticle(articleSlug, request.user.id);
    } catch (error) {
      this.logger.error(`Error favoriting article ${articleSlug}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':slug/favorite')
  @ApiOperation({ summary: 'Unfavorite an article' })
  @ArticleApiResponses.Success(ArticleResponseDto)
  @ArticleApiResponses.ArticleNotFound()
  @AuthRequiredResponses()
  async unfavoriteArticle(
    @Param('slug') articleSlug: string, 
    @Req() request: AuthenticatedRequest
  ): Promise<ArticleResponse> {
    try {
      this.logger.log(`User ${request.user.id} unfavoriting article ${articleSlug}`);
      return await this.articlesService.unfavoriteArticle(articleSlug, request.user.id);
    } catch (error) {
      this.logger.error(`Error unfavoriting article ${articleSlug}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
