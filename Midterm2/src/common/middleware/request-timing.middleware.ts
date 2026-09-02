import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestTimingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction) {
    const startedAt = process.hrtime.bigint();

    response.once('finish', () => {
      const elapsedMilliseconds =
        Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      this.logger.log(
        `${request.method} ${request.originalUrl} ${response.statusCode} - ${elapsedMilliseconds.toFixed(2)}ms`,
      );
    });

    next();
  }
}
