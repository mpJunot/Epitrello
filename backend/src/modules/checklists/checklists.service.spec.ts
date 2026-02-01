import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ChecklistsService } from './checklists.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Visibility } from '@prisma/client';

describe('ChecklistsService', () => {
  let service: ChecklistsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    checklist: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    checklistItem: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    card: {
      findUnique: jest.fn(),
    },
    board: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockUser = { id: 'user-1' };
  const mockBoard = {
    id: 'board-1',
    visibility: Visibility.PRIVATE,
    members: [{ userId: 'user-1' }],
    workspace: { memberships: [] },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChecklistsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ChecklistsService>(ChecklistsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a checklist', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.checklist.create.mockResolvedValue({
      id: 'checklist-1',
      cardId: 'card-1',
      title: 'Checklist',
      items: [],
    });

    const result = await service.createChecklist(
      { cardId: 'card-1', title: 'Checklist' },
      mockUser.id,
    );

    expect(result.id).toBe('checklist-1');
    expect(prismaService.checklist.create).toHaveBeenCalled();
  });

  it('should throw when card does not exist', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue(null);

    await expect(
      service.createChecklist({ cardId: 'missing-card', title: 'Checklist' }, mockUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw when user has no board access', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue({
      ...mockBoard,
      members: [],
      workspace: { memberships: [] },
    });

    await expect(
      service.createChecklist({ cardId: 'card-1', title: 'Checklist' }, mockUser.id),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should update a checklist with fallback title', async () => {
    mockPrismaService.checklist.findUnique.mockResolvedValue({
      id: 'checklist-1',
      cardId: 'card-1',
      title: 'Existing',
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.checklist.update.mockResolvedValue({
      id: 'checklist-1',
      cardId: 'card-1',
      title: 'Existing',
      items: [],
    });

    const result = await service.updateChecklist({ id: 'checklist-1' }, mockUser.id);

    expect(result.title).toBe('Existing');
    expect(prismaService.checklist.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'checklist-1' },
        data: { title: 'Existing' },
      }),
    );
  });

  it('should throw when updating missing checklist', async () => {
    mockPrismaService.checklist.findUnique.mockResolvedValue(null);

    await expect(
      service.updateChecklist({ id: 'missing', title: 'Title' }, mockUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should delete a checklist', async () => {
    mockPrismaService.checklist.findUnique.mockResolvedValue({
      id: 'checklist-1',
      cardId: 'card-1',
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.checklist.delete.mockResolvedValue({ id: 'checklist-1' });

    const result = await service.deleteChecklist('checklist-1', mockUser.id);

    expect(result).toBe(true);
    expect(prismaService.checklist.delete).toHaveBeenCalledWith({ where: { id: 'checklist-1' } });
  });

  it('should throw when deleting missing checklist', async () => {
    mockPrismaService.checklist.findUnique.mockResolvedValue(null);

    await expect(service.deleteChecklist('missing', mockUser.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should add a checklist item', async () => {
    mockPrismaService.checklist.findUnique.mockResolvedValue({
      id: 'checklist-1',
      cardId: 'card-1',
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.checklistItem.findFirst.mockResolvedValue(null);
    mockPrismaService.checklistItem.create.mockResolvedValue({
      id: 'item-1',
      checklistId: 'checklist-1',
      content: 'Item',
      checked: false,
      position: 0,
    });

    const result = await service.addChecklistItem(
      { checklistId: 'checklist-1', content: 'Item' },
      mockUser.id,
    );

    expect(result.id).toBe('item-1');
    expect(prismaService.checklistItem.create).toHaveBeenCalled();
  });

  it('should add a checklist item with provided position', async () => {
    mockPrismaService.checklist.findUnique.mockResolvedValue({
      id: 'checklist-1',
      cardId: 'card-1',
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.checklistItem.create.mockResolvedValue({
      id: 'item-1',
      checklistId: 'checklist-1',
      content: 'Item',
      checked: false,
      position: 10,
    });

    const result = await service.addChecklistItem(
      { checklistId: 'checklist-1', content: 'Item', position: 10 },
      mockUser.id,
    );

    expect(result.position).toBe(10);
    expect(prismaService.checklistItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ position: 10 }),
      }),
    );
  });

  it('should throw when adding item to missing checklist', async () => {
    mockPrismaService.checklist.findUnique.mockResolvedValue(null);

    await expect(
      service.addChecklistItem({ checklistId: 'missing', content: 'Item' }, mockUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should update a checklist item', async () => {
    mockPrismaService.checklistItem.findUnique.mockResolvedValue({
      id: 'item-1',
      checklistId: 'checklist-1',
      content: 'Old',
      checked: false,
      position: 0,
    });
    mockPrismaService.checklist.findUnique.mockResolvedValue({
      id: 'checklist-1',
      cardId: 'card-1',
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.checklistItem.update.mockResolvedValue({
      id: 'item-1',
      checklistId: 'checklist-1',
      content: 'New',
      checked: true,
      position: 1,
    });

    const result = await service.updateChecklistItem(
      { id: 'item-1', content: 'New', checked: true, position: 1 },
      mockUser.id,
    );

    expect(result.content).toBe('New');
    expect(prismaService.checklistItem.update).toHaveBeenCalled();
  });

  it('should throw when checklist item is missing in lookup', async () => {
    mockPrismaService.checklistItem.findUnique.mockResolvedValue(null);

    await expect(
      service.updateChecklistItem({ id: 'missing', content: 'New' }, mockUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw when checklist item is missing before update', async () => {
    mockPrismaService.checklistItem.findUnique
      .mockResolvedValueOnce({
        id: 'item-1',
        checklistId: 'checklist-1',
      })
      .mockResolvedValueOnce(null);
    mockPrismaService.checklist.findUnique.mockResolvedValue({
      id: 'checklist-1',
      cardId: 'card-1',
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    await expect(
      service.updateChecklistItem({ id: 'item-1', content: 'New' }, mockUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should delete a checklist item', async () => {
    mockPrismaService.checklistItem.findUnique.mockResolvedValue({
      id: 'item-1',
      checklistId: 'checklist-1',
    });
    mockPrismaService.checklist.findUnique.mockResolvedValue({
      id: 'checklist-1',
      cardId: 'card-1',
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.checklistItem.delete.mockResolvedValue({ id: 'item-1' });

    const result = await service.deleteChecklistItem('item-1', mockUser.id);

    expect(result).toBe(true);
    expect(prismaService.checklistItem.delete).toHaveBeenCalledWith({ where: { id: 'item-1' } });
  });

  it('should reorder checklist items', async () => {
    mockPrismaService.checklist.findUnique.mockResolvedValue({
      id: 'checklist-1',
      cardId: 'card-1',
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.checklistItem.findMany.mockResolvedValue([
      { id: 'item-1', checklistId: 'checklist-1' },
      { id: 'item-2', checklistId: 'checklist-1' },
    ]);
    mockPrismaService.$transaction.mockResolvedValue([
      { id: 'item-1', position: 0 },
      { id: 'item-2', position: 1 },
    ]);

    const result = await service.reorderChecklistItems(
      {
        checklistId: 'checklist-1',
        itemPositions: [
          { id: 'item-1', position: 0 },
          { id: 'item-2', position: 1 },
        ],
      },
      mockUser.id,
    );

    expect(result).toHaveLength(2);
    expect(prismaService.$transaction).toHaveBeenCalled();
  });

  it('should throw when not all items exist', async () => {
    mockPrismaService.checklist.findUnique.mockResolvedValue({
      id: 'checklist-1',
      cardId: 'card-1',
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.checklistItem.findMany.mockResolvedValue([
      { id: 'item-1', checklistId: 'checklist-1' },
    ]);

    await expect(
      service.reorderChecklistItems(
        {
          checklistId: 'checklist-1',
          itemPositions: [
            { id: 'item-1', position: 0 },
            { id: 'item-2', position: 1 },
          ],
        },
        mockUser.id,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw when items belong to different checklist', async () => {
    mockPrismaService.checklist.findUnique.mockResolvedValue({
      id: 'checklist-1',
      cardId: 'card-1',
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.checklistItem.findMany.mockResolvedValue([
      { id: 'item-1', checklistId: 'checklist-1' },
      { id: 'item-2', checklistId: 'checklist-2' },
    ]);

    await expect(
      service.reorderChecklistItems(
        {
          checklistId: 'checklist-1',
          itemPositions: [
            { id: 'item-1', position: 0 },
            { id: 'item-2', position: 1 },
          ],
        },
        mockUser.id,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should list checklists by card', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.checklist.findMany.mockResolvedValue([
      { id: 'checklist-1', cardId: 'card-1', items: [] },
    ]);

    const result = await service.findByCard('card-1', mockUser.id);

    expect(result).toHaveLength(1);
    expect(prismaService.checklist.findMany).toHaveBeenCalled();
  });

  it('should find a checklist by id', async () => {
    mockPrismaService.checklist.findUnique.mockResolvedValue({
      id: 'checklist-1',
      cardId: 'card-1',
      items: [],
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    const result = await service.findOne('checklist-1', mockUser.id);

    expect(result.id).toBe('checklist-1');
    expect(prismaService.checklist.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'checklist-1' } }),
    );
  });

  it('should throw when checklist not found', async () => {
    mockPrismaService.checklist.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing', mockUser.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
