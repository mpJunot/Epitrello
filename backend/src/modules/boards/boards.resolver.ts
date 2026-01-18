import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './entities/board.entity';
import { BoardMemberWithUser } from './entities/board-member.entity';
import { CreateBoardInput } from './dto/create-board.input';
import { UpdateBoardInput } from './dto/update-board.input';
import { AddBoardMemberInput } from './dto/add-board-member.input';
import { UpdateBoardMemberRoleInput } from './dto/update-board-member-role.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { List } from '../lists/entities/list.entity';

@Resolver(() => Board)
@UseGuards(GqlAuthGuard)
export class BoardsResolver {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly prisma: PrismaService,
  ) {}

  @ResolveField(() => [List])
  async lists(@Parent() board: Board): Promise<List[]> {
    return this.prisma.list.findMany({
      where: { boardId: board.id, isArchived: false },
      orderBy: { position: 'asc' },
      include: { cards: true },
    });
  }

  @Mutation(() => Board, {
    description: 'Create a new board. User must be ADMIN or MEMBER of the workspace (if provided).',
  })
  async createBoard(
    @Args('input') input: CreateBoardInput,
    @CurrentUser() user: any,
  ): Promise<Board> {
    return this.boardsService.create(input, user.id);
  }

  @Query(() => Board, {
    name: 'board',
    description: 'Get a board by ID. Access based on visibility and membership.',
  })
  async board(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Board> {
    return this.boardsService.findOne(id, user.id);
  }

  @Query(() => [Board], {
    name: 'workspaceBoards',
    description: 'List all boards in a workspace. User must be a workspace member.',
  })
  async workspaceBoards(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @CurrentUser() user: any,
  ): Promise<Board[]> {
    return this.boardsService.findByWorkspace(workspaceId, user.id);
  }

  @Mutation(() => Board, {
    description: 'Update a board. User must be ADMIN or MEMBER of the board.',
  })
  async updateBoard(
    @Args('input') input: UpdateBoardInput,
    @CurrentUser() user: any,
  ): Promise<Board> {
    return this.boardsService.update(input, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a board. Only board ADMIN can delete.',
  })
  async deleteBoard(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.boardsService.delete(id, user.id);
  }

  @Mutation(() => Board, {
    description: 'Archive a board. User must be ADMIN or MEMBER.',
  })
  async archiveBoard(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Board> {
    return this.boardsService.archive(id, user.id);
  }

  @Mutation(() => Board, {
    description: 'Unarchive a board. User must be ADMIN or MEMBER.',
  })
  async unarchiveBoard(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Board> {
    return this.boardsService.unarchive(id, user.id);
  }

  @Mutation(() => BoardMemberWithUser, {
    description: 'Add a member to a board. Only board ADMIN can add members.',
  })
  async addBoardMember(
    @Args('input') input: AddBoardMemberInput,
    @CurrentUser() user: any,
  ): Promise<BoardMemberWithUser> {
    return this.boardsService.addMember(input, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Remove a member from a board. Only board ADMIN can remove members.',
  })
  async removeBoardMember(
    @Args('boardId', { type: () => ID }) boardId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.boardsService.removeMember(boardId, userId, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Update a member role in a board. Only board ADMIN can update roles.',
  })
  async updateBoardMemberRole(
    @Args('input') input: UpdateBoardMemberRoleInput,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.boardsService.updateMemberRole(input.boardId, input.userId, input.role, user.id);
  }
}
