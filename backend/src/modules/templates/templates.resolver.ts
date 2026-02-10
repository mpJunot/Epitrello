import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { Template } from './entities/template.entity';
import { CreateTemplateInput } from './dto/create-template.input';
import { UpdateTemplateInput } from './dto/update-template.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => Template)
@UseGuards(GqlAuthGuard)
export class TemplatesResolver {
  constructor(private readonly templatesService: TemplatesService) {}

  @Query(() => Template, {
    name: 'template',
    description: 'Get a template by ID. User must have access (global or workspace member).',
  })
  async template(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Template> {
    return this.templatesService.findOne(id, user.id);
  }

  @Query(() => [Template], {
    name: 'templates',
    description:
      'List templates. If workspaceId is provided, returns global + workspace templates; otherwise global only.',
  })
  async templates(
    @Args('workspaceId', { type: () => ID, nullable: true }) workspaceId: string | null | undefined,
    @CurrentUser() user: any,
  ): Promise<Template[]> {
    return this.templatesService.findAll(workspaceId ?? null, user.id);
  }

  @Mutation(() => Template, {
    description: 'Create a custom board template. Optional workspaceId to scope to a workspace.',
  })
  async createTemplate(
    @Args('input') input: CreateTemplateInput,
    @CurrentUser() user: any,
  ): Promise<Template> {
    return this.templatesService.create(input, user.id);
  }

  @Mutation(() => Template, {
    description:
      'Create a template from an existing board (lists and cards become template structure).',
  })
  async createTemplateFromBoard(
    @Args('boardId', { type: () => ID }) boardId: string,
    @Args('name', { type: () => String, nullable: true }) name: string | undefined,
    @CurrentUser() user: any,
  ): Promise<Template> {
    return this.templatesService.createFromBoard(boardId, user.id, name);
  }

  @Mutation(() => Template, {
    description: 'Update a template. Only creator or workspace admin.',
  })
  async updateTemplate(
    @Args('input') input: UpdateTemplateInput,
    @CurrentUser() user: any,
  ): Promise<Template> {
    return this.templatesService.update(input, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a template. Only creator or workspace admin.',
  })
  async deleteTemplate(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.templatesService.delete(id, user.id);
  }
}
