import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Label } from '../../labels/entities/label.entity';
import { Checklist } from '../../checklists/entities/checklist.entity';
import { MemberUser } from '../../invitations/entities/workspace-member.entity';

@ObjectType()
export class Card {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  listId: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  background?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field(() => Float)
  position: number;

  @Field(() => Boolean, { defaultValue: false })
  completed: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [Label], { nullable: true })
  labels?: Label[];

  @Field(() => [Checklist], { nullable: true })
  checklists?: Checklist[];

  @Field(() => [MemberUser], { nullable: true })
  assignees?: MemberUser[];
}
