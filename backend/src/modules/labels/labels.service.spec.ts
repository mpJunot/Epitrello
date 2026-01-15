import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
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

  it('should reject missing color', async () => {
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    await expect(
      service.create({ boardId: 'board-1', name: 'No color' } as any, mockUser.id),
    ).rejects.toBeInstanceOf(BadRequestException);
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

  it('should reject update with unsupported color', async () => {
    mockPrismaService.label.findUnique.mockResolvedValue({
      id: 'label-1',
      boardId: 'board-1',
      name: 'Old',
      color: 'red',
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    await expect(
      service.update({ id: 'label-1', color: 'beige' }, mockUser.id),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw when label does not exist on update', async () => {
    mockPrismaService.label.findUnique.mockResolvedValue(null);

    await expect(
      service.update({ id: 'missing', name: 'New' }, mockUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw when board does not exist', async () => {
    mockPrismaService.board.findUnique.mockResolvedValue(null);

    await expect(
      service.create({ boardId: 'missing', name: 'Label', color: 'red' }, mockUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw when user has no access to board', async () => {
    mockPrismaService.board.findUnique.mockResolvedValue({
      ...mockBoard,
      members: [],
      workspace: { memberships: [] },
    });

    await expect(
      service.create({ boardId: 'board-1', name: 'Label', color: 'red' }, mockUser.id),
    ).rejects.toBeInstanceOf(ForbiddenException);
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

  it('should throw when deleting missing label', async () => {
    mockPrismaService.label.findUnique.mockResolvedValue(null);

    await expect(service.delete('missing', mockUser.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should list labels by board', async () => {
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.label.findMany.mockResolvedValue([
      { id: 'label-1', boardId: 'board-1', name: 'Urgent', color: 'red' },
    ]);

    const result = await service.findByBoard('board-1', mockUser.id);

    expect(result).toHaveLength(1);
    expect(prismaService.label.findMany).toHaveBeenCalled();
  });
});
