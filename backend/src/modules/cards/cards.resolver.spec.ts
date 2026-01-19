import { Test, TestingModule } from '@nestjs/testing';
import { CardsResolver } from './cards.resolver';
import { CardsService } from './cards.service';
import { CardsDataLoader } from './dataloaders/cards.dataloader';

describe('CardsResolver', () => {
  let resolver: CardsResolver;
  let service: CardsService;

  const mockCardsService = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    move: jest.fn(),
    reorder: jest.fn(),
    assignMember: jest.fn(),
    unassignMember: jest.fn(),
    addLabelToCard: jest.fn(),
    removeLabelFromCard: jest.fn(),
  };

  const mockLabelsLoader = {
    load: jest.fn(),
  };

  const mockChecklistsLoader = {
    load: jest.fn(),
  };

  const mockCardsDataLoader = {
    createLabelsByCardLoader: jest.fn(() => mockLabelsLoader),
    createChecklistsByCardLoader: jest.fn(() => mockChecklistsLoader),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockCard = {
    id: 'card-1',
    listId: 'list-1',
    title: 'Test Card',
    description: null,
    coverUrl: null,
    startDate: null,
    dueDate: null,
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsResolver,
        {
          provide: CardsService,
          useValue: mockCardsService,
        },
        {
          provide: CardsDataLoader,
          useValue: mockCardsDataLoader,
        },
      ],
    }).compile();

    resolver = module.get<CardsResolver>(CardsResolver);
    service = module.get<CardsService>(CardsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createCard', () => {
    it('should create a card', async () => {
      const input = {
        listId: 'list-1',
        title: 'New Card',
      };

      mockCardsService.create.mockResolvedValue(mockCard);

      const result = await resolver.createCard(input, mockUser);

      expect(result).toEqual(mockCard);
      expect(service.create).toHaveBeenCalledWith(input, mockUser.id);
    });
  });

  describe('card', () => {
    it('should return a card by id', async () => {
      mockCardsService.findOne.mockResolvedValue(mockCard);

      const result = await resolver.card('card-1', mockUser);

      expect(result).toEqual(mockCard);
      expect(service.findOne).toHaveBeenCalledWith('card-1', mockUser.id);
    });
  });

  describe('updateCard', () => {
    it('should update a card', async () => {
      const input = {
        id: 'card-1',
        title: 'Updated Card',
      };

      const updatedCard = {
        ...mockCard,
        title: 'Updated Card',
      };

      mockCardsService.update.mockResolvedValue(updatedCard);

      const result = await resolver.updateCard(input, mockUser);

      expect(result).toEqual(updatedCard);
      expect(service.update).toHaveBeenCalledWith(input, mockUser.id);
    });
  });

  describe('deleteCard', () => {
    it('should delete a card', async () => {
      mockCardsService.delete.mockResolvedValue(true);

      const result = await resolver.deleteCard('card-1', mockUser);

      expect(result).toBe(true);
      expect(service.delete).toHaveBeenCalledWith('card-1', mockUser.id);
    });
  });

  describe('moveCard', () => {
    it('should move a card', async () => {
      const input = {
        cardId: 'card-1',
        targetListId: 'list-2',
      };

      const movedCard = {
        ...mockCard,
        listId: 'list-2',
      };

      mockCardsService.move.mockResolvedValue(movedCard);

      const result = await resolver.moveCard(input, mockUser);

      expect(result).toEqual(movedCard);
      expect(result.listId).toBe('list-2');
      expect(service.move).toHaveBeenCalledWith(input, mockUser.id);
    });
  });

  describe('reorderCards', () => {
    it('should reorder cards', async () => {
      const input = {
        listId: 'list-1',
        cardPositions: [
          { id: 'card-1', position: 0 },
          { id: 'card-2', position: 1 },
        ],
      };

      const reorderedCards = [
        { ...mockCard, id: 'card-1', position: 0 },
        { ...mockCard, id: 'card-2', position: 1 },
      ];

      mockCardsService.reorder.mockResolvedValue(reorderedCards);

      const result = await resolver.reorderCards(input, mockUser);

      expect(result).toEqual(reorderedCards);
      expect(service.reorder).toHaveBeenCalledWith(input, mockUser.id);
    });
  });

  describe('assignMemberToCard', () => {
    it('should assign a member to a card', async () => {
      const input = {
        cardId: 'card-1',
        userId: 'user-2',
      };

      mockCardsService.assignMember.mockResolvedValue(mockCard);

      const result = await resolver.assignMemberToCard(input, mockUser);

      expect(result).toEqual(mockCard);
      expect(service.assignMember).toHaveBeenCalledWith(input, mockUser.id);
    });
  });

  describe('unassignMemberFromCard', () => {
    it('should unassign a member from a card', async () => {
      const input = {
        cardId: 'card-1',
        userId: 'user-2',
      };

      mockCardsService.unassignMember.mockResolvedValue(mockCard);

      const result = await resolver.unassignMemberFromCard(input, mockUser);

      expect(result).toEqual(mockCard);
      expect(service.unassignMember).toHaveBeenCalledWith(input, mockUser.id);
    });
  });

  describe('addLabelToCard', () => {
    it('should add a label to a card', async () => {
      const input = {
        cardId: 'card-1',
        labelId: 'label-1',
      };

      mockCardsService.addLabelToCard.mockResolvedValue(mockCard);

      const result = await resolver.addLabelToCard(input, mockUser);

      expect(result).toEqual(mockCard);
      expect(service.addLabelToCard).toHaveBeenCalledWith('card-1', 'label-1', mockUser.id);
    });
  });

  describe('removeLabelFromCard', () => {
    it('should remove a label from a card', async () => {
      const input = {
        cardId: 'card-1',
        labelId: 'label-1',
      };

      mockCardsService.removeLabelFromCard.mockResolvedValue(mockCard);

      const result = await resolver.removeLabelFromCard(input, mockUser);

      expect(result).toEqual(mockCard);
      expect(service.removeLabelFromCard).toHaveBeenCalledWith('card-1', 'label-1', mockUser.id);
    });
  });

  describe('labels', () => {
    it('should resolve labels for a card', async () => {
      mockLabelsLoader.load.mockResolvedValue([{ id: 'label-1' }]);

      const result = await resolver.labels(mockCard as any);

      expect(result).toHaveLength(1);
      expect(mockLabelsLoader.load).toHaveBeenCalledWith('card-1');
    });
  });

  describe('checklists', () => {
    it('should resolve checklists for a card', async () => {
      mockChecklistsLoader.load.mockResolvedValue([{ id: 'checklist-1' }]);

      const result = await resolver.checklists(mockCard as any);

      expect(result).toHaveLength(1);
      expect(mockChecklistsLoader.load).toHaveBeenCalledWith('card-1');
    });
  });
});
