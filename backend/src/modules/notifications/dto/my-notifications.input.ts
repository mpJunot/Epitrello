import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, Max, IsString, IsBoolean } from 'class-validator';

@InputType()
export class MyNotificationsInput {
  @Field(() => Int, { nullable: true, description: 'Max number of notifications to return (default 20, max 50)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @Field({ nullable: true, description: 'Cursor for pagination (notification id)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @Field({ nullable: true, description: 'If true, only unread notifications' })
  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;
}
