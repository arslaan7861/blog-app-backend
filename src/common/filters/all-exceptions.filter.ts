import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ErrorLoggerService } from '../logger/error-logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly errorLogger: ErrorLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let responseBody: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        responseBody = {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          ...exceptionResponse,
        };
      } else {
        responseBody = {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          error: 'HTTP Error',
          message: exceptionResponse,
        };
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      let message = 'Database operation failed';

      switch (exception.code) {
        case 'P2002':
          const fields = (exception.meta?.target as string[])?.join(', ');
          message = `A record with this ${fields} already exists`;
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'The requested record was not found';
          break;
        case 'P2003':
          message = 'Referenced record does not exist';
          break;
        default:
          message = `Database error: ${exception.code}`;
      }

      responseBody = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        error: 'Database Error',
        message: message,
      };
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      responseBody = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        error: 'Validation Error',
        message: 'Invalid data format provided',
      };
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      responseBody = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      };
    }

    this.errorLogger.logError(
      exception,
      request,
      status,
      typeof responseBody.message === 'string'
        ? responseBody.message
        : JSON.stringify(responseBody),
    );

    response.status(status).json(responseBody);
  }
}
