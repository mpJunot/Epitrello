import DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Card } from '../entities/card.entity';
import { Label } from '../../labels/entities/label.entity';
import { Checklist } from '../../checklists/entities/checklist.entity';

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

  /**
   * DataLoader for loading labels by card IDs
   * Prevents N+1 queries when fetching cards with their labels
   */
  createLabelsByCardLoader(): DataLoader<string, Label[]> {
    return new DataLoader<string, Label[]>(async (cardIds: readonly string[]) => {
      const labels = await this.prisma.cardLabel.findMany({
        where: {
          cardId: {
            in: [...cardIds],
          },
        },
        include: {
          label: true,
        },
      });

      const labelsByCard = new Map<string, Label[]>();
      cardIds.forEach((cardId) => {
        labelsByCard.set(cardId, []);
      });

      labels.forEach((cardLabel) => {
        const cardLabels = labelsByCard.get(cardLabel.cardId) || [];
        cardLabels.push(cardLabel.label as Label);
        labelsByCard.set(cardLabel.cardId, cardLabels);
      });

      return cardIds.map((cardId) => labelsByCard.get(cardId) || []);
    });
  }

  /**
   * DataLoader for loading checklists by card IDs
   * Prevents N+1 queries when fetching cards with their checklists
   */
  createChecklistsByCardLoader(): DataLoader<string, Checklist[]> {
    return new DataLoader<string, Checklist[]>(async (cardIds: readonly string[]) => {
      const checklists = await this.prisma.checklist.findMany({
        where: {
          cardId: {
            in: [...cardIds],
          },
        },
        include: {
          items: {
            orderBy: { position: 'asc' },
          },
        },
      });

      const checklistsByCard = new Map<string, Checklist[]>();
      cardIds.forEach((cardId) => {
        checklistsByCard.set(cardId, []);
      });

      checklists.forEach((checklist) => {
        const cardChecklists = checklistsByCard.get(checklist.cardId) || [];
        cardChecklists.push(checklist as Checklist);
        checklistsByCard.set(checklist.cardId, cardChecklists);
      });

      return cardIds.map((cardId) => checklistsByCard.get(cardId) || []);
    });
  }
}
