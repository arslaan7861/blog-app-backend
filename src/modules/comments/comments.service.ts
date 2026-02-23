import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CommentResponseDto,
  CreateCommentDto,
  UpdateCommentDto,
} from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    blogId: string,
    createCommentDto: CreateCommentDto,
  ) {
    // Check if blog exists and is published
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true, isPublished: true },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (!blog.isPublished) {
      throw new NotFoundException('Cannot comment on unpublished blog');
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        userId,
        blogId,
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

    return this.transformComment(comment);
  }

  async findAll(blogId: string, page: number = 1, limit: number = 10) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { blogId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({
        where: { blogId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: comments.map((comment) => this.transformComment(comment)),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
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

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.transformComment(comment);
  }

  async update(id: string, userId: string, updateCommentDto: UpdateCommentDto) {
    const existingComment = await this.prisma.comment.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingComment) {
      throw new NotFoundException('Comment not found');
    }

    if (existingComment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const comment = await this.prisma.comment.update({
      where: { id },
      data: {
        content: updateCommentDto.content,
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

    return this.transformComment(comment);
  }

  async delete(id: string, userId: string) {
    const existingComment = await this.prisma.comment.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingComment) {
      throw new NotFoundException('Comment not found');
    }

    if (existingComment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Comment deleted successfully',
    };
  }

  async deleteByBlog(blogId: string, userId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      select: { userId: true },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete comments on your own blogs',
      );
    }

    await this.prisma.comment.deleteMany({
      where: { blogId },
    });

    return {
      success: true,
      message: 'All comments deleted successfully',
    };
  }

  private transformComment(comment: any): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      blogId: comment.blogId,
      user: comment.user,
    };
  }
}
