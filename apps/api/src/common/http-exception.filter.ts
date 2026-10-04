import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';

const PRISMA_ERRORS: Record<string, { status: number; message: string }> = {
  P2002: { status: HttpStatus.CONFLICT, message: 'این مقدار قبلاً ثبت شده است' },
  P2003: {
    status: HttpStatus.CONFLICT,
    message: 'رکورد مرتبط نامعتبر است یا هنوز در جای دیگری استفاده می‌شود',
  },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'رکورد یافت نشد' },
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const payload =
        typeof body === 'string'
          ? { message: body }
          : (body as Record<string, unknown>);
      response.status(status).json({ statusCode: status, ...payload });
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const known = PRISMA_ERRORS[exception.code];
      if (known) {
        response.status(known.status).json({ statusCode: known.status, message: known.message });
        return;
      }
    }

    this.logger.error(
      exception instanceof Error ? exception.message : 'Non-error exception thrown',
      exception instanceof Error ? exception.stack : undefined,
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'خطای داخلی سرور',
    });
  }
}
