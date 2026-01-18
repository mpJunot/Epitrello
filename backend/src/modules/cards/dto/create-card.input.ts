import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUrl, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateCardInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  listId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field({ nullable: true, description: 'Card description with markdown support' })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  coverUrl?: string;

  @Field({ nullable: true })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;

  @Field(() => Float, { nullable: true, description: 'Optional position. If not provided, will be calculated automatically.' })
  @IsNumber()
  @IsOptional()
  position?: number;
}
