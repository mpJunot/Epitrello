import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsResolver } from './attachments.resolver';
import { AttachmentsService } from './attachments.service';
import { AttachmentsDataLoader } from './dataloaders/attachments.dataloader';

describe('AttachmentsResolver', () => {
  let resolver: AttachmentsResolver;
  let service: AttachmentsService;

  const mockAttachmentsService = {
    findOne: jest.fn(),
    findByCard: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const usersLoader = {
    load: jest.fn(),
  };

  const mockAttachmentsDataLoader = {
    createUsersByIdLoader: jest.fn().mockReturnValue(usersLoader),
  };

  const mockUser = { id: 'user-1' };

  const mockAttachment = {
    id: 'attachment-1',
    cardId: 'card-1',
    uploaderId: 'user-1',
    url: 'https://example.com/file.png',
    filename: 'file.png',
    size: 42,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentsResolver,
        {
          provide: AttachmentsService,
          useValue: mockAttachmentsService,
        },
        {
          provide: AttachmentsDataLoader,
          useValue: mockAttachmentsDataLoader,
        },
      ],
    }).compile();

    resolver = module.get<AttachmentsResolver>(AttachmentsResolver);
    service = module.get<AttachmentsService>(AttachmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should initialize dataloader on construction', () => {
    expect(mockAttachmentsDataLoader.createUsersByIdLoader).toHaveBeenCalled();
  });

  it('should get an attachment', async () => {
    mockAttachmentsService.findOne.mockResolvedValue(mockAttachment);

    const result = await resolver.attachment('attachment-1', mockUser);

    expect(result).toEqual(mockAttachment);
    expect(service.findOne).toHaveBeenCalledWith('attachment-1', mockUser.id);
  });

  it('should list card attachments', async () => {
    mockAttachmentsService.findByCard.mockResolvedValue([mockAttachment]);

    const result = await resolver.cardAttachments('card-1', mockUser);

    expect(result).toHaveLength(1);
    expect(service.findByCard).toHaveBeenCalledWith('card-1', mockUser.id);
  });

  it('should create an attachment', async () => {
    mockAttachmentsService.create.mockResolvedValue(mockAttachment);

    const result = await resolver.createAttachment(
      {
        cardId: 'card-1',
        url: 'https://example.com/file.png',
        filename: 'file.png',
        size: 42,
      },
      mockUser,
    );

    expect(result).toEqual(mockAttachment);
    expect(service.create).toHaveBeenCalledWith(
      {
        cardId: 'card-1',
        url: 'https://example.com/file.png',
        filename: 'file.png',
        size: 42,
      },
      mockUser.id,
    );
  });

  it('should create an attachment with size 0 for link', async () => {
    const linkAttachment = { ...mockAttachment, url: 'https://example.com', size: 0 };
    mockAttachmentsService.create.mockResolvedValue(linkAttachment);

    const result = await resolver.createAttachment(
      {
        cardId: 'card-1',
        url: 'https://example.com',
        filename: 'Link',
        size: 0,
      },
      mockUser,
    );

    expect(result.size).toBe(0);
    expect(service.create).toHaveBeenCalledWith(
      { cardId: 'card-1', url: 'https://example.com', filename: 'Link', size: 0 },
      mockUser.id,
    );
  });

  it('should update an attachment', async () => {
    mockAttachmentsService.update.mockResolvedValue(mockAttachment);

    const result = await resolver.updateAttachment(
      { id: 'attachment-1', filename: 'updated.png' },
      mockUser,
    );

    expect(result).toEqual(mockAttachment);
    expect(service.update).toHaveBeenCalledWith(
      { id: 'attachment-1', filename: 'updated.png' },
      mockUser.id,
    );
  });

  it('should delete an attachment', async () => {
    mockAttachmentsService.delete.mockResolvedValue(true);

    const result = await resolver.deleteAttachment('attachment-1', mockUser);

    expect(result).toBe(true);
    expect(service.delete).toHaveBeenCalledWith('attachment-1', mockUser.id);
  });

  it('should resolve uploader using dataloader', async () => {
    usersLoader.load.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await resolver.uploader(mockAttachment);

    expect(result?.id).toBe('user-1');
    expect(usersLoader.load).toHaveBeenCalledWith('user-1');
  });

  it('should resolve uploader as null when loader returns null', async () => {
    usersLoader.load.mockResolvedValue(null);

    const result = await resolver.uploader(mockAttachment);

    expect(result).toBeNull();
    expect(usersLoader.load).toHaveBeenCalledWith('user-1');
  });
});
