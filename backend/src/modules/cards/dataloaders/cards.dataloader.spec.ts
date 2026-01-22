import { CardsDataLoader } from './cards.dataloader';
import { PrismaService } from '../../../prisma/prisma.service';

jest.mock('dataloader', () => {
  return jest.fn().mockImplementation((batchFn) => ({
    load: jest.fn((key: string) => Promise.resolve(batchFn([key])[0])),
    loadMany: jest.fn((keys: readonly string[]) => Promise.resolve(batchFn(keys))),
  }));
});

describe('CardsDataLoader', () => {
  let dataloader: CardsDataLoader;
  let prisma: PrismaService;

  const mockPrismaService = {
    card: {
      findMany: jest.fn(),
    },
    cardAssignee: {
      findMany: jest.fn(),
    },
    cardLabel: {
      findMany: jest.fn(),
    },
    checklist: {
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    prisma = mockPrismaService as unknown as PrismaService;
    dataloader = new CardsDataLoader(prisma);
    jest.clearAllMocks();
  });

  it('should create cards by list loader', async () => {
    mockPrismaService.card.findMany.mockResolvedValue([
      { id: 'card-1', listId: 'list-1', position: 0 },
      { id: 'card-2', listId: 'list-2', position: 1 },
    ]);

    const loader = dataloader.createCardsByListLoader();
    const result = await loader.loadMany(['list-1', 'list-2']);

    expect(result[0]).toHaveLength(1);
    expect(result[1]).toHaveLength(1);
    expect(mockPrismaService.card.findMany).toHaveBeenCalled();
  });

  it('should create assignees by card loader', async () => {
    mockPrismaService.cardAssignee.findMany.mockResolvedValue([
      { cardId: 'card-1', user: { id: 'user-1' } },
      { cardId: 'card-2', user: { id: 'user-2' } },
    ]);

    const loader = dataloader.createAssigneesByCardLoader();
    const result = await loader.loadMany(['card-1', 'card-2']);

    expect(result[0]).toHaveLength(1);
    expect(result[1]).toHaveLength(1);
    expect(mockPrismaService.cardAssignee.findMany).toHaveBeenCalled();
  });

  it('should create labels by card loader', async () => {
    mockPrismaService.cardLabel.findMany.mockResolvedValue([
      { cardId: 'card-1', label: { id: 'label-1' } },
      { cardId: 'card-2', label: { id: 'label-2' } },
    ]);

    const loader = dataloader.createLabelsByCardLoader();
    const result = await loader.loadMany(['card-1', 'card-2']);

    expect(result[0]).toHaveLength(1);
    expect(result[1]).toHaveLength(1);
    expect(mockPrismaService.cardLabel.findMany).toHaveBeenCalled();
  });

  it('should create checklists by card loader', async () => {
    mockPrismaService.checklist.findMany.mockResolvedValue([
      { id: 'checklist-1', cardId: 'card-1', items: [] },
      { id: 'checklist-2', cardId: 'card-2', items: [] },
    ]);

    const loader = dataloader.createChecklistsByCardLoader();
    const result = await loader.loadMany(['card-1', 'card-2']);

    expect(result[0]).toHaveLength(1);
    expect(result[1]).toHaveLength(1);
    expect(mockPrismaService.checklist.findMany).toHaveBeenCalled();
  });
});
