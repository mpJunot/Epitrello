import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

@InputType()
export class UpdateBoardMemberRoleInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  boardId: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
