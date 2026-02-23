import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Comment cannot be empty' })
  @MaxLength(1000, { message: 'Comment cannot exceed 1000 characters' })
  content!: string;
}

export class UpdateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Comment cannot be empty' })
  @MaxLength(1000, { message: 'Comment cannot exceed 1000 characters' })
  content!: string;
}

export class CommentResponseDto {
  id!: string;
  content!: string;
  createdAt!: Date;
  updatedAt!: Date;
  user!: {
    id: string;
    name: string;
    email: string;
  };
  blogId!: string;
}

export class CommentsListResponseDto {
  data!: CommentResponseDto[];
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
