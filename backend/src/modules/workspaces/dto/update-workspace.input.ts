import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { Visibility } from '@prisma/client';

@InputType()
export class UpdateWorkspaceInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @Field(() => String, { nullable: true })
  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;
}
