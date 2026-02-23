import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('blogs/:blogId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Param('blogId') blogId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(user.id, blogId, createCommentDto);
  }

  @Public()
  @Get()
  async findAll(
    @Param('blogId') blogId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.commentsService.findAll(blogId, page, limit);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, user.id, updateCommentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    await this.commentsService.delete(id, user.id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteByBlog(
    @CurrentUser() user: any,
    @Param('blogId') blogId: string,
  ) {
    await this.commentsService.deleteByBlog(blogId, user.id);
  }
}
