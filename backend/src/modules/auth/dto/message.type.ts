import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType({ description: 'Generic message response' })
export class MessageResponse {
  @Field({ description: 'Response message' })
  message: string;
}

