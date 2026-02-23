import {
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title!: string;

  @IsString()
  @MinLength(10, { message: 'Content must be at least 10 characters long' })
  content!: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateBlogDto {
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(10, { message: 'Content must be at least 10 characters long' })
  content?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class BlogResponseDto {
  id!: string;
  title!: string;
  slug!: string;
  content!: string;
  summary?: string;
  isPublished!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  author!: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    likes: number;
    comments: number;
  };
}
