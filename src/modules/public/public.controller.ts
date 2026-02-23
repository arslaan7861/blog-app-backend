import {
  Controller,
  Get,
  Query,
  Param,
  Req,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { PublicService } from './public.service';
import { FeedQueryDto } from './dto/public.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('public')
@Public()
export class PublicController {
  private readonly ttl: number;
  private readonly feedLimit: number;
  private readonly blogLimit: number;

  constructor(
    private readonly publicService: PublicService,
    private readonly configService: ConfigService,
  ) {
    this.ttl = this.configService.get('RATE_LIMIT_TTL', 60) * 1000;
    this.feedLimit = this.configService.get('RATE_LIMIT_PUBLIC_FEED', 50);
    this.blogLimit = this.configService.get('RATE_LIMIT_PUBLIC_BLOG', 100);
  }

  @Get('feed')
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  async getFeed(@Query() query: FeedQueryDto) {
    return this.publicService.getFeed(query);
  }

  @Get('popular')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getPopularBlogs(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    const cappedLimit = Math.min(limit, 20);
    return this.publicService.getPopularBlogs(cappedLimit);
  }

  @Get('blogs/:slug')
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getBlogBySlug(
    @Param('slug') slug: string,
    @Req() req: any,
    @Query('comments') includeComments?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    const userId = req.user?.id;
    const commentsPage = page || 1;
    const commentsLimit = Math.min(limit || 10, 50);

    if (includeComments === 'true') {
      return this.publicService.getBlogWithPaginatedComments(
        slug,
        commentsPage,
        commentsLimit,
        userId,
      );
    }

    return this.publicService.getBlogBySlug(slug, userId);
  }
}
