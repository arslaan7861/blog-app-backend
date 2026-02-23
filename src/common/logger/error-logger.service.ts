import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ErrorLoggerService {
  private readonly logger = new Logger(ErrorLoggerService.name);
  private readonly logDir = path.join(process.cwd(), 'logs');

  constructor() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  logError(
    exception: unknown,
    request: Request,
    status: number,
    message: string,
  ) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      status,
      message,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      userId: (request as any).user?.id || 'anonymous',
      stack: exception instanceof Error ? exception.stack : undefined,
      body: this.sanitizeBody(request.body),
      query: request.query,
      params: request.params,
    };

    if (status >= 500) {
      this.logger.error(JSON.stringify(errorLog, null, 2));
    } else {
      this.logger.warn(JSON.stringify(errorLog, null, 2));
    }

    this.writeToFile(errorLog);
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    if (sanitized.password) sanitized.password = '[REDACTED]';
    if (sanitized.passwordHash) sanitized.passwordHash = '[REDACTED]';
    if (sanitized.token) sanitized.token = '[REDACTED]';
    if (sanitized.refresh_token) sanitized.refresh_token = '[REDACTED]';

    return sanitized;
  }

  private writeToFile(errorLog: any) {
    const date = new Date().toISOString().split('T')[0];
    const filePath = path.join(this.logDir, `errors-${date}.log`);

    const logLine = JSON.stringify(errorLog) + '\n';

    fs.appendFile(filePath, logLine, (err) => {
      if (err) {
        this.logger.error(`Failed to write error log to file: ${err.message}`);
      }
    });
  }
}
