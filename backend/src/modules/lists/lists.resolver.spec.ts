import { Test, TestingModule } from '@nestjs/testing';
import { ListsResolver } from './lists.resolver';
import { ListsService } from './lists.service';

describe('ListsResolver', () => {
  let resolver: ListsResolver;
  let service: ListsService;

  const mockListsService = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    reorder: jest.fn(),
    archive: jest.fn(),
    unarchive: jest.fn(),
    findArchivedByBoardId: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockList = {
    id: 'list-1',
    boardId: 'board-1',
    title: 'Test List',
    position: 0,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListsResolver,
        {
          provide: ListsService,
          useValue: mockListsService,
        },
      ],
    }).compile();

    resolver = module.get<ListsResolver>(ListsResolver);
    service = module.get<ListsService>(ListsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createList', () => {
    it('should create a list', async () => {
      const input = {
        boardId: 'board-1',
        title: 'New List',
      };

      mockListsService.create.mockResolvedValue(mockList);

      const result = await resolver.createList(input, mockUser);

      expect(result).toEqual(mockList);
      expect(service.create).toHaveBeenCalledWith(input, mockUser.id);
    });
  });

  describe('list', () => {
    it('should return a list by id', async () => {
      mockListsService.findOne.mockResolvedValue(mockList);

      const result = await resolver.list('list-1', mockUser);

      expect(result).toEqual(mockList);
      expect(service.findOne).toHaveBeenCalledWith('list-1', mockUser.id);
    });
  });

  describe('updateList', () => {
    it('should update a list', async () => {
      const input = {
        id: 'list-1',
        title: 'Updated List',
      };

      const updatedList = {
        ...mockList,
        title: 'Updated List',
      };

      mockListsService.update.mockResolvedValue(updatedList);

      const result = await resolver.updateList(input, mockUser);

      expect(result).toEqual(updatedList);
      expect(service.update).toHaveBeenCalledWith(input, mockUser.id);
    });
  });

  describe('deleteList', () => {
    it('should delete a list', async () => {
      mockListsService.delete.mockResolvedValue(true);

      const result = await resolver.deleteList('list-1', mockUser);

      expect(result).toBe(true);
      expect(service.delete).toHaveBeenCalledWith('list-1', mockUser.id);
    });
  });

  describe('reorderLists', () => {
    it('should reorder lists', async () => {
      const input = {
        boardId: 'board-1',
        listPositions: [
          { id: 'list-1', position: 0 },
          { id: 'list-2', position: 1 },
        ],
      };

      const reorderedLists = [
        { ...mockList, id: 'list-1', position: 0 },
        { ...mockList, id: 'list-2', position: 1 },
      ];

      mockListsService.reorder.mockResolvedValue(reorderedLists);

      const result = await resolver.reorderLists(input, mockUser);

      expect(result).toEqual(reorderedLists);
      expect(service.reorder).toHaveBeenCalledWith(input, mockUser.id);
    });
  });

  describe('archiveList', () => {
    it('should archive a list', async () => {
      const archivedList = {
        ...mockList,
        isArchived: true,
      };

      mockListsService.archive.mockResolvedValue(archivedList);

      const result = await resolver.archiveList('list-1', mockUser);

      expect(result).toEqual(archivedList);
      expect(result.isArchived).toBe(true);
      expect(service.archive).toHaveBeenCalledWith('list-1', mockUser.id);
    });
  });

  describe('unarchiveList', () => {
    it('should unarchive a list', async () => {
      const unarchivedList = {
        ...mockList,
        isArchived: false,
      };

      mockListsService.unarchive.mockResolvedValue(unarchivedList);

      const result = await resolver.unarchiveList('list-1', mockUser);

      expect(result).toEqual(unarchivedList);
      expect(result.isArchived).toBe(false);
      expect(service.unarchive).toHaveBeenCalledWith('list-1', mockUser.id);
    });
  });

  describe('archivedLists', () => {
    it('should return archived lists for a board', async () => {
      const archivedList = { ...mockList, isArchived: true };
      mockListsService.findArchivedByBoardId.mockResolvedValue([archivedList]);

      const result = await resolver.archivedLists('board-1', mockUser);

      expect(result).toHaveLength(1);
      expect(result[0].isArchived).toBe(true);
      expect(service.findArchivedByBoardId).toHaveBeenCalledWith('board-1', mockUser.id);
    });
  });
});
