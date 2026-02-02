import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsResolver } from './invitations.resolver';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, EmailModule, NotificationsModule],
  providers: [InvitationsResolver, InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
