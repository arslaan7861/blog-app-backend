import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async like(userId: string, blogId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true, isPublished: true },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (!blog.isPublished) {
      throw new NotFoundException('Blog is not published');
    }

    try {
      await this.prisma.like.create({
        data: {
          userId,
          blogId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('You have already liked this post');
      }
      throw error;
    }

    const likesCount = await this.prisma.like.count({
      where: { blogId },
    });

    return {
      liked: true,
      likesCount,
    };
  }

  async unlike(userId: string, blogId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    try {
      await this.prisma.like.delete({
        where: {
          userId_blogId: {
            userId,
            blogId,
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('You have not liked this post');
      }
      throw error;
    }

    const likesCount = await this.prisma.like.count({
      where: { blogId },
    });

    return {
      liked: false,
      likesCount,
    };
  }

  async getLikeStatus(userId: string, blogId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const like = await this.prisma.like.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    const likesCount = await this.prisma.like.count({
      where: { blogId },
    });

    return {
      liked: !!like,
      likesCount,
    };
  }

  async getBlogLikes(blogId: string) {
    const [count, users] = await Promise.all([
      this.prisma.like.count({
        where: { blogId },
      }),
      this.prisma.like.findMany({
        where: { blogId },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      count,
      recent: users.map((like) => ({
        user: like.user,
        likedAt: like.createdAt,
      })),
    };
  }
}
