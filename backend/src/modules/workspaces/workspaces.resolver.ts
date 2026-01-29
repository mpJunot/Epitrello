import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceInviteInfo } from './entities/workspace-invite-info.entity';
import { CreateWorkspaceInput } from './dto/create-workspace.input';
import { UpdateWorkspaceInput } from './dto/update-workspace.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => Workspace)
@UseGuards(GqlAuthGuard)
export class WorkspacesResolver {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Public()
  @Query(() => WorkspaceInviteInfo, {
    name: 'workspaceInviteInfo',
    description: 'Get workspace name/logo for the invite link page. Public.',
  })
  async workspaceInviteInfo(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ) {
    return this.workspacesService.findInviteInfo(workspaceId);
  }

  @Mutation(() => Workspace, {
    description: 'Create a new workspace. The creator becomes an ADMIN automatically.',
  })
  async createWorkspace(
    @Args('input') createWorkspaceInput: CreateWorkspaceInput,
    @CurrentUser() user: any,
  ): Promise<Workspace> {
    return this.workspacesService.create(createWorkspaceInput, user.id);
  }

  @Query(() => [Workspace], {
    name: 'myWorkspaces',
    description: 'Get all workspaces where the current user is a member',
  })
  async myWorkspaces(@CurrentUser() user: any): Promise<Workspace[]> {
    return this.workspacesService.findMyWorkspaces(user.id);
  }

  @Query(() => Workspace, {
    name: 'workspace',
    description: 'Get a workspace by ID. User must be a member to access.',
  })
  async workspace(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Workspace> {
    return this.workspacesService.findOne(id, user.id);
  }

  @Mutation(() => Workspace, {
    description: 'Update a workspace. Only ADMIN members can update.',
  })
  async updateWorkspace(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateWorkspaceInput: UpdateWorkspaceInput,
    @CurrentUser() user: any,
  ): Promise<Workspace> {
    return this.workspacesService.update(id, updateWorkspaceInput, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a workspace. Only ADMIN members can delete.',
  })
  async deleteWorkspace(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.workspacesService.remove(id, user.id);
  }
}
