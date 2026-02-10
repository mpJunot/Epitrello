import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Visibility } from '@prisma/client';
import { TemplateListType } from './template-list.type';

@ObjectType()
export class Template {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => [TemplateListType])
  lists: TemplateListType[];

  @Field(() => Visibility)
  visibility: Visibility;

  @Field(() => ID, { nullable: true })
  workspaceId?: string;

  @Field(() => ID)
  creatorId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
