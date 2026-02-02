import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Visibility } from '@prisma/client';

describe('CommentsService', () => {
  let service: CommentsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    comment: {
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
    cardAssignee: {
      findMany: jest.fn(),
    },
    boardMember: {
      findMany: jest.fn(),
    },
  };

  const mockNotificationsService = {
    create: jest.fn().mockResolvedValue({ id: 'notif-1', userId: 'user-1', type: 'COMMENT_ADDED', read: false, createdAt: new Date() }),
  };

  const mockUser = { id: 'user-1' };

  const mockBoard = {
    id: 'board-1',
    visibility: Visibility.PRIVATE,
    members: [{ userId: 'user-1' }],
    workspace: { memberships: [] },
  };

  beforeEach(async () => {
    mockPrismaService.cardAssignee.findMany.mockResolvedValue([]);
    mockPrismaService.boardMember.findMany.mockResolvedValue([]);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a comment', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.comment.create.mockResolvedValue({
      id: 'comment-1',
      cardId: 'card-1',
      authorId: 'user-1',
      content: 'Hello',
    });
    mockPrismaService.cardAssignee.findMany.mockResolvedValue([]);

    const result = await service.create(
      { cardId: 'card-1', content: 'Hello' },
      mockUser.id,
    );

    expect(result.id).toBe('comment-1');
    expect(prismaService.comment.create).toHaveBeenCalled();
  });

  it('should reject empty content', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    await expect(
      service.create({ cardId: 'card-1', content: '   ' }, mockUser.id),
    ).rejects.toThrow('Comment content is required');
  });

  it('should forbid creating comment without access', async () => {
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
      service.create({ cardId: 'card-1', content: 'Hello' }, mockUser.id),
    ).rejects.toThrow('You are not a member of this board');
  });

  it('should throw when board is not found', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(null);

    await expect(
      service.create({ cardId: 'card-1', content: 'Hello' }, mockUser.id),
    ).rejects.toThrow('Board not found');
  });

  it('should throw when creating comment on public board without membership', async () => {
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
      service.create({ cardId: 'card-1', content: 'Hello' }, mockUser.id),
    ).rejects.toThrow('You are not a member of this board');
  });

  it('should throw when creating comment as workspace member but not board member', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue({
      ...mockBoard,
      members: [],
      workspace: { memberships: [{ userId: mockUser.id }] },
    });

    await expect(
      service.create({ cardId: 'card-1', content: 'Hello' }, mockUser.id),
    ).rejects.toThrow('You are not a member of this board');
  });

  it('should get a comment by id', async () => {
    mockPrismaService.comment.findUnique.mockResolvedValue({
      id: 'comment-1',
      cardId: 'card-1',
      authorId: 'user-1',
      content: 'Hello',
      card: { list: { boardId: 'board-1' } },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    const result = await service.findOne('comment-1', mockUser.id);

    expect(result.id).toBe('comment-1');
    expect(prismaService.comment.findUnique).toHaveBeenCalled();
  });

  it('should throw when comment not found', async () => {
    mockPrismaService.comment.findUnique.mockResolvedValue(null);

    await expect(service.findOne('comment-1', mockUser.id)).rejects.toThrow(
      'Comment not found',
    );
  });

  it('should throw when card does not exist', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue(null);

    await expect(service.findByCard('card-1', mockUser.id)).rejects.toThrow(
      'Card not found',
    );
  });

  it('should list comments by card', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.comment.findMany.mockResolvedValue([
      { id: 'comment-1', cardId: 'card-1', authorId: 'user-1', content: 'A' },
      { id: 'comment-2', cardId: 'card-1', authorId: 'user-1', content: 'B' },
    ]);

    const result = await service.findByCard('card-1', mockUser.id);

    expect(result).toHaveLength(2);
    expect(prismaService.comment.findMany).toHaveBeenCalledWith({
      where: { cardId: 'card-1' },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('should forbid listing comments without access', async () => {
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue({
      ...mockBoard,
      members: [],
      workspace: { memberships: [] },
    });

    await expect(service.findByCard('card-1', mockUser.id)).rejects.toThrow(
      'You do not have access to this board',
    );
  });

  it('should update a comment', async () => {
    mockPrismaService.comment.findUnique.mockResolvedValue({
      id: 'comment-1',
      cardId: 'card-1',
      authorId: 'user-1',
      content: 'Old',
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.comment.update.mockResolvedValue({
      id: 'comment-1',
      cardId: 'card-1',
      authorId: 'user-1',
      content: 'New',
    });

    const result = await service.update(
      { id: 'comment-1', content: 'New' },
      mockUser.id,
    );

    expect(result.content).toBe('New');
    expect(prismaService.comment.update).toHaveBeenCalled();
  });

  it('should reject empty content on update', async () => {
    mockPrismaService.comment.findUnique.mockResolvedValue({
      id: 'comment-1',
      cardId: 'card-1',
      authorId: 'user-1',
      content: 'Old',
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    await expect(
      service.update({ id: 'comment-1', content: '   ' }, mockUser.id),
    ).rejects.toThrow('Comment content is required');
  });

  it('should throw when comment not found on update', async () => {
    mockPrismaService.comment.findUnique.mockResolvedValue(null);

    await expect(
      service.update({ id: 'comment-1', content: 'New' }, mockUser.id),
    ).rejects.toThrow('Comment not found');
  });

  it('should prevent updating others comments', async () => {
    mockPrismaService.comment.findUnique.mockResolvedValue({
      id: 'comment-1',
      cardId: 'card-1',
      authorId: 'user-2',
      content: 'Old',
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    await expect(
      service.update({ id: 'comment-1', content: 'New' }, mockUser.id),
    ).rejects.toThrow('You can only edit your own comments');
  });

  it('should delete a comment', async () => {
    mockPrismaService.comment.findUnique.mockResolvedValue({
      id: 'comment-1',
      cardId: 'card-1',
      authorId: 'user-1',
      content: 'Old',
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
    mockPrismaService.comment.delete.mockResolvedValue({});

    const result = await service.delete('comment-1', mockUser.id);

    expect(result).toBe(true);
    expect(prismaService.comment.delete).toHaveBeenCalled();
  });

  it('should throw when comment not found on delete', async () => {
    mockPrismaService.comment.findUnique.mockResolvedValue(null);

    await expect(service.delete('comment-1', mockUser.id)).rejects.toThrow(
      'Comment not found',
    );
  });

  it('should prevent deleting others comments', async () => {
    mockPrismaService.comment.findUnique.mockResolvedValue({
      id: 'comment-1',
      cardId: 'card-1',
      authorId: 'user-2',
      content: 'Old',
    });
    mockPrismaService.card.findUnique.mockResolvedValue({
      id: 'card-1',
      list: { boardId: 'board-1' },
    });
    mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

    await expect(service.delete('comment-1', mockUser.id)).rejects.toThrow(
      'You can only delete your own comments',
    );
  });
});
