import { ObjectType, Field, ID } from '@nestjs/graphql';

/** Event payload for commentDeleted subscription (so clients can remove from list). */
@ObjectType()
export class CommentDeletedEvent {
  @Field(() => ID)
  commentId: string;

  @Field(() => ID)
  cardId: string;
}
