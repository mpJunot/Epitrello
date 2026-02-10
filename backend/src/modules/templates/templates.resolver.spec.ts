import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesResolver } from './templates.resolver';
import { TemplatesService } from './templates.service';

describe('TemplatesResolver', () => {
  let resolver: TemplatesResolver;

  const mockTemplate = {
    id: 'tpl-1',
    name: 'My Template',
    description: 'Description',
    lists: [{ title: 'To Do', position: 0 }, { title: 'Done', position: 1 }],
    creatorId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTemplatesService = {
    create: jest.fn(),
    createFromBoard: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUser = { id: 'user-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesResolver,
        { provide: TemplatesService, useValue: mockTemplatesService },
      ],
    }).compile();

    resolver = module.get<TemplatesResolver>(TemplatesResolver);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('template', () => {
    it('should return a template by id', async () => {
      mockTemplatesService.findOne.mockResolvedValue(mockTemplate);

      const result = await resolver.template('tpl-1', mockUser);

      expect(result).toEqual(mockTemplate);
      expect(mockTemplatesService.findOne).toHaveBeenCalledWith('tpl-1', mockUser.id);
    });
  });

  describe('templates', () => {
    it('should return templates list', async () => {
      mockTemplatesService.findAll.mockResolvedValue([mockTemplate]);

      const result = await resolver.templates(null, mockUser);

      expect(result).toHaveLength(1);
      expect(mockTemplatesService.findAll).toHaveBeenCalledWith(null, mockUser.id);
    });
  });

  describe('createTemplate', () => {
    it('should create a template', async () => {
      mockTemplatesService.create.mockResolvedValue(mockTemplate);

      const input = {
        name: 'My Template',
        description: 'Description',
        lists: [{ title: 'To Do', position: 0 }, { title: 'Done', position: 1 }],
      };

      const result = await resolver.createTemplate(input, mockUser);

      expect(result).toEqual(mockTemplate);
      expect(mockTemplatesService.create).toHaveBeenCalledWith(input, mockUser.id);
    });
  });

  describe('createTemplateFromBoard', () => {
    it('should create a template from a board', async () => {
      mockTemplatesService.createFromBoard.mockResolvedValue(mockTemplate);

      const result = await resolver.createTemplateFromBoard('board-1', 'My board template', mockUser);

      expect(result).toEqual(mockTemplate);
      expect(mockTemplatesService.createFromBoard).toHaveBeenCalledWith(
        'board-1',
        mockUser.id,
        'My board template',
      );
    });

    it('should create a template from board without name', async () => {
      mockTemplatesService.createFromBoard.mockResolvedValue(mockTemplate);

      await resolver.createTemplateFromBoard('board-1', undefined, mockUser);

      expect(mockTemplatesService.createFromBoard).toHaveBeenCalledWith(
        'board-1',
        mockUser.id,
        undefined,
      );
    });
  });

  describe('updateTemplate', () => {
    it('should update a template', async () => {
      const updated = { ...mockTemplate, name: 'Updated' };
      mockTemplatesService.update.mockResolvedValue(updated);

      const result = await resolver.updateTemplate(
        { id: 'tpl-1', name: 'Updated' },
        mockUser,
      );

      expect(result.name).toBe('Updated');
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a template', async () => {
      mockTemplatesService.delete.mockResolvedValue(true);

      const result = await resolver.deleteTemplate('tpl-1', mockUser);

      expect(result).toBe(true);
      expect(mockTemplatesService.delete).toHaveBeenCalledWith('tpl-1', mockUser.id);
    });
  });
});
