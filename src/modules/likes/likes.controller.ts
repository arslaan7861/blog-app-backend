import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('blogs/:blogId/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  async like(@CurrentUser() user: any, @Param('blogId') blogId: string) {
    return this.likesService.like(user.id, blogId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async unlike(@CurrentUser() user: any, @Param('blogId') blogId: string) {
    return this.likesService.unlike(user.id, blogId);
  }

  @Get('status')
  async getLikeStatus(
    @CurrentUser() user: any,
    @Param('blogId') blogId: string,
  ) {
    return this.likesService.getLikeStatus(user.id, blogId);
  }

  @Get()
  async getBlogLikes(@Param('blogId') blogId: string) {
    return this.likesService.getBlogLikes(blogId);
  }
}
