import { Test, TestingModule } from '@nestjs/testing';
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
});
