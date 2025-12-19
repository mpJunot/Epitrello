import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

@InputType()
export class UpdateMemberRoleInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @Field(() => String)
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
