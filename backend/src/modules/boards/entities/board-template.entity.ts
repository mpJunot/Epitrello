import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class BoardTemplate {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => [String], { description: 'List titles in order' })
  listTitles: string[];
}
