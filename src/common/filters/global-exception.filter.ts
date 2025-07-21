import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ERROR_MESSAGES } from '../constants/messages.constant';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof SyntaxError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid JSON format. Please check your request body syntax.';
      error = 'Bad Request - Invalid JSON';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;
      } else {
        message = exception.message;
        error = exception.name;
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Database Error';
      
      switch (exception.code) {
        case 'P2002':
          message = ERROR_MESSAGES.EMAIL_USERNAME_EXISTS;
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        case 'P2003':
          message = 'Foreign key constraint failed';
          break;
        default:
          message = 'Database operation failed';
      }
      
      this.logger.error(
        `Prisma error: ${exception.code} - ${exception.message}`,
        exception.stack,
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';
      
      this.logger.error(
        `Unexpected error: ${exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
    );

    response.status(status).json(errorResponse);
  }
}
