import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { JwtService } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { BoardsModule } from './modules/boards/boards.module';
import { ListsModule } from './modules/lists/lists.module';
import { CardsModule } from './modules/cards/cards.module';
import { LabelsModule } from './modules/labels/labels.module';
import { ChecklistsModule } from './modules/checklists/checklists.module';
import { CommentsModule } from './modules/comments/comments.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { ActivityModule } from './modules/activity/activity.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SubscriptionsModule } from './common/subscriptions/subscriptions.module';
import { validateWsConnection } from './common/subscriptions/ws-auth';
import { GqlAuthGuard } from './common/guards/gql-auth.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { HealthController } from './common/controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: [
        join(process.cwd(), '..', '.env'),
        join(process.cwd(), '.env'),
      ],
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [AuthModule, PrismaModule],
      inject: [JwtService, PrismaService],
      useFactory: (jwtService: JwtService, prisma: PrismaService) => ({
        autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
        sortSchema: true,
        playground: process.env.NODE_ENV !== 'production',
        introspection: process.env.NODE_ENV !== 'production',
        apollo: {
          key: process.env.APOLLO_KEY,
          graphRef: process.env.APOLLO_GRAPH_REF,
        },
        subscriptions: {
          'graphql-ws': {
            onConnect: async (ctx: unknown) => {
              const c = ctx as { connectionParams?: Record<string, unknown>; extra?: Record<string, unknown> };
              const params = c?.connectionParams ?? {};
              const user = await validateWsConnection(
                params as { Authorization?: string; authToken?: string },
                jwtService,
                prisma,
              );
              if (c.extra) c.extra.user = user ?? undefined;
              // Reject unauthenticated connections so only JWT-valid users can use subscriptions
              if (!user) return false;
              return true;
            },
          },
        },
        context: (ctx: unknown) => {
          const c = ctx as { req?: { user?: unknown }; res?: unknown; extra?: { user?: unknown } };
          if (c?.extra?.user != null)
            return { req: { ...c.req, user: c.extra.user }, res: c.res, user: c.extra.user };
          return { req: c?.req, res: c?.res, user: c?.req?.user };
        },
      }),
    }),
    SubscriptionsModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    EmailModule,
    WorkspacesModule,
    InvitationsModule,
    BoardsModule,
    ListsModule,
    CardsModule,
    LabelsModule,
    ChecklistsModule,
    CommentsModule,
    AttachmentsModule,
    ActivityModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}

