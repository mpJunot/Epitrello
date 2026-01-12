import DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Card } from '../entities/card.entity';

@Injectable({ scope: Scope.REQUEST })
export class CardsDataLoader {
  constructor(private prisma: PrismaService) {}

  /**
   * DataLoader for loading cards by list IDs
   * Prevents N+1 queries when fetching lists with their cards
   */
  createCardsByListLoader(): DataLoader<string, Card[]> {
    return new DataLoader<string, Card[]>(async (listIds: readonly string[]) => {
      const cards = await this.prisma.card.findMany({
        where: {
          listId: {
            in: [...listIds],
          },
        },
        orderBy: {
          position: 'asc',
        },
      });

      // Group cards by listId
      const cardsByList = new Map<string, Card[]>();
      listIds.forEach((listId) => {
        cardsByList.set(listId, []);
      });

      cards.forEach((card) => {
        const listCards = cardsByList.get(card.listId) || [];
        listCards.push(card);
        cardsByList.set(card.listId, listCards);
      });

      return listIds.map((listId) => cardsByList.get(listId) || []);
    });
  }

  /**
   * DataLoader for loading card assignees by card IDs
   * Prevents N+1 queries when fetching cards with their assignees
   */
  createAssigneesByCardLoader(): DataLoader<string, any[]> {
    return new DataLoader<string, any[]>(async (cardIds: readonly string[]) => {
      const assignees = await this.prisma.cardAssignee.findMany({
        where: {
          cardId: {
            in: [...cardIds],
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // Group assignees by cardId
      const assigneesByCard = new Map<string, any[]>();
      cardIds.forEach((cardId) => {
        assigneesByCard.set(cardId, []);
      });

      assignees.forEach((assignee) => {
        const cardAssignees = assigneesByCard.get(assignee.cardId) || [];
        cardAssignees.push(assignee);
        assigneesByCard.set(assignee.cardId, cardAssignees);
      });

      return cardIds.map((cardId) => assigneesByCard.get(cardId) || []);
    });
  }
}
