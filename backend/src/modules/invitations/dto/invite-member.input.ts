import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

@InputType()
export class InviteMemberInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;

  @Field()
  @IsEmail()
  @IsNotEmpty()
  inviteeEmail: string;

  @Field(() => String, { nullable: true, defaultValue: 'MEMBER' })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
