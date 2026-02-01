import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { Label } from './entities/label.entity';
import { CreateLabelInput } from './dto/create-label.input';
import { UpdateLabelInput } from './dto/update-label.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => Label)
@UseGuards(GqlAuthGuard)
export class LabelsResolver {
  constructor(private readonly labelsService: LabelsService) {}

  @Query(() => [Label], {
    name: 'boardLabels',
    description: 'List all labels for a board. User must have access to the board.',
  })
  async boardLabels(
    @Args('boardId', { type: () => ID }) boardId: string,
    @CurrentUser() user: any,
  ): Promise<Label[]> {
    return this.labelsService.findByBoard(boardId, user.id);
  }

  @Mutation(() => Label, {
    description: 'Create a new label for a board. User must have access to the board.',
  })
  async createLabel(
    @Args('input') input: CreateLabelInput,
    @CurrentUser() user: any,
  ): Promise<Label> {
    return this.labelsService.create(input, user.id);
  }

  @Mutation(() => Label, {
    description: 'Update a label. User must have access to the board.',
  })
  async updateLabel(
    @Args('input') input: UpdateLabelInput,
    @CurrentUser() user: any,
  ): Promise<Label> {
    return this.labelsService.update(input, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a label. User must have access to the board.',
  })
  async deleteLabel(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.labelsService.delete(id, user.id);
  }
}
