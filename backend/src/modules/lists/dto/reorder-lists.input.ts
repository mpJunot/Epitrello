import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class ListPosition {
  @Field(() => ID)
  id: string;

  @Field()
  position: number;
}

@InputType()
export class ReorderListsInput {
  @Field(() => ID)
  boardId: string;

  @Field(() => [ListPosition])
  listPositions: ListPosition[];
}
