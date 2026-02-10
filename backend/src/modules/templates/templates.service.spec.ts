import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { TemplatesService } from './templates.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TemplatesService', () => {
  let service: TemplatesService;

  const mockPrismaService = {
    board: {
      findUnique: jest.fn(),
    },
    boardTemplate: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workspaceMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockUser = { id: 'user-1' };

  const mockTemplateRow = {
    id: 'tpl-1',
    name: 'My Template',
    description: 'Description',
    lists: [{ title: 'To Do', position: 0 }, { title: 'Done', position: 1 }],
    visibility: 'PRIVATE' as const,
    workspaceId: null,
    creatorId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a global template', async () => {
      mockPrismaService.boardTemplate.create.mockResolvedValue(mockTemplateRow);

      const result = await service.create(
        {
          name: 'My Template',
          description: 'Description',
          lists: [{ title: 'To Do', position: 0 }, { title: 'Done', position: 1 }],
        },
        mockUser.id,
      );

      expect(result.id).toBe('tpl-1');
      expect(result.name).toBe('My Template');
      expect(mockPrismaService.boardTemplate.create).toHaveBeenCalled();
    });

    it('should reject empty lists', async () => {
      await expect(
        service.create(
          { name: 'T', description: 'D', lists: [] },
          mockUser.id,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should reject when not a workspace member', async () => {
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          {
            name: 'T',
            description: 'D',
            lists: [{ title: 'To Do', position: 0 }],
            workspaceId: 'ws-1',
          },
          mockUser.id,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should reject when workspace member is OBSERVER', async () => {
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({
        role: Role.OBSERVER,
      });

      await expect(
        service.create(
          {
            name: 'T',
            description: 'D',
            lists: [{ title: 'To Do', position: 0 }],
            workspaceId: 'ws-1',
          },
          mockUser.id,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('createFromBoard', () => {
    it('should create a template from a board', async () => {
      const mockBoard = {
        id: 'board-1',
        title: 'My Board',
        description: 'Desc',
        visibility: 'PRIVATE',
        workspaceId: 'ws-1',
        members: [{ userId: mockUser.id }],
        workspace: { memberships: [{ userId: mockUser.id }] },
        lists: [
          {
            id: 'list-1',
            title: 'To Do',
            position: 0,
            cards: [
              { id: 'c1', title: 'Card 1', position: 0 },
              { id: 'c2', title: 'Card 2', position: 1 },
            ],
          },
        ],
      };
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({ role: Role.ADMIN });
      mockPrismaService.boardTemplate.create.mockResolvedValue(mockTemplateRow);

      const result = await service.createFromBoard('board-1', mockUser.id, 'From board');

      expect(result.id).toBe('tpl-1');
      expect(mockPrismaService.board.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'board-1' } }),
      );
      expect(mockPrismaService.boardTemplate.create).toHaveBeenCalled();
    });

    it('should throw when board not found', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue(null);

      await expect(
        service.createFromBoard('unknown', mockUser.id),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw when board has no lists', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({
        id: 'board-1',
        title: 'Empty',
        description: '',
        visibility: 'PRIVATE',
        workspaceId: null,
        members: [{ userId: mockUser.id }],
        workspace: null,
        lists: [],
      });

      await expect(
        service.createFromBoard('board-1', mockUser.id),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw when user has no access to board', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({
        id: 'board-1',
        title: 'Other Board',
        description: '',
        visibility: 'PRIVATE',
        workspaceId: null,
        members: [{ userId: 'other-user' }],
        workspace: null,
        lists: [{ id: 'l1', title: 'List', position: 0, cards: [] }],
      });

      await expect(
        service.createFromBoard('board-1', mockUser.id),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should throw when board is WORKSPACE visibility and user is not workspace member', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({
        id: 'board-1',
        title: 'Workspace Board',
        description: '',
        visibility: 'WORKSPACE',
        workspaceId: 'ws-1',
        members: [],
        workspace: {
          id: 'ws-1',
          memberships: [{ userId: 'other-user' }],
        },
        lists: [{ id: 'l1', title: 'List', position: 0, cards: [] }],
      });

      await expect(
        service.createFromBoard('board-1', mockUser.id),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.createFromBoard('board-1', mockUser.id),
      ).rejects.toThrow('You do not have access to this board');
    });
  });

  describe('findOne', () => {
    it('should return a template', async () => {
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(mockTemplateRow);

      const result = await service.findOne('tpl-1', mockUser.id);

      expect(result.id).toBe('tpl-1');
    });

    it('should throw when not found', async () => {
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(null);

      await expect(service.findOne('unknown', mockUser.id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should return template when visibility PUBLIC and user is workspace member', async () => {
      const row = { ...mockTemplateRow, visibility: 'PUBLIC' as const, workspaceId: 'ws-1', creatorId: 'other-user' };
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(row);
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({ userId: mockUser.id });

      const result = await service.findOne('tpl-1', mockUser.id);

      expect(result.id).toBe('tpl-1');
    });

    it('should return template when visibility WORKSPACE and user is workspace member', async () => {
      const row = { ...mockTemplateRow, visibility: 'WORKSPACE' as const, workspaceId: 'ws-1', creatorId: 'other-user' };
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(row);
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({ userId: mockUser.id });

      const result = await service.findOne('tpl-1', mockUser.id);

      expect(result.id).toBe('tpl-1');
    });

    it('should return template when visibility PUBLIC even if user is not workspace member', async () => {
      const row = { ...mockTemplateRow, visibility: 'PUBLIC' as const, workspaceId: 'ws-1', creatorId: 'other-user' };
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(row);

      const result = await service.findOne('tpl-1', mockUser.id);

      expect(result.id).toBe('tpl-1');
      expect(mockPrismaService.workspaceMember.findUnique).not.toHaveBeenCalled();
    });

    it('should throw when visibility PRIVATE and user is not creator', async () => {
      const row = { ...mockTemplateRow, creatorId: 'other-user' };
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(row);

      await expect(service.findOne('tpl-1', mockUser.id)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('should throw when visibility WORKSPACE and user is not workspace member', async () => {
      const row = { ...mockTemplateRow, visibility: 'WORKSPACE' as const, workspaceId: 'ws-1', creatorId: 'other-user' };
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(row);
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(service.findOne('tpl-1', mockUser.id)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      await expect(service.findOne('tpl-1', mockUser.id)).rejects.toThrow(
        'You do not have access to this template',
      );
    });
  });

  describe('findAll', () => {
    it('should return global templates when workspaceId is null', async () => {
      mockPrismaService.workspaceMember.findMany.mockResolvedValue([]);
      mockPrismaService.boardTemplate.findMany.mockResolvedValue([mockTemplateRow]);

      const result = await service.findAll(null, mockUser.id);

      expect(result).toHaveLength(1);
      expect(mockPrismaService.boardTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              { workspaceId: null },
              expect.anything(),
            ]),
          }),
        }),
      );
    });

    it('should return workspace templates when workspaceId is provided and user is member', async () => {
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({ workspaceId: 'ws-1' });
      mockPrismaService.workspaceMember.findMany.mockResolvedValue([{ workspaceId: 'ws-1' }]);
      mockPrismaService.boardTemplate.findMany.mockResolvedValue([mockTemplateRow]);

      const result = await service.findAll('ws-1', mockUser.id);

      expect(result).toHaveLength(1);
      expect(mockPrismaService.boardTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              { OR: [{ workspaceId: null }, { workspaceId: 'ws-1' }] },
              expect.anything(),
            ]),
          }),
        }),
      );
    });

    it('should throw when workspaceId provided but user is not a member', async () => {
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(service.findAll('ws-1', mockUser.id)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('getTemplateForBoard', () => {
    it('should return null when template not found', async () => {
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(null);

      const result = await service.getTemplateForBoard('unknown', mockUser.id);

      expect(result).toBeNull();
    });

    it('should return null when user has no access', async () => {
      const row = { ...mockTemplateRow, creatorId: 'other-user' };
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(row);

      const result = await service.getTemplateForBoard('tpl-1', mockUser.id);

      expect(result).toBeNull();
    });

    it('should return lists when user has access', async () => {
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(mockTemplateRow);

      const result = await service.getTemplateForBoard('tpl-1', mockUser.id);

      expect(result).toEqual({
        lists: [
          { title: 'To Do', position: 0 },
          { title: 'Done', position: 1 },
        ],
      });
    });

    it('should return empty lists when row.lists is not an array', async () => {
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue({
        ...mockTemplateRow,
        lists: null,
      });

      const result = await service.getTemplateForBoard('tpl-1', mockUser.id);

      expect(result).toEqual({ lists: [] });
    });
  });

  describe('update', () => {
    it('should update a template', async () => {
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(mockTemplateRow);
      mockPrismaService.boardTemplate.update.mockResolvedValue({
        ...mockTemplateRow,
        name: 'Updated',
      });

      const result = await service.update(
        { id: 'tpl-1', name: 'Updated' },
        mockUser.id,
      );

      expect(result.name).toBe('Updated');
    });

    it('should update template with lists and visibility', async () => {
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(mockTemplateRow);
      mockPrismaService.boardTemplate.update.mockResolvedValue({
        ...mockTemplateRow,
        lists: [{ title: 'New List', position: 0 }],
        visibility: 'PUBLIC',
      });

      await service.update(
        {
          id: 'tpl-1',
          lists: [{ title: 'New List', position: 0 }],
          visibility: 'PUBLIC',
        },
        mockUser.id,
      );

      expect(mockPrismaService.boardTemplate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lists: [{ title: 'New List', position: 0 }],
            visibility: 'PUBLIC',
          }),
        }),
      );
    });

    it('should update template with lists containing sampleCards', async () => {
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(mockTemplateRow);
      const updatedRow = {
        ...mockTemplateRow,
        lists: [{ title: 'Col', position: 0, sampleCards: [{ title: 'Card', position: 0 }] }],
      };
      mockPrismaService.boardTemplate.update.mockResolvedValue(updatedRow);

      await service.update(
        {
          id: 'tpl-1',
          lists: [
            { title: 'Col', position: 0, sampleCards: [{ title: 'Card', position: 0 }] },
          ],
        },
        mockUser.id,
      );

      expect(mockPrismaService.boardTemplate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lists: [
              { title: 'Col', position: 0, sampleCards: [{ title: 'Card', position: 0 }] },
            ],
          }),
        }),
      );
    });

    it('should throw BadRequestException when update sets lists to empty array', async () => {
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(mockTemplateRow);

      await expect(
        service.update({ id: 'tpl-1', lists: [] }, mockUser.id),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.update({ id: 'tpl-1', lists: [] }, mockUser.id),
      ).rejects.toThrow('At least one list is required');
    });

    it('should throw when template not found', async () => {
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(null);

      await expect(
        service.update({ id: 'unknown', name: 'X' }, mockUser.id),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw when updating global template as non-creator', async () => {
      const row = { ...mockTemplateRow, creatorId: 'other-user', workspaceId: null };
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(row);

      await expect(
        service.update({ id: 'tpl-1', name: 'X' }, mockUser.id),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should throw when user is workspace member but not ADMIN', async () => {
      const row = { ...mockTemplateRow, creatorId: 'other-user', workspaceId: 'ws-1' };
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(row);
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({ role: Role.MEMBER });

      await expect(
        service.update({ id: 'tpl-1', name: 'X' }, mockUser.id),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete a template', async () => {
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(mockTemplateRow);
      mockPrismaService.boardTemplate.delete.mockResolvedValue(undefined);

      const result = await service.delete('tpl-1', mockUser.id);

      expect(result).toBe(true);
      expect(mockPrismaService.boardTemplate.delete).toHaveBeenCalledWith({
        where: { id: 'tpl-1' },
      });
    });

    it('should throw when deleting global template as non-creator', async () => {
      const row = { ...mockTemplateRow, creatorId: 'other-user', workspaceId: null };
      mockPrismaService.boardTemplate.findUnique.mockResolvedValue(row);

      await expect(service.delete('tpl-1', mockUser.id)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });
});
