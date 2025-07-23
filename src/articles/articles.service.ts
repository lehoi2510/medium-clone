import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PaginatedResult } from './interfaces/paginated-result.interface';
import { ArticleWithAuthor, ArticleServiceResponse, ArticlesListResponse } from './interfaces/article-service.interface';
import slugify from 'slugify';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../common/constants/messages.constant';
import { AUTHOR_SELECT_FIELDS, ARTICLE_INCLUDE_AUTHOR } from '../common/constants/database-selectors.constant';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(private prisma: PrismaService) { }

  private async findAndValidateArticleOwnership(slug: string, userId: number): Promise<ArticleWithAuthor> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: { author: true },
    });
    
    if (!article) {
      throw new NotFoundException(ERROR_MESSAGES.ARTICLE_NOT_FOUND);
    }
    
    if (article.authorId !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.ARTICLE_FORBIDDEN_DELETE);
    }

    return article as ArticleWithAuthor;
  }

  private async generateUniqueSlug(title: string, excludeId?: number): Promise<string> {
    let slug = slugify(title, { 
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    const existingArticle = await this.prisma.article.findUnique({
      where: { slug }
    });
    
    if (existingArticle && (!excludeId || existingArticle.id !== excludeId)) {
      slug = `${slug}-${Date.now()}`;
    }

    return slug;
  }

  async create(createArticleData: CreateArticleDto, userId: number): Promise<ArticleWithAuthor> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });
      if (!user) {
        throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      const slug = await this.generateUniqueSlug(createArticleData.title);
      const article = await this.prisma.article.create({
        data: {
          title: createArticleData.title,
          slug,
          description: createArticleData.description,
          body: createArticleData.body,
          authorId: userId,
        },
        include: ARTICLE_INCLUDE_AUTHOR,
      });
      return article as ArticleWithAuthor;
    } catch (error) {
      this.logger.error(`Error creating article: ${error.message}`, error.stack);
      if (error instanceof BadRequestException || 
          error instanceof ConflictException ||
          error instanceof ForbiddenException ||
          error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<ArticleWithAuthor>> {
    try {
      const page = Number(pagination.page) || 1;
      const limit = Number(pagination.limit) || 10;
      const validLimit = Math.min(Math.max(limit, 1), 100);
      const validPage = Math.max(page, 1);
      const skip = (validPage - 1) * validLimit;

      const total = await this.prisma.article.count();
      const articles = await this.prisma.article.findMany({
        skip,
        take: validLimit,
        include: ARTICLE_INCLUDE_AUTHOR,
        orderBy: { createdAt: 'desc' },
      });

      const totalPages = Math.ceil(total / validLimit) || 1;
      const hasNextPage = validPage < totalPages;
      const hasPrevPage = validPage > 1;

      const result: PaginatedResult<ArticleWithAuthor> = {
        data: articles as ArticleWithAuthor[],
        meta: {
          total,
          page: validPage,
          limit: validLimit,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      };

      if (articles.length === 0) {
        return {
          ...result,
          message: total === 0 ? 'No articles found in the database' : `No articles found on page ${validPage}`,
        };
      }
      return {
        ...result,
        message: `Retrieved ${articles.length} articles successfully`,
      };
    } catch (error) {
      this.logger.error(`Error finding articles: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findBySlug(slug: string): Promise<ArticleWithAuthor> {
    try {
      this.logger.log(`Finding article by slug: ${slug}`);
      
      const article = await this.prisma.article.findUnique({
        where: { slug },
        include: { author: true },
      });
      
      if (!article) {
        throw new NotFoundException(ERROR_MESSAGES.ARTICLE_NOT_FOUND);
      }
      
      this.logger.log(`Article found: ${article.title}`);
      return article as ArticleWithAuthor;
    } catch (error) {
      this.logger.error(`Error finding article by slug ${slug}: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw error;
    }
  }

  async update(slug: string, updateArticleData: UpdateArticleDto, userId: number): Promise<ArticleWithAuthor> {
    try {
      const article = await this.findAndValidateArticleOwnership(slug, userId);
      let updateData: Partial<UpdateArticleDto & { slug?: string }> = { ...updateArticleData };
      if (updateArticleData.title && updateArticleData.title !== article.title) {
        const newSlug = await this.generateUniqueSlug(updateArticleData.title, article.id);
        updateData = { ...updateData, slug: newSlug };
      }
      const updatedArticle = await this.prisma.article.update({
        where: { slug },
        data: updateData,
        include: ARTICLE_INCLUDE_AUTHOR,
      });
      return updatedArticle as ArticleWithAuthor;
    } catch (error) {
      this.logger.error(`Error updating article ${slug}: ${error.message}`, error.stack);
      if (error instanceof ForbiddenException || 
          error instanceof NotFoundException ||
          error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }

  async remove(slug: string, userId: number): Promise<ArticleWithAuthor> {
    try {
      await this.findAndValidateArticleOwnership(slug, userId);
      const deletedArticle = await this.prisma.article.delete({ 
        where: { slug },
        include: ARTICLE_INCLUDE_AUTHOR,
      });
      return deletedArticle as ArticleWithAuthor;
    } catch (error) {
      this.logger.error(`Error deleting article ${slug}: ${error.message}`, error.stack);
      if (error instanceof ForbiddenException || 
          error instanceof NotFoundException ||
          error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }
}