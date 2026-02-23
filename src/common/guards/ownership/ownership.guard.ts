import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const blogId = request.params.id;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      select: { userId: true },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to modify this blog',
      );
    }

    return true;
  }
}
