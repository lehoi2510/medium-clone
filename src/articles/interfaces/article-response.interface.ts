import { Article, User } from '@prisma/client';

export interface ArticleResponse {
  article: {
    slug: string;
    title: string;
    description: string;
    body: string;
    tagList: string[];
    createdAt: Date;
    updatedAt: Date;
    favorited: boolean;
    favoritesCount: number;
    author: {
      username: string;
      bio: string | null;
      image: string | null;
      following: boolean;
    };
  };
}

export interface ArticleWithAuthor extends Article {
  author: User;
}
