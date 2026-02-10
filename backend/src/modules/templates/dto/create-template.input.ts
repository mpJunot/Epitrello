import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Visibility } from '@prisma/client';
import { TemplateListInput } from './template-list.input';

@InputType()
export class CreateTemplateInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => [TemplateListInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateListInput)
  lists: TemplateListInput[];

  @Field(() => Visibility, { nullable: true })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  workspaceId?: string;
}
