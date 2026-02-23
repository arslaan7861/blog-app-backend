import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  FeedQueryDto,
  FeedResponse,
  FeedItem,
  BlogDetail,
  CommentItem,
} from './dto/public.dto';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async getFeed(query: FeedQueryDto): Promise<FeedResponse> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          createdAt: true,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.blog.count({
        where: { isPublished: true },
      }),
    ]);

    const data: FeedItem[] = blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      summary: this.generateSummary(blog.content),
      createdAt: blog.createdAt,
      author: {
        id: blog.user.id,
        name: blog.user.name,
        email: blog.user.email,
      },
      likesCount: blog._count.likes,
      commentsCount: blog._count.comments,
    }));

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
    };
  }

  async getBlogBySlug(slug: string, userId?: string): Promise<BlogDetail> {
    const blog = await this.prisma.blog.findFirst({
      where: { slug, isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        createdAt: true,
        updatedAt: true,
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
        comments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    let likedByUser = false;
    if (userId) {
      const like = await this.prisma.like.findUnique({
        where: {
          userId_blogId: {
            userId,
            blogId: blog.id,
          },
        },
      });
      likedByUser = !!like;
    }

    const comments: CommentItem[] = blog.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        email: comment.user.email,
      },
    }));

    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      summary: this.generateSummary(blog.content),
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      author: {
        id: blog.user.id,
        name: blog.user.name,
        email: blog.user.email,
      },
      likesCount: blog._count.likes,
      commentsCount: blog._count.comments,
      likedByUser,
      comments,
    };
  }

  async getBlogWithPaginatedComments(
    slug: string,
    page: number = 1,
    limit: number = 10,
    userId?: string,
  ): Promise<BlogDetail & { commentsMeta: any }> {
    const blog = await this.prisma.blog.findFirst({
      where: { slug, isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        createdAt: true,
        updatedAt: true,
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

    const skip = (page - 1) * limit;
    const [comments, totalComments] = await Promise.all([
      this.prisma.comment.findMany({
        where: { blogId: blog.id },
        select: {
          id: true,
          content: true,
          createdAt: true,
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
        where: { blogId: blog.id },
      }),
    ]);

    let likedByUser = false;
    if (userId) {
      const like = await this.prisma.like.findUnique({
        where: {
          userId_blogId: {
            userId,
            blogId: blog.id,
          },
        },
      });
      likedByUser = !!like;
    }

    const totalPages = Math.ceil(totalComments / limit);

    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      summary: this.generateSummary(blog.content),
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      author: {
        id: blog.user.id,
        name: blog.user.name,
        email: blog.user.email,
      },
      likesCount: blog._count.likes,
      commentsCount: blog._count.comments,
      likedByUser,
      comments: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          id: comment.user.id,
          name: comment.user.name,
          email: comment.user.email,
        },
      })),
      commentsMeta: {
        total: totalComments,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async getPopularBlogs(limit: number = 5): Promise<FeedItem[]> {
    const blogs = await this.prisma.blog.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        createdAt: true,
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
      orderBy: [
        { likes: { _count: 'desc' } },
        { comments: { _count: 'desc' } },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      summary: this.generateSummary(blog.content),
      createdAt: blog.createdAt,
      author: {
        id: blog.user.id,
        name: blog.user.name,
        email: blog.user.email,
      },
      likesCount: blog._count.likes,
      commentsCount: blog._count.comments,
    }));
  }

  private generateSummary(content: string, maxLength: number = 150): string {
    if (!content) return '';

    const plainText = content
      .replace(/<[^>]*>/g, '')
      .replace(/#+\s/g, '')
      .replace(/[*_~`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (plainText.length <= maxLength) {
      return plainText;
    }

    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    return (
      (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...'
    );
  }
}
