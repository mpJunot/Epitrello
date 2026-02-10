import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { Visibility } from '@prisma/client';

@InputType()
export class CopyBoardInput {
  @Field(() => ID, {
    description: 'ID of the board to copy (lists, cards, labels, checklists).',
  })
  @IsNotEmpty()
  @IsUUID()
  sourceBoardId: string;

  @Field({ description: 'Title for the new board.' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  workspaceId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Visibility, { nullable: true })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  background?: string;
}
