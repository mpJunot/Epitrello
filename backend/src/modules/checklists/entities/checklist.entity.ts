import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ChecklistItem } from './checklist-item.entity';

@ObjectType()
export class Checklist {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  cardId: string;

  @Field()
  title: string;

  @Field(() => [ChecklistItem], { nullable: true })
  items?: ChecklistItem[];
}
