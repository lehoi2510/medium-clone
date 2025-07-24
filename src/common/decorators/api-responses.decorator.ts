import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export const CommonApiResponses = {
  Unauthorized: () =>
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized - JWT token required',
    }),

  Forbidden: () =>
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Forbidden - Insufficient permissions',
    }),

  NotFound: (resource: string = 'Resource') =>
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: `${resource} not found`,
    }),

  BadRequest: () =>
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad request - Invalid input data',
    }),

  InternalServerError: () =>
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
    }),
};

export const ArticleApiResponses = {
  Success: (type: any) =>
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Operation completed successfully',
      type,
    }),

  Created: (type: any) =>
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Article created successfully',
      type,
    }),

  ArticleNotFound: () => CommonApiResponses.NotFound('Article'),
  
  ArticleForbidden: () =>
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Forbidden - Not the author of the article',
    }),
};

export const AuthRequiredResponses = () =>
  applyDecorators(
    CommonApiResponses.Unauthorized(),
    CommonApiResponses.Forbidden(),
  );

export const ArticleOwnerResponses = () =>
  applyDecorators(
    CommonApiResponses.Unauthorized(),
    ArticleApiResponses.ArticleForbidden(),
    ArticleApiResponses.ArticleNotFound(),
  );

export const CommentApiResponses = {
  Success: (type: any) =>
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Operation completed successfully',
      type,
    }),

  Created: (type: any) =>
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Comment created successfully',
      type,
    }),

  CommentNotFound: () => CommonApiResponses.NotFound('Comment'),
  
  CommentForbidden: () =>
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Forbidden - Not the author of the comment',
    }),
};

export const CommentOwnerResponses = () =>
  applyDecorators(
    CommonApiResponses.Unauthorized(),
    CommentApiResponses.CommentForbidden(),
    CommentApiResponses.CommentNotFound(),
    ArticleApiResponses.ArticleNotFound(),
  );
