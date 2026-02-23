import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OwnershipGuard } from 'src/common/guards/ownership/ownership.guard';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.create(user.id, createBlogDto);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.blogsService.findAll(user.id);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.blogsService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseGuards(OwnershipGuard)
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogsService.update(id, user.id, updateBlogDto);
  }

  @Delete(':id')
  @UseGuards(OwnershipGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    await this.blogsService.delete(id, user.id);
  }
}
