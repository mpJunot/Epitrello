import { Test, TestingModule } from '@nestjs/testing';
import { ChecklistsResolver } from './checklists.resolver';
import { ChecklistsService } from './checklists.service';

describe('ChecklistsResolver', () => {
  let resolver: ChecklistsResolver;
  let service: ChecklistsService;

  const mockChecklistsService = {
    findOne: jest.fn(),
    findByCard: jest.fn(),
    createChecklist: jest.fn(),
    updateChecklist: jest.fn(),
    deleteChecklist: jest.fn(),
    addChecklistItem: jest.fn(),
    updateChecklistItem: jest.fn(),
    deleteChecklistItem: jest.fn(),
    reorderChecklistItems: jest.fn(),
  };

  const mockUser = { id: 'user-1' };

  const mockChecklist = {
    id: 'checklist-1',
    cardId: 'card-1',
    title: 'Checklist',
    items: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChecklistsResolver,
        {
          provide: ChecklistsService,
          useValue: mockChecklistsService,
        },
      ],
    }).compile();

    resolver = module.get<ChecklistsResolver>(ChecklistsResolver);
    service = module.get<ChecklistsService>(ChecklistsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should get a checklist', async () => {
    mockChecklistsService.findOne.mockResolvedValue(mockChecklist);

    const result = await resolver.checklist('checklist-1', mockUser);

    expect(result).toEqual(mockChecklist);
    expect(service.findOne).toHaveBeenCalledWith('checklist-1', mockUser.id);
  });

  it('should list card checklists', async () => {
    mockChecklistsService.findByCard.mockResolvedValue([mockChecklist]);

    const result = await resolver.cardChecklists('card-1', mockUser);

    expect(result).toHaveLength(1);
    expect(service.findByCard).toHaveBeenCalledWith('card-1', mockUser.id);
  });
});
