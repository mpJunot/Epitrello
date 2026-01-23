import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Visibility } from '@prisma/client';

describe('CardsService', () => {
  let service: CardsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    card: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    list: {
      findUnique: jest.fn(),
    },
    board: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    cardAssignee: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    label: {
      findUnique: jest.fn(),
    },
    cardLabel: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockBoard = {
    id: 'board-1',
    title: 'Test Board',
    visibility: Visibility.PRIVATE,
    members: [
      {
        id: 'member-1',
        boardId: 'board-1',
        userId: 'user-1',
        role: 'ADMIN',
        joinedAt: new Date(),
      },
    ],
    workspace: {
      memberships: [],
    },
  };


  const mockCard = {
    id: 'card-1',
    listId: 'list-1',
    title: 'Test Card',
    description: null,
    coverUrl: null,
    startDate: null,
    dueDate: null,
    position: 0,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a card with automatic position calculation', async () => {
      const input = {
        listId: 'list-1',
        title: 'New Card',
      };

      mockPrismaService.list.findUnique.mockResolvedValue({ boardId: 'board-1' });
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.card.findFirst.mockResolvedValue(null);
      mockPrismaService.card.create.mockResolvedValue({
        ...mockCard,
        title: 'New Card',
        position: 0,
      });

      const result = await service.create(input, mockUser.id);

      expect(result).toBeDefined();
      expect(result.title).toBe('New Card');
      expect(prismaService.card.create).toHaveBeenCalled();
    });

    it('should create a card with provided position', async () => {
      const input = {
        listId: 'list-1',
        title: 'New Card',
        position: 5,
      };

      mockPrismaService.list.findUnique.mockResolvedValue({ boardId: 'board-1' });
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.card.create.mockResolvedValue({
        ...mockCard,
        title: 'New Card',
        position: 5,
      });

      const result = await service.create(input, mockUser.id);

      expect(result.position).toBe(5);
      expect(prismaService.card.create).toHaveBeenCalledWith({
        data: {
          listId: input.listId,
          title: input.title,
          position: 5,
          completed: false,
          description: undefined,
          coverUrl: undefined,
          startDate: undefined,
          dueDate: undefined,
        },
      });
    });

    it('should throw ForbiddenException if user does not have access to board', async () => {
      const input = {
        listId: 'list-1',
        title: 'New Card',
      };

      mockPrismaService.list.findUnique.mockResolvedValue({ boardId: 'board-1' });
      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        members: [],
        visibility: Visibility.PRIVATE,
        workspace: null,
      });

      await expect(service.create(input, mockUser.id)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when board does not exist', async () => {
      const input = {
        listId: 'list-1',
        title: 'New Card',
      };

      mockPrismaService.list.findUnique.mockResolvedValue({ boardId: 'board-1' });
      mockPrismaService.board.findUnique.mockResolvedValue(null);

      await expect(service.create(input, mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a card by id', async () => {
      const mockCardWithList = {
        ...mockCard,
        list: { boardId: 'board-1' },
      };

      mockPrismaService.card.findUnique.mockResolvedValue(mockCardWithList);
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

      const result = await service.findOne('card-1', mockUser.id);

      expect(result.id).toBe(mockCard.id);
      expect(result.title).toBe(mockCard.title);
      expect(prismaService.card.findUnique).toHaveBeenCalledWith({
        where: { id: 'card-1' },
        include: {
          list: {
            select: {
              boardId: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if card does not exist', async () => {
      mockPrismaService.card.findUnique.mockResolvedValue(null);

      await expect(service.findOne('card-1', mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a card', async () => {
      const input = {
        id: 'card-1',
        title: 'Updated Card',
      };

      mockPrismaService.card.findUnique.mockResolvedValue({
        ...mockCard,
        list: { boardId: 'board-1' },
      });
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.card.update.mockResolvedValue({
        ...mockCard,
        title: 'Updated Card',
      });

      const result = await service.update(input, mockUser.id);

      expect(result.title).toBe('Updated Card');
      expect(prismaService.card.update).toHaveBeenCalled();
    });

    it('should update card description with markdown', async () => {
      const input = {
        id: 'card-1',
        description: '# Title\n\n**Bold** text',
      };

      mockPrismaService.card.findUnique.mockResolvedValue({
        ...mockCard,
        list: { boardId: 'board-1' },
      });
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.card.update.mockResolvedValue({
        ...mockCard,
        description: '# Title\n\n**Bold** text',
      });

      const result = await service.update(input, mockUser.id);

      expect(result.description).toBe('# Title\n\n**Bold** text');
    });
  });

  describe('delete', () => {
    it('should delete a card', async () => {
      mockPrismaService.card.findUnique.mockResolvedValue({
        ...mockCard,
        list: { boardId: 'board-1' },
      });
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.card.delete.mockResolvedValue(mockCard);

      const result = await service.delete('card-1', mockUser.id);

      expect(result).toBe(true);
      expect(prismaService.card.delete).toHaveBeenCalledWith({
        where: { id: 'card-1' },
      });
    });
  });

  describe('move', () => {
    it('should move a card to a different list', async () => {
      const input = {
        cardId: 'card-1',
        targetListId: 'list-2',
      };

      const mockCardWithList = {
        ...mockCard,
        list: { boardId: 'board-1' },
      };

      // Sequence: getBoardIdFromCard -> getBoardIdFromList -> checkBoardAccess (source) -> checkBoardAccess (target) -> calculateNextPosition -> update
      mockPrismaService.card.findUnique
        .mockResolvedValueOnce(mockCardWithList) // getBoardIdFromCard
        .mockResolvedValueOnce(mockCard); // final return
      mockPrismaService.list.findUnique
        .mockResolvedValueOnce({ boardId: 'board-1' }); // getBoardIdFromList
      mockPrismaService.board.findUnique
        .mockResolvedValueOnce(mockBoard) // source board check
        .mockResolvedValueOnce(mockBoard); // target board check
      mockPrismaService.card.findFirst.mockResolvedValue(null); // calculateNextPosition
      mockPrismaService.card.update.mockResolvedValue({
        ...mockCard,
        listId: 'list-2',
        position: 0,
      });

      const result = await service.move(input, mockUser.id);

      expect(result.listId).toBe('list-2');
      expect(prismaService.card.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if moving between different boards', async () => {
      const input = {
        cardId: 'card-1',
        targetListId: 'list-2',
      };

      const mockCardWithList = {
        ...mockCard,
        list: { boardId: 'board-1' },
      };

      const mockBoard2 = {
        id: 'board-2',
        title: 'Test Board 2',
        visibility: Visibility.PRIVATE,
        members: [
          {
            id: 'member-2',
            boardId: 'board-2',
            userId: 'user-1',
            role: 'ADMIN',
            joinedAt: new Date(),
          },
        ],
        workspace: {
          memberships: [],
        },
      };

      // Sequence in move():
      // 1. getBoardIdFromCard(cardId) -> card.findUnique with include list
      // 2. getBoardIdFromList(targetListId) -> list.findUnique
      // 3. checkBoardAccess(sourceBoardId) -> board.findUnique with include members and workspace
      // 4. checkBoardAccess(targetBoardId) -> board.findUnique with include members and workspace
      // 5. Check if sourceBoardId !== targetBoardId -> throw BadRequestException
      mockPrismaService.card.findUnique.mockResolvedValueOnce(mockCardWithList);
      mockPrismaService.list.findUnique.mockResolvedValueOnce({ boardId: 'board-2' });
      mockPrismaService.board.findUnique
        .mockResolvedValueOnce({
          ...mockBoard,
          workspace: { memberships: [] },
        })
        .mockResolvedValueOnce({
          ...mockBoard2,
          workspace: { memberships: [] },
        });

      await expect(service.move(input, mockUser.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('reorder', () => {
    it('should reorder multiple cards', async () => {
      const input = {
        listId: 'list-1',
        cardPositions: [
          { id: 'card-1', position: 0 },
          { id: 'card-2', position: 1 },
        ],
      };

      const mockCards = [
        { ...mockCard, id: 'card-1', position: 0 },
        { ...mockCard, id: 'card-2', position: 1 },
      ];

      mockPrismaService.list.findUnique.mockResolvedValue({ boardId: 'board-1' });
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.card.findMany.mockResolvedValue(mockCards);
      mockPrismaService.$transaction.mockResolvedValue(mockCards);

      const result = await service.reorder(input, mockUser.id);

      expect(result).toHaveLength(2);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if cards belong to different lists', async () => {
      const input = {
        listId: 'list-1',
        cardPositions: [
          { id: 'card-1', position: 0 },
          { id: 'card-2', position: 1 },
        ],
      };

      const mockCards = [
        { ...mockCard, id: 'card-1', listId: 'list-1' },
        { ...mockCard, id: 'card-2', listId: 'list-2' },
      ];

      mockPrismaService.list.findUnique.mockResolvedValue({ boardId: 'board-1' });
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.card.findMany.mockResolvedValue(mockCards);

      await expect(service.reorder(input, mockUser.id)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if cards are missing', async () => {
      const input = {
        listId: 'list-1',
        cardPositions: [
          { id: 'card-1', position: 0 },
          { id: 'card-2', position: 1 },
        ],
      };

      const mockCards = [{ ...mockCard, id: 'card-1', listId: 'list-1' }];

      mockPrismaService.list.findUnique.mockResolvedValue({ boardId: 'board-1' });
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.card.findMany.mockResolvedValue(mockCards);

      await expect(service.reorder(input, mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignMember', () => {
    it('should assign a member to a card', async () => {
      const input = {
        cardId: 'card-1',
        userId: 'user-2',
      };

      mockPrismaService.card.findUnique
        .mockResolvedValueOnce({
          ...mockCard,
          list: { boardId: 'board-1' },
        })
        .mockResolvedValueOnce(mockCard);
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-2',
        email: 'user2@example.com',
        name: 'User 2',
      });
      mockPrismaService.cardAssignee.findUnique.mockResolvedValue(null);
      mockPrismaService.cardAssignee.create.mockResolvedValue({
        id: 'assignee-1',
        cardId: 'card-1',
        userId: 'user-2',
        assignedAt: new Date(),
      });

      const result = await service.assignMember(input, mockUser.id);

      expect(result).toBeDefined();
      expect(prismaService.cardAssignee.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user is already assigned', async () => {
      const input = {
        cardId: 'card-1',
        userId: 'user-2',
      };

      const mockCardWithList = {
        ...mockCard,
        list: { boardId: 'board-1' },
      };

      // getBoardIdFromCard is called first in assignMember
      mockPrismaService.card.findUnique.mockResolvedValueOnce(mockCardWithList);
      mockPrismaService.board.findUnique.mockResolvedValueOnce({
        ...mockBoard,
        workspace: { memberships: [] },
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-2',
        email: 'user2@example.com',
        name: 'User 2',
      });
      mockPrismaService.cardAssignee.findUnique.mockResolvedValue({
        id: 'assignee-1',
        cardId: 'card-1',
        userId: 'user-2',
        assignedAt: new Date(),
      });

      await expect(service.assignMember(input, mockUser.id)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const input = {
        cardId: 'card-1',
        userId: 'user-2',
      };

      mockPrismaService.card.findUnique.mockResolvedValueOnce({
        ...mockCard,
        list: { boardId: 'board-1' },
      });
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.assignMember(input, mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('unassignMember', () => {
    it('should unassign a member from a card', async () => {
      const input = {
        cardId: 'card-1',
        userId: 'user-2',
      };

      mockPrismaService.card.findUnique
        .mockResolvedValueOnce({
          ...mockCard,
          list: { boardId: 'board-1' },
        })
        .mockResolvedValueOnce(mockCard);
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.cardAssignee.findUnique.mockResolvedValue({
        id: 'assignee-1',
        cardId: 'card-1',
        userId: 'user-2',
        assignedAt: new Date(),
      });
      mockPrismaService.cardAssignee.delete.mockResolvedValue({});

      const result = await service.unassignMember(input, mockUser.id);

      expect(result).toBeDefined();
      expect(prismaService.cardAssignee.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not assigned', async () => {
      const input = {
        cardId: 'card-1',
        userId: 'user-2',
      };

      const mockCardWithList = {
        ...mockCard,
        list: { boardId: 'board-1' },
      };

      // getBoardIdFromCard is called first in unassignMember
      mockPrismaService.card.findUnique.mockResolvedValueOnce(mockCardWithList);
      mockPrismaService.board.findUnique.mockResolvedValueOnce({
        ...mockBoard,
        workspace: { memberships: [] },
      });
      mockPrismaService.cardAssignee.findUnique.mockResolvedValue(null);

      await expect(service.unassignMember(input, mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addLabelToCard', () => {
    it('should add a label to a card', async () => {
      mockPrismaService.card.findUnique
        .mockResolvedValueOnce({
          ...mockCard,
          list: { boardId: 'board-1' },
        })
        .mockResolvedValueOnce(mockCard);
      mockPrismaService.label.findUnique.mockResolvedValue({ id: 'label-1', boardId: 'board-1' });
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.cardLabel.findUnique.mockResolvedValue(null);
      mockPrismaService.cardLabel.create.mockResolvedValue({
        id: 'card-label-1',
        cardId: 'card-1',
        labelId: 'label-1',
      });

      const result = await service.addLabelToCard('card-1', 'label-1', mockUser.id);

      expect(result).toBeDefined();
      expect(prismaService.cardLabel.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when label is from different board', async () => {
      mockPrismaService.card.findUnique.mockResolvedValueOnce({
        ...mockCard,
        list: { boardId: 'board-1' },
      });
      mockPrismaService.label.findUnique.mockResolvedValue({ id: 'label-1', boardId: 'board-2' });
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

      await expect(service.addLabelToCard('card-1', 'label-1', mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when label does not exist', async () => {
      mockPrismaService.card.findUnique.mockResolvedValueOnce({
        ...mockCard,
        list: { boardId: 'board-1' },
      });
      mockPrismaService.label.findUnique.mockResolvedValue(null);
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

      await expect(service.addLabelToCard('card-1', 'label-1', mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when label is already applied', async () => {
      mockPrismaService.card.findUnique
        .mockResolvedValueOnce({
          ...mockCard,
          list: { boardId: 'board-1' },
        })
        .mockResolvedValueOnce(mockCard);
      mockPrismaService.label.findUnique.mockResolvedValue({ id: 'label-1', boardId: 'board-1' });
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.cardLabel.findUnique.mockResolvedValue({
        id: 'card-label-1',
        cardId: 'card-1',
        labelId: 'label-1',
      });

      await expect(service.addLabelToCard('card-1', 'label-1', mockUser.id)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException when card does not exist', async () => {
      mockPrismaService.card.findUnique.mockResolvedValueOnce(null);

      await expect(service.addLabelToCard('card-1', 'label-1', mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeLabelFromCard', () => {
    it('should remove a label from a card', async () => {
      mockPrismaService.card.findUnique
        .mockResolvedValueOnce({
          ...mockCard,
          list: { boardId: 'board-1' },
        })
        .mockResolvedValueOnce(mockCard);
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.cardLabel.findUnique.mockResolvedValue({
        id: 'card-label-1',
        cardId: 'card-1',
        labelId: 'label-1',
      });
      mockPrismaService.cardLabel.delete.mockResolvedValue({});

      const result = await service.removeLabelFromCard('card-1', 'label-1', mockUser.id);

      expect(result).toBeDefined();
      expect(prismaService.cardLabel.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when label is not applied', async () => {
      mockPrismaService.card.findUnique.mockResolvedValueOnce({
        ...mockCard,
        list: { boardId: 'board-1' },
      });
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.cardLabel.findUnique.mockResolvedValue(null);

      await expect(service.removeLabelFromCard('card-1', 'label-1', mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByListIds', () => {
    it('should group cards by list id', async () => {
      mockPrismaService.card.findMany.mockResolvedValue([
        { id: 'card-1', listId: 'list-1' },
        { id: 'card-2', listId: 'list-2' },
        { id: 'card-3', listId: 'list-1' },
      ]);

      const result = await service.findByListIds(['list-1', 'list-2']);

      expect(result).toHaveLength(2);
      expect(result[0].map((card) => card.id)).toEqual(['card-1', 'card-3']);
      expect(result[1].map((card) => card.id)).toEqual(['card-2']);
      expect(prismaService.card.findMany).toHaveBeenCalled();
    });
  });

  describe('findAssigneesByCardIds', () => {
    it('should group assignees by card id', async () => {
      mockPrismaService.cardAssignee.findMany.mockResolvedValue([
        { id: 'assignee-1', cardId: 'card-1' },
        { id: 'assignee-2', cardId: 'card-2' },
        { id: 'assignee-3', cardId: 'card-1' },
      ]);

      const result = await service.findAssigneesByCardIds(['card-1', 'card-2']);

      expect(result).toHaveLength(2);
      expect(result[0].map((assignee) => assignee.id)).toEqual(['assignee-1', 'assignee-3']);
      expect(result[1].map((assignee) => assignee.id)).toEqual(['assignee-2']);
      expect(prismaService.cardAssignee.findMany).toHaveBeenCalled();
    });
  });
});
