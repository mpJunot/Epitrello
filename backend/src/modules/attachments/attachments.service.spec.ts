import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsService } from './attachments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Visibility } from '@prisma/client';

describe('AttachmentsService', () => {
  let service: AttachmentsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    attachment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    card: {
      findUnique: jest.fn(),
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
        AttachmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AttachmentsService>(AttachmentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an attachment', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.attachment.create.mockResolvedValue({
      id: 'attachment-1',
      cardId: 'card-1',
      uploaderId: 'user-1',
      url: 'https://example.com/file.png',
      filename: 'file.png',
      size: 42,
    });

    const result = await service.create(
      {
        cardId: 'card-1',
        url: 'https://example.com/file.png',
        filename: 'file.png',
        size: 42,
      },
      mockUser.id,
    );

    expect(result.id).toBe('attachment-1');
    expect(prismaService.attachment.create).toHaveBeenCalled();
  });

  it('should reject empty url', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    await expect(
      service.create(
        {
          cardId: 'card-1',
          url: '   ',
          filename: 'file.png',
          size: 42,
        },
        mockUser.id,
      ),
    ).rejects.toThrow('Attachment url is required');
  });

  it('should reject empty filename', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    await expect(
      service.create(
        {
          cardId: 'card-1',
          url: 'https://example.com/file.png',
          filename: '   ',
          size: 42,
        },
        mockUser.id,
      ),
    ).rejects.toThrow('Attachment filename is required');
  });

  it('should reject invalid size', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    await expect(
      service.create(
        {
          cardId: 'card-1',
          url: 'https://example.com/file.png',
          filename: 'file.png',
          size: 0,
        },
        mockUser.id,
      ),
    ).rejects.toThrow('Attachment size must be a positive number');
  });

  it('should throw when card does not exist', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue(null);

    await expect(
      service.create(
        {
          cardId: 'card-1',
          url: 'https://example.com/file.png',
          filename: 'file.png',
          size: 42,
        },
        mockUser.id,
      ),
    ).rejects.toThrow('Card not found');
  });

  it('should throw when creating attachment on public board without membership', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue({
      ...mockBoard,
      visibility: Visibility.PUBLIC,
      members: [],
      workspace: null,
    });

    await expect(
      service.create(
        {
          cardId: 'card-1',
          url: 'https://example.com/file.png',
          filename: 'file.png',
          size: 42,
        },
        mockUser.id,
      ),
    ).rejects.toThrow('You are not a member of this board');
  });

  it('should forbid creating attachment without board membership', async () => {
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
      service.create(
        {
          cardId: 'card-1',
          url: 'https://example.com/file.png',
          filename: 'file.png',
          size: 42,
        },
        mockUser.id,
      ),
    ).rejects.toThrow('You are not a member of this board');
  });

  it('should get attachment by id', async () => {
    mockPrismaService.attachment.findUnique.mockResolvedValue({
      id: 'attachment-1',
      cardId: 'card-1',
      uploaderId: 'user-1',
      url: 'https://example.com/file.png',
      filename: 'file.png',
      size: 42,
      card: { list: { boardId: 'board-1' } },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    const result = await service.findOne('attachment-1', mockUser.id);

    expect(result.id).toBe('attachment-1');
  });

  it('should throw when attachment not found', async () => {
    mockPrismaService.attachment.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing', mockUser.id)).rejects.toThrow('Attachment not found');
  });

  it('should list attachments by card', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.attachment.findMany.mockResolvedValue([
      {
        id: 'attachment-1',
        cardId: 'card-1',
        uploaderId: 'user-1',
        url: 'https://example.com/a.png',
        filename: 'a.png',
        size: 10,
      },
    ]);

    const result = await service.findByCard('card-1', mockUser.id);

    expect(result).toHaveLength(1);
    expect(prismaService.attachment.findMany).toHaveBeenCalledWith({
      where: { cardId: 'card-1' },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('should update an attachment', async () => {
    mockPrismaService.attachment.findUnique.mockResolvedValue({
      id: 'attachment-1',
      cardId: 'card-1',
      uploaderId: 'user-1',
      url: 'https://example.com/file.png',
      filename: 'file.png',
      size: 42,
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.attachment.update.mockResolvedValue({
      id: 'attachment-1',
      cardId: 'card-1',
      uploaderId: 'user-1',
      url: 'https://example.com/updated.png',
      filename: 'updated.png',
      size: 100,
    });

    const result = await service.update(
      {
        id: 'attachment-1',
        url: 'https://example.com/updated.png',
        filename: 'updated.png',
        size: 100,
      },
      mockUser.id,
    );

    expect(result.filename).toBe('updated.png');
    expect(prismaService.attachment.update).toHaveBeenCalled();
  });

  it('should prevent updating others attachments', async () => {
    mockPrismaService.attachment.findUnique.mockResolvedValue({
      id: 'attachment-1',
      cardId: 'card-1',
      uploaderId: 'user-2',
      url: 'https://example.com/file.png',
      filename: 'file.png',
      size: 42,
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    await expect(
      service.update({ id: 'attachment-1', filename: 'x.png' }, mockUser.id),
    ).rejects.toThrow('You can only edit your own attachments');
  });

  it('should reject invalid size on update', async () => {
    mockPrismaService.attachment.findUnique.mockResolvedValue({
      id: 'attachment-1',
      cardId: 'card-1',
      uploaderId: 'user-1',
      url: 'https://example.com/file.png',
      filename: 'file.png',
      size: 42,
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    await expect(
      service.update({ id: 'attachment-1', size: 0 }, mockUser.id),
    ).rejects.toThrow('Attachment size must be a positive number');
  });

  it('should delete an attachment', async () => {
    mockPrismaService.attachment.findUnique.mockResolvedValue({
      id: 'attachment-1',
      cardId: 'card-1',
      uploaderId: 'user-1',
      url: 'https://example.com/file.png',
      filename: 'file.png',
      size: 42,
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.attachment.delete.mockResolvedValue({});

    const result = await service.delete('attachment-1', mockUser.id);

    expect(result).toBe(true);
    expect(prismaService.attachment.delete).toHaveBeenCalled();
  });

  it('should throw when deleting missing attachment', async () => {
    mockPrismaService.attachment.findUnique.mockResolvedValue(null);

    await expect(service.delete('missing', mockUser.id)).rejects.toThrow('Attachment not found');
  });

  it('should forbid deleting attachments from another user', async () => {
    mockPrismaService.attachment.findUnique.mockResolvedValue({
      id: 'attachment-1',
      cardId: 'card-1',
      uploaderId: 'user-2',
      url: 'https://example.com/file.png',
      filename: 'file.png',
      size: 42,
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    await expect(service.delete('attachment-1', mockUser.id)).rejects.toThrow(
      'You can only delete your own attachments',
    );
  });
});
