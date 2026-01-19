import { Test, TestingModule } from '@nestjs/testing';
import { LabelsResolver } from './labels.resolver';
import { LabelsService } from './labels.service';

describe('LabelsResolver', () => {
  let resolver: LabelsResolver;
  let service: LabelsService;

  const mockLabelsService = {
    findByBoard: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUser = { id: 'user-1' };

  const mockLabel = {
    id: 'label-1',
    boardId: 'board-1',
    name: 'Urgent',
    color: 'red',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabelsResolver,
        {
          provide: LabelsService,
          useValue: mockLabelsService,
        },
      ],
    }).compile();

    resolver = module.get<LabelsResolver>(LabelsResolver);
    service = module.get<LabelsService>(LabelsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should list board labels', async () => {
    mockLabelsService.findByBoard.mockResolvedValue([mockLabel]);

    const result = await resolver.boardLabels('board-1', mockUser);

    expect(result).toHaveLength(1);
    expect(service.findByBoard).toHaveBeenCalledWith('board-1', mockUser.id);
  });

  it('should create a label', async () => {
    mockLabelsService.create.mockResolvedValue(mockLabel);

    const result = await resolver.createLabel(
      { boardId: 'board-1', name: 'Urgent', color: 'red' },
      mockUser,
    );

    expect(result).toEqual(mockLabel);
    expect(service.create).toHaveBeenCalled();
  });

  it('should update a label', async () => {
    mockLabelsService.update.mockResolvedValue(mockLabel);

    const result = await resolver.updateLabel(
      { id: 'label-1', name: 'Updated', color: 'blue' },
      mockUser,
    );

    expect(result).toEqual(mockLabel);
    expect(service.update).toHaveBeenCalled();
  });

  it('should delete a label', async () => {
    mockLabelsService.delete.mockResolvedValue(true);

    const result = await resolver.deleteLabel('label-1', mockUser);

    expect(result).toBe(true);
    expect(service.delete).toHaveBeenCalledWith('label-1', mockUser.id);
  });
});
