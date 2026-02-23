import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { slugify } from '../../common/utils/slugify';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBlogDto: CreateBlogDto) {
    const slug = await this.generateUniqueSlug(createBlogDto.title);

    const blog = await this.prisma.blog.create({
      data: {
        title: createBlogDto.title,
        content: createBlogDto.content,
        slug,
        isPublished: createBlogDto.isPublished || false,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return this.transformBlogResponse(blog);
  }

  async findAll(userId: string) {
    const blogs = await this.prisma.blog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return blogs.map((blog) => this.transformBlogResponse(blog));
  }

  async findOne(id: string, userId: string) {
    const blog = await this.prisma.blog.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return this.transformBlogResponse(blog);
  }

  async update(id: string, userId: string, updateBlogDto: UpdateBlogDto) {
    // Check if blog exists and user owns it
    const existingBlog = await this.prisma.blog.findFirst({
      where: { id, userId },
    });

    if (!existingBlog) {
      throw new NotFoundException('Blog not found');
    }

    // Prepare update data
    const updateData: any = { ...updateBlogDto };

    // If title is being updated, generate new slug
    if (updateBlogDto.title) {
      updateData.slug = await this.generateUniqueSlug(updateBlogDto.title, id);
    }

    const blog = await this.prisma.blog.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return this.transformBlogResponse(blog);
  }

  async delete(id: string, userId: string) {
    // Check if blog exists and user owns it
    const existingBlog = await this.prisma.blog.findFirst({
      where: { id, userId },
    });

    if (!existingBlog) {
      throw new NotFoundException('Blog not found');
    }

    await this.prisma.blog.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Blog deleted successfully',
    };
  }

  private async generateUniqueSlug(
    title: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = slugify(title);
    let uniqueSlug = slug;
    let counter = 1;

    // Check if slug exists
    while (await this.slugExists(uniqueSlug, excludeId)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  private async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!blog) return false;
    if (excludeId && blog.id === excludeId) return false;
    return true;
  }

  private transformBlogResponse(blog: any) {
    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      summary: blog.summary,
      isPublished: blog.isPublished,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      author: blog.user,
      ...(blog._count && {
        likesCount: blog._count.likes,
        commentsCount: blog._count.comments,
      }),
    };
  }
}
