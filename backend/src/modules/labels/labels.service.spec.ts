import { Test, TestingModule } from '@nestjs/testing';
import { LabelsService } from './labels.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Visibility } from '@prisma/client';

describe('LabelsService', () => {
  let service: LabelsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    label: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    board: {
      findUnique: jest.fn(),
    },
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
        LabelsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LabelsService>(LabelsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a label', async () => {
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.label.create.mockResolvedValue({
      id: 'label-1',
      boardId: 'board-1',
      name: 'Urgent',
      color: 'red',
    });

    const result = await service.create(
      { boardId: 'board-1', name: 'Urgent', color: 'red' },
      mockUser.id,
    );

    expect(result.id).toBe('label-1');
    expect(prismaService.label.create).toHaveBeenCalled();
  });

  it('should update a label', async () => {
    mockPrismaService.label.findUnique.mockResolvedValue({
      id: 'label-1',
      boardId: 'board-1',
      name: 'Old',
      color: 'red',
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.label.update.mockResolvedValue({
      id: 'label-1',
      boardId: 'board-1',
      name: 'New',
      color: 'blue',
    });

    const result = await service.update(
      { id: 'label-1', name: 'New', color: 'blue' },
      mockUser.id,
    );

    expect(result.name).toBe('New');
    expect(prismaService.label.update).toHaveBeenCalled();
  });

  it('should reject unsupported color', async () => {
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    await expect(
      service.create({ boardId: 'board-1', name: 'Bad', color: 'beige' }, mockUser.id),
    ).rejects.toThrow('Label color is not supported');
  });

  it('should delete a label', async () => {
    mockPrismaService.label.findUnique.mockResolvedValue({
      id: 'label-1',
      boardId: 'board-1',
      name: 'Urgent',
      color: 'red',
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.label.delete.mockResolvedValue({});

    const result = await service.delete('label-1', mockUser.id);

    expect(result).toBe(true);
    expect(prismaService.label.delete).toHaveBeenCalled();
  });
});
