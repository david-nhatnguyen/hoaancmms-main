import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Search users for autocomplete (simpler, faster)
   */
  async search(query: string = '') {
    if (!query || query.trim().length === 0) {
      // Return recent users if no query
      return this.prisma.user.findMany({
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    }

    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
