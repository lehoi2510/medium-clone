import { Article, User } from '@prisma/client';

export interface ArticleWithAuthor extends Article {
  author: User;
}

export interface ServiceResponse<T> {
  data?: T;
  message?: string;
}

export interface ArticleServiceResponse extends ServiceResponse<ArticleWithAuthor> {}

export interface ArticlesListResponse extends ServiceResponse<ArticleWithAuthor[]> {
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
