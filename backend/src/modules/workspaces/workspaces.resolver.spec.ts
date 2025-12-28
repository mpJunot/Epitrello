import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesResolver } from './workspaces.resolver';
import { WorkspacesService } from './workspaces.service';

describe('WorkspacesResolver', () => {
  let resolver: WorkspacesResolver;
  let workspacesService: WorkspacesService;

  const mockWorkspace = {
    id: '1',
    name: 'Test Workspace',
    description: 'Test Description',
    logoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    memberCount: 1,
  };

  const mockUser = { id: 'user-1' };

  const mockWorkspacesService = {
    create: jest.fn(),
    findMyWorkspaces: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesResolver,
        {
          provide: WorkspacesService,
          useValue: mockWorkspacesService,
        },
      ],
    }).compile();

    resolver = module.get<WorkspacesResolver>(WorkspacesResolver);
    workspacesService = module.get<WorkspacesService>(WorkspacesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createWorkspace', () => {
    it('should create a workspace', async () => {
      const input = { name: 'New Workspace', description: 'Description' };
      mockWorkspacesService.create.mockResolvedValue(mockWorkspace);

      const result = await resolver.createWorkspace(input, mockUser);

      expect(result).toEqual(mockWorkspace);
      expect(workspacesService.create).toHaveBeenCalledWith(input, 'user-1');
    });
  });

  describe('myWorkspaces', () => {
    it('should return user workspaces', async () => {
      const workspaces = [mockWorkspace];
      mockWorkspacesService.findMyWorkspaces.mockResolvedValue(workspaces);

      const result = await resolver.myWorkspaces(mockUser);

      expect(result).toEqual(workspaces);
      expect(workspacesService.findMyWorkspaces).toHaveBeenCalledWith('user-1');
    });
  });

  describe('workspace', () => {
    it('should return a workspace by id', async () => {
      mockWorkspacesService.findOne.mockResolvedValue(mockWorkspace);

      const result = await resolver.workspace('1', mockUser);

      expect(result).toEqual(mockWorkspace);
      expect(workspacesService.findOne).toHaveBeenCalledWith('1', 'user-1');
    });
  });

  describe('updateWorkspace', () => {
    it('should update a workspace', async () => {
      const input = { name: 'Updated Name' };
      const updated = { ...mockWorkspace, name: 'Updated Name' };
      mockWorkspacesService.update.mockResolvedValue(updated);

      const result = await resolver.updateWorkspace('1', input, mockUser);

      expect(result.name).toBe('Updated Name');
      expect(workspacesService.update).toHaveBeenCalledWith('1', input, 'user-1');
    });
  });

  describe('deleteWorkspace', () => {
    it('should delete a workspace', async () => {
      mockWorkspacesService.remove.mockResolvedValue(true);

      const result = await resolver.deleteWorkspace('1', mockUser);

      expect(result).toBe(true);
      expect(workspacesService.remove).toHaveBeenCalledWith('1', 'user-1');
    });
  });
});
