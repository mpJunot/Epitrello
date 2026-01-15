import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class Attachment {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  cardId: string;

  @Field(() => ID)
  uploaderId: string;

  @Field()
  url: string;

  @Field()
  filename: string;

  @Field(() => Int)
  size: number;

  @Field()
  createdAt: Date;

  @Field(() => User, { nullable: true })
  uploader?: User | null;
}
