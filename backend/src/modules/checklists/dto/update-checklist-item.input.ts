import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

@InputType()
export class UpdateChecklistItemInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  content?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  checked?: boolean;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  position?: number;
}
