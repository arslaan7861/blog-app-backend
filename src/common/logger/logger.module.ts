import { Global, Module } from '@nestjs/common';
import { ErrorLoggerService } from './error-logger.service';

@Global()
@Module({
  providers: [ErrorLoggerService],
  exports: [ErrorLoggerService],
})
export class LoggerModule {}
