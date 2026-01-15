import { Test, TestingModule } from '@nestjs/testing';
import { CommentsResolver } from './comments.resolver';
import { CommentsService } from './comments.service';
import { CommentsDataLoader } from './dataloaders/comments.dataloader';

describe('CommentsResolver', () => {
  let resolver: CommentsResolver;
  let service: CommentsService;

  const mockCommentsService = {
    findOne: jest.fn(),
    findByCard: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const usersLoader = {
    load: jest.fn(),
  };

  const mockCommentsDataLoader = {
    createUsersByIdLoader: jest.fn().mockReturnValue(usersLoader),
  };

  const mockUser = { id: 'user-1' };

  const mockComment = {
    id: 'comment-1',
    cardId: 'card-1',
    authorId: 'user-1',
    content: 'Hello',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsResolver,
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
        {
          provide: CommentsDataLoader,
          useValue: mockCommentsDataLoader,
        },
      ],
    }).compile();

    resolver = module.get<CommentsResolver>(CommentsResolver);
    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should initialize dataloader on construction', () => {
    expect(mockCommentsDataLoader.createUsersByIdLoader).toHaveBeenCalled();
  });

  it('should get a comment', async () => {
    mockCommentsService.findOne.mockResolvedValue(mockComment);

    const result = await resolver.comment('comment-1', mockUser);

    expect(result).toEqual(mockComment);
    expect(service.findOne).toHaveBeenCalledWith('comment-1', mockUser.id);
  });

  it('should list card comments', async () => {
    mockCommentsService.findByCard.mockResolvedValue([mockComment]);

    const result = await resolver.cardComments('card-1', mockUser);

    expect(result).toHaveLength(1);
    expect(service.findByCard).toHaveBeenCalledWith('card-1', mockUser.id);
  });

  it('should create a comment', async () => {
    mockCommentsService.create.mockResolvedValue(mockComment);

    const result = await resolver.createComment(
      { cardId: 'card-1', content: 'Hello' },
      mockUser,
    );

    expect(result).toEqual(mockComment);
    expect(service.create).toHaveBeenCalledWith(
      { cardId: 'card-1', content: 'Hello' },
      mockUser.id,
    );
  });

  it('should update a comment', async () => {
    mockCommentsService.update.mockResolvedValue(mockComment);

    const result = await resolver.updateComment(
      { id: 'comment-1', content: 'Updated' },
      mockUser,
    );

    expect(result).toEqual(mockComment);
    expect(service.update).toHaveBeenCalledWith(
      { id: 'comment-1', content: 'Updated' },
      mockUser.id,
    );
  });

  it('should delete a comment', async () => {
    mockCommentsService.delete.mockResolvedValue(true);

    const result = await resolver.deleteComment('comment-1', mockUser);

    expect(result).toBe(true);
    expect(service.delete).toHaveBeenCalledWith('comment-1', mockUser.id);
  });

  it('should resolve comment author using dataloader', async () => {
    usersLoader.load.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await resolver.author(mockComment);

    expect(result?.id).toBe('user-1');
    expect(usersLoader.load).toHaveBeenCalledWith('user-1');
  });
});
