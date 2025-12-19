import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkspaceInput } from './dto/create-workspace.input';
import { UpdateWorkspaceInput } from './dto/update-workspace.input';
import { Workspace } from './entities/workspace.entity';
import { Role } from '@prisma/client';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new workspace
   * The creator automatically becomes an ADMIN member
   */
  async create(
    createWorkspaceInput: CreateWorkspaceInput,
    userId: string,
  ): Promise<Workspace> {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: createWorkspaceInput.name,
        logoUrl: createWorkspaceInput.logoUrl,
        visibility: createWorkspaceInput.visibility || 'PRIVATE',
        memberships: {
          create: {
            userId,
            role: Role.ADMIN,
          },
        },
      },
      include: {
        memberships: true,
        _count: {
          select: { memberships: true },
        },
      },
    });

    return this.mapToWorkspaceEntity(workspace);
  }

  /**
   * Find workspace by ID
   * User must be a member to access the workspace
   */
  async findOne(id: string, userId: string): Promise<Workspace> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        memberships: true,
        _count: {
          select: { memberships: true },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    // Check if user is a member of the workspace
    const isMember = workspace.memberships.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    return this.mapToWorkspaceEntity(workspace);
  }

  /**
   * Find all workspaces where the user is a member
   */
  async findMyWorkspaces(userId: string): Promise<Workspace[]> {
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
      include: {
        memberships: true,
        _count: {
          select: { memberships: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return workspaces.map((w) => this.mapToWorkspaceEntity(w));
  }

  /**
   * Update a workspace
   * Only ADMIN members can update
   */
  async update(
    id: string,
    updateWorkspaceInput: UpdateWorkspaceInput,
    userId: string,
  ): Promise<Workspace> {
    // Check if workspace exists and user has permission
    await this.checkAdminPermission(id, userId);

    // Check if there's at least one field to update
    if (Object.keys(updateWorkspaceInput).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const workspace = await this.prisma.workspace.update({
      where: { id },
      data: updateWorkspaceInput,
      include: {
        memberships: true,
        _count: {
          select: { memberships: true },
        },
      },
    });

    return this.mapToWorkspaceEntity(workspace);
  }

  /**
   * Delete a workspace
   * Only ADMIN members can delete
   */
  async remove(id: string, userId: string): Promise<boolean> {
    // Check if workspace exists and user has permission
    await this.checkAdminPermission(id, userId);

    await this.prisma.workspace.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Check if user has ADMIN role in the workspace
   */
  private async checkAdminPermission(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        memberships: {
          where: { userId },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${workspaceId} not found`);
    }

    const membership = workspace.memberships[0];
    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    if (membership.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only workspace administrators can perform this action',
      );
    }
  }

  /**
   * Map Prisma workspace to GraphQL entity
   */
  private mapToWorkspaceEntity(workspace: any): Workspace {
    return {
      id: workspace.id,
      name: workspace.name,
      logoUrl: workspace.logoUrl,
      visibility: workspace.visibility,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      memberCount: workspace._count?.memberships || workspace.memberships?.length || 0,
      memberships: workspace.memberships?.map((m: any) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    };
  }
}
