import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  private readonly ttl: number;
  private readonly loginLimit: number;
  private readonly registerLimit: number;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.ttl = this.configService.get('RATE_LIMIT_TTL', 60) * 1000;
    this.loginLimit = this.configService.get('RATE_LIMIT_AUTH_LOGIN', 5);
    this.registerLimit = this.configService.get('RATE_LIMIT_AUTH_REGISTER', 3);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Will override with env in production
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
