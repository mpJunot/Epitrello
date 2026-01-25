import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUrl, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class UpdateCardInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

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

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  position?: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
