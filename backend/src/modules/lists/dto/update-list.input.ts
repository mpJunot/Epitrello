import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class UpdateListInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  position?: number;
}
