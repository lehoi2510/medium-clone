import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ListArticlesDto } from './dto/pagination.dto';
import { PaginatedResult } from './interfaces/paginated-result.interface';
import { ArticleWithAuthor } from './interfaces/article-service.interface';
import { ArticleResponse } from './interfaces/article-response.interface';
import slugify from 'slugify';
import { ERROR_MESSAGES } from '../common/constants/messages.constant';
import {
  PAGINATION_CONSTANTS,
  ARTICLE_CONSTANTS,
} from '../common/constants/pagination.constant';
import { ARTICLE_INCLUDE_AUTHOR } from '../common/constants/database-selectors.constant';

interface ArticleWhereConditions {
  tagList?: {
    contains: string;
  };
  author?: {
    username: string;
  };
  favorites?: {
    some: {
      userId: number;
    };
  };
}

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(private prisma: PrismaService) {}

  private async findAndValidateArticleOwnership(
    slug: string,
    userId: number,
  ): Promise<ArticleWithAuthor> {
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

  private async generateUniqueSlug(
    title: string,
    excludeId?: number,
  ): Promise<string> {
    let slug = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    const existingArticle = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (existingArticle && (!excludeId || existingArticle.id !== excludeId)) {
      slug = `${slug}-${Date.now()}`;
    }

    return slug;
  }

  async create(
    createArticleData: CreateArticleDto,
    userId: number,
  ): Promise<ArticleWithAuthor> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
  }

  async findAll(
    filters: ListArticlesDto,
    userId?: number,
  ): Promise<PaginatedResult<ArticleWithAuthor>> {
    const limit = Number(filters.limit) || PAGINATION_CONSTANTS.DEFAULT_LIMIT;
    const offset =
      Number(filters.offset) || PAGINATION_CONSTANTS.DEFAULT_OFFSET;
    const validLimit = Math.min(
      Math.max(limit, PAGINATION_CONSTANTS.MIN_LIMIT),
      PAGINATION_CONSTANTS.MAX_LIMIT,
    );
    const validOffset = Math.max(offset, PAGINATION_CONSTANTS.MIN_OFFSET);
    const whereConditions: ArticleWhereConditions = {};

    if (filters.tag) {
      whereConditions.tagList = {
        contains: filters.tag,
      };
    }

    if (filters.author) {
      whereConditions.author = {
        username: filters.author,
      };
    }
    if (filters.favorited) {
      const favoritedUser = await this.prisma.user.findUnique({
        where: { username: filters.favorited },
      });

      if (favoritedUser) {
        whereConditions.favorites = {
          some: {
            userId: favoritedUser.id,
          },
        };
      } else {
        return {
          data: [],
          meta: {
            total: 0,
            page: ARTICLE_CONSTANTS.DEFAULT_PAGE,
            limit: validLimit,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
          message: 'No articles found for the specified favorited user',
        };
      }
    }

    const total = await this.prisma.article.count({
      where: whereConditions,
    });

    const articles = await this.prisma.article.findMany({
      where: whereConditions,
      skip: validOffset,
      take: validLimit,
      include: {
        author: true,
        favorites: userId
          ? {
              where: { userId },
            }
          : false,
        _count: {
          select: { favorites: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const transformedArticles = articles.map((article) => ({
      ...article,
      favorited: userId && article.favorites?.length > 0,
      favoritesCount: article._count.favorites,
    }));

    const currentPage = Math.floor(validOffset / validLimit) + 1;
    const totalPages = Math.ceil(total / validLimit) || 1;
    const hasNextPage = validOffset + validLimit < total;
    const hasPrevPage = validOffset > 0;

    const result: PaginatedResult<ArticleWithAuthor> = {
      data: transformedArticles as ArticleWithAuthor[],
      meta: {
        total,
        page: currentPage,
        limit: validLimit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };

    if (articles.length === 0) {
      return {
        ...result,
        message:
          total === 0
            ? 'No articles found matching the filters'
            : `No articles found for the current offset`,
      };
    }

    return {
      ...result,
      message: `Retrieved ${articles.length} articles successfully`,
    };
  }

  async findBySlug(slug: string, userId?: number): Promise<ArticleResponse> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: true,
        _count: {
          select: { favorites: true },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(ERROR_MESSAGES.ARTICLE_NOT_FOUND);
    }

    let favorited = false;
    if (userId) {
      const userFavorite = await this.prisma.favorite.findFirst({
        where: { articleId: article.id, userId: userId },
      });
      favorited = !!userFavorite;
    }

    const { author, _count } = article;

    return {
      article: {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: [],
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        favorited,
        favoritesCount: _count.favorites,
        author: {
          username: author.username,
          bio: author.bio,
          image: author.image,
          following: false,
        },
      },
    };
  }

  async update(
    slug: string,
    updateArticleData: UpdateArticleDto,
    userId: number,
  ): Promise<ArticleWithAuthor> {
    const article = await this.findAndValidateArticleOwnership(slug, userId);
    let updateData: Partial<UpdateArticleDto & { slug?: string }> = {
      ...updateArticleData,
    };
    if (updateArticleData.title && updateArticleData.title !== article.title) {
      const newSlug = await this.generateUniqueSlug(
        updateArticleData.title,
        article.id,
      );
      updateData = { ...updateData, slug: newSlug };
    }
    const updatedArticle = await this.prisma.article.update({
      where: { slug },
      data: updateData,
      include: ARTICLE_INCLUDE_AUTHOR,
    });
    return updatedArticle as ArticleWithAuthor;
  }

  async remove(slug: string, userId: number): Promise<ArticleWithAuthor> {
    await this.findAndValidateArticleOwnership(slug, userId);
    const deletedArticle = await this.prisma.article.delete({
      where: { slug },
      include: ARTICLE_INCLUDE_AUTHOR,
    });
    return deletedArticle as ArticleWithAuthor;
  }

  async favoriteArticle(
    slug: string,
    userId: number,
  ): Promise<ArticleResponse> {
    const article = await this.prisma.article.findUnique({ where: { slug } });

    if (!article) {
      throw new NotFoundException(ERROR_MESSAGES.ARTICLE_NOT_FOUND);
    }

    await this.prisma.favorite.upsert({
      where: {
        userId_articleId: {
          userId,
          articleId: article.id,
        },
      },
      update: {},
      create: {
        userId,
        articleId: article.id,
      },
    });

    return this.findBySlug(slug, userId);
  }

  async unfavoriteArticle(
    slug: string,
    userId: number,
  ): Promise<ArticleResponse> {
    const article = await this.prisma.article.findUnique({ where: { slug } });

    if (!article) {
      throw new NotFoundException(ERROR_MESSAGES.ARTICLE_NOT_FOUND);
    }

    await this.prisma.favorite.deleteMany({
      where: {
        userId,
        articleId: article.id,
      },
    });

    return this.findBySlug(slug, userId);
  }
}
