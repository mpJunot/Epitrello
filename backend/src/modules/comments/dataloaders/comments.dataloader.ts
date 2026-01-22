import DataLoader = require('dataloader');
import { Injectable, Scope } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '../../users/entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class CommentsDataLoader {
  constructor(private prisma: PrismaService) { }

  createUsersByIdLoader(): DataLoader<string, User | null> {
    return new DataLoader<string, User | null>(async (userIds: readonly string[]) => {
      const users = await this.prisma.user.findMany({
        where: {
          id: {
            in: [...userIds],
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const usersById = new Map<string, User>();
      users.forEach((user) => {
        usersById.set(user.id, user as User);
      });

      return userIds.map((userId) => usersById.get(userId) || null);
    });
  }
}
