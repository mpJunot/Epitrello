import { CommentsDataLoader } from './comments.dataloader';
import { PrismaService } from '../../../prisma/prisma.service';

jest.mock('dataloader', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((batchFn) => ({
    loadMany: (keys: readonly string[]) => Promise.resolve(batchFn(keys)),
  })),
}));

describe('CommentsDataLoader', () => {
  let dataloader: CommentsDataLoader;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    prisma = mockPrismaService as unknown as PrismaService;
    dataloader = new CommentsDataLoader(prisma);
    jest.clearAllMocks();
  });

  it('should load users by ids', async () => {
    mockPrismaService.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        email: 'one@example.com',
        name: 'One',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user-2',
        email: 'two@example.com',
        name: 'Two',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const loader = dataloader.createUsersByIdLoader();
    const result = (await loader.loadMany(['user-1', 'user-2'])) as Array<
      { id: string } | null
    >;

    expect(result[0]?.id).toBe('user-1');
    expect(result[1]?.id).toBe('user-2');
    expect(mockPrismaService.user.findMany).toHaveBeenCalled();
  });
});
