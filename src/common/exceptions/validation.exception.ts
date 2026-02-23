import { BadRequestException } from '@nestjs/common';

export class ValidationException extends BadRequestException {
  constructor(public validationErrors: Record<string, string[]>) {
    super({
      message: 'Validation failed',
      errors: validationErrors,
    });
  }
}
