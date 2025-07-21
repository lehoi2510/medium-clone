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
import { PaginationDto } from './dto/pagination.dto';
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
  create(@Body() dto: CreateArticleDto, @Req() req: AuthenticatedRequest): Promise<ArticleWithAuthor> {
    this.logger.log(`Creating article for user ${req.user.id}: ${dto.title}`);
    return this.articlesService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all articles with pagination' })
  @ArticleApiResponses.Success(PaginatedArticlesResponseDto)
  @CommonApiResponses.InternalServerError()
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<ArticleWithAuthor>> {
    this.logger.log(`Getting articles with pagination: page=${paginationDto.page}, limit=${paginationDto.limit}`);
    return await this.articlesService.findAll(paginationDto);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get article by slug' })
  @ArticleApiResponses.Success(ArticleResponseDto)
  @ArticleApiResponses.ArticleNotFound()
  findBySlug(@Param('slug') slug: string): Promise<ArticleWithAuthor> {
    this.logger.log(`Getting article by slug: ${slug}`);
    return this.articlesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':slug')
  @ApiOperation({ summary: 'Update article by slug' })
  @ArticleApiResponses.Success(ArticleResponseDto)
  @ArticleOwnerResponses()
  update(
    @Param('slug') slug: string,
    @Body() dto: UpdateArticleDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ArticleWithAuthor> {
    this.logger.log(`Updating article ${slug} by user ${req.user.id}`);
    return this.articlesService.update(slug, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':slug')
  @ApiOperation({ summary: 'Delete article by slug' })
  @ArticleApiResponses.Success(ArticleResponseDto)
  @ArticleOwnerResponses()
  remove(@Param('slug') slug: string, @Req() req: AuthenticatedRequest): Promise<ArticleWithAuthor> {
    this.logger.log(`Deleting article ${slug} by user ${req.user.id}`);
    return this.articlesService.remove(slug, req.user.id);
  }
}
