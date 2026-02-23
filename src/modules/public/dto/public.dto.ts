import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FeedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}

import { User, Comment } from '@prisma/client';

export interface FeedItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  createdAt: Date;
  author: Pick<User, 'id' | 'name' | 'email'>;
  likesCount: number;
  commentsCount: number;
}

export interface FeedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FeedResponse {
  data: FeedItem[];
  meta: FeedMeta;
}

export interface CommentItem {
  id: string;
  content: string;
  createdAt: Date;
  user: Pick<User, 'id' | 'name' | 'email'>;
}

export interface BlogDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  createdAt: Date;
  updatedAt: Date;
  author: Pick<User, 'id' | 'name' | 'email'>;
  likesCount: number;
  commentsCount: number;
  likedByUser?: boolean;
  comments?: CommentItem[];
}
