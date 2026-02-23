import { IsString } from 'class-validator';

export class LikeResponseDto {
  liked!: boolean;
  likesCount!: number;
}

export class LikeStatusDto {
  liked!: boolean;
  likesCount!: number;
}
