import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { NotificationEmailFrequency } from '@prisma/client';

@InputType()
export class UpdateNotificationPreferencesInput {
  @Field(() => NotificationEmailFrequency, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationEmailFrequency)
  emailFrequency?: NotificationEmailFrequency;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  allowDesktopNotifications?: boolean;
}
