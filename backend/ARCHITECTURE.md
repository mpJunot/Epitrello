# Epitrello Backend Architecture

Complete project structure for the Epitrello backend application.

## Project Structure

```
backend/
├── src/
│   ├── main.ts                          [EXISTS]
│   ├── app.module.ts                    [EXISTS]
│   │
│   ├── common/                          [PLANNED]
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── dto/
│   │   │   └── pagination.dto.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── gql-auth.guard.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── types/
│   │       ├── context.type.ts
│   │       └── auth.type.ts
│   │
│   ├── config/                          [EXISTS]
│   │   ├── app.config.ts                 [EXISTS]
│   │   ├── database.config.ts            [EXISTS]
│   │   └── jwt.config.ts                [EXISTS]
│   │
│   ├── modules/
│   │   ├── auth/                        [EXISTS]
│   │   │   ├── auth.module.ts           [EXISTS]
│   │   │   ├── auth.service.ts          [EXISTS]
│   │   │   ├── auth.resolver.ts         [EXISTS]
│   │   │   ├── dto/
│   │   │   │   ├── login.input.ts       [EXISTS]
│   │   │   │   ├── register.input.ts    [EXISTS]
│   │   │   │   └── auth-payload.type.ts [EXISTS]
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts      [EXISTS]
│   │   │
│   │   ├── users/                       [EXISTS]
│   │   │   ├── users.module.ts          [EXISTS]
│   │   │   ├── users.service.ts         [EXISTS]
│   │   │   ├── users.resolver.ts        [EXISTS]
│   │   │   ├── dto/
│   │   │   │   ├── create-user.input.ts [EXISTS]
│   │   │   │   ├── update-user.input.ts [EXISTS]
│   │   │   │   └── user-filter.input.ts [PLANNED]
│   │   │   └── entities/
│   │   │       └── user.entity.ts       [EXISTS]
│   │   │
│   │   ├── boards/                     [PLANNED]
│   │   │   ├── boards.module.ts
│   │   │   ├── boards.service.ts
│   │   │   ├── boards.resolver.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-board.input.ts
│   │   │   │   ├── update-board.input.ts
│   │   │   │   ├── add-member.input.ts
│   │   │   │   └── board-filter.input.ts
│   │   │   └── entities/
│   │   │       └── board.entity.ts
│   │   │
│   │   ├── lists/                       [PLANNED]
│   │   │   ├── lists.module.ts
│   │   │   ├── lists.service.ts
│   │   │   ├── lists.resolver.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-list.input.ts
│   │   │   │   ├── update-list.input.ts
│   │   │   │   ├── move-list.input.ts
│   │   │   │   └── list-filter.input.ts
│   │   │   └── entities/
│   │   │       └── list.entity.ts
│   │   │
│   │   ├── cards/                       [PLANNED]
│   │   │   ├── cards.module.ts
│   │   │   ├── cards.service.ts
│   │   │   ├── cards.resolver.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-card.input.ts
│   │   │   │   ├── update-card.input.ts
│   │   │   │   ├── move-card.input.ts
│   │   │   │   ├── assign-user.input.ts
│   │   │   │   └── card-filter.input.ts
│   │   │   └── entities/
│   │   │       └── card.entity.ts
│   │   │
│   │   ├── comments/                    [PLANNED]
│   │   │   ├── comments.module.ts
│   │   │   ├── comments.service.ts
│   │   │   ├── comments.resolver.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-comment.input.ts
│   │   │   │   ├── update-comment.input.ts
│   │   │   │   └── comment-filter.input.ts
│   │   │   └── entities/
│   │   │       └── comment.entity.ts
│   │   │
│   │   ├── attachments/                 [PLANNED]
│   │   │   ├── attachments.module.ts
│   │   │   ├── attachments.service.ts
│   │   │   ├── attachments.resolver.ts
│   │   │   ├── dto/
│   │   │   │   ├── upload-file.input.ts
│   │   │   │   └── attachment-filter.input.ts
│   │   │   └── entities/
│   │   │       └── attachment.entity.ts
│   │   │
│   │   ├── activities/                  [PLANNED]
│   │   │   ├── activities.module.ts
│   │   │   ├── activities.service.ts
│   │   │   ├── activities.resolver.ts
│   │   │   ├── dto/
│   │   │   │   └── activity-filter.input.ts
│   │   │   └── entities/
│   │   │       └── activity.entity.ts
│   │   │
│   │   └── notifications/               [PLANNED]
│   │       ├── notifications.module.ts
│   │       ├── notifications.service.ts
│   │       ├── notifications.resolver.ts
│   │       ├── notifications.gateway.ts
│   │       ├── dto/
│   │       │   ├── create-notification.input.ts
│   │       │   └── notification-filter.input.ts
│   │       └── entities/
│   │           └── notification.entity.ts
│   │
│   ├── prisma/                          [EXISTS]
│   │   ├── prisma.module.ts             [EXISTS]
│   │   └── prisma.service.ts            [EXISTS]
│   │
│   └── graphql/                         [EXISTS]
│       ├── schema.gql                   [EXISTS]
│       └── scalars/                     [PLANNED]
│           ├── date.scalar.ts
│           └── upload.scalar.ts
│
├── prisma/
│   ├── schema.prisma                    [EXISTS]
│   ├── migrations/                      [PLANNED]
│   ├── seeds/                           [PLANNED]
│   │   ├── seed.ts
│   │   └── data/
│   │       ├── users.json
│   │       ├── boards.json
│   │       └── demo-data.json
│   └── dev.db                           [PLANNED]
│
├── uploads/                             [PLANNED]
│   ├── avatars/
│   └── attachments/
│
├── test/                                 [EXISTS]
│   ├── app.e2e-spec.ts                  [EXISTS]
│   ├── auth.e2e-spec.ts                 [PLANNED]
│   ├── boards.e2e-spec.ts               [PLANNED]
│   ├── jest-e2e.json                    [EXISTS]
│   └── setup.ts                         [PLANNED]
│
├── .env                                 [EXISTS]
├── .env.example                         [PLANNED]
├── .env.test                            [PLANNED]
├── .gitignore                           [EXISTS]
├── docker-compose.yml                   [EXISTS]
├── Dockerfile                           [PLANNED]
├── package.json                         [EXISTS]
├── pnpm-lock.yaml                       [EXISTS]
├── tsconfig.json                        [EXISTS]
├── tsconfig.build.json                  [EXISTS]
├── nest-cli.json                        [EXISTS]
├── eslint.config.js                     [EXISTS]
├── prettier.config.js                   [EXISTS]
├── jest.config.js                       [EXISTS]
└── README.md                            [EXISTS]
```

## Module Status

### Implemented Modules

- **Auth Module** - User authentication with JWT
  - Register mutation
  - Login mutation
  - JWT strategy

- **Users Module** - User management
  - CRUD operations
  - User queries and mutations

- **Prisma Module** - Database service
  - Prisma client integration
  - Connection management

### Planned Modules

- **Boards Module** - Board management
  - Create, read, update, delete boards
  - Board member management
  - Board permissions

- **Lists Module** - List (column) management
  - Create, update, delete lists
  - List reordering (drag & drop)
  - List position management

- **Cards Module** - Card (task) management
  - Create, update, delete cards
  - Card assignment to users
  - Card movement between lists
  - Due date management

- **Comments Module** - Card comments
  - Create, update, delete comments
  - Comment threading
  - Comment notifications

- **Attachments Module** - File attachments
  - File upload
  - File management
  - File deletion

- **Activities Module** - Activity tracking
  - Activity log creation
  - Activity history
  - Activity filtering

- **Notifications Module** - Real-time notifications
  - WebSocket gateway
  - Notification creation
  - Notification delivery

## Common Utilities (Planned)

- **Decorators** - Custom decorators
  - `@CurrentUser()` - Get current authenticated user
  - `@Public()` - Mark route as public

- **Guards** - Authentication guards
  - `JwtAuthGuard` - HTTP JWT guard
  - `GqlAuthGuard` - GraphQL JWT guard

- **Filters** - Exception filters
  - `HttpExceptionFilter` - Global exception handler

- **Pipes** - Validation pipes
  - `ValidationPipe` - Input validation

- **Types** - Shared types
  - `ContextType` - GraphQL context type
  - `AuthType` - Authentication type definitions

## Database Schema (Planned)

The complete Prisma schema should include:

- User model (EXISTS)
- Board model
- List model
- Card model
- Comment model
- Attachment model
- Activity model
- Notification model
- BoardMember model (many-to-many)
- CardAssignee model (many-to-many)

## Features Status

### Core Features

- [x] User authentication (register/login)
- [x] User CRUD operations
- [ ] Board management
- [ ] List management
- [ ] Card management
- [ ] Member management

### Advanced Features

- [ ] Comments system
- [ ] File attachments
- [ ] Activity tracking
- [ ] Real-time notifications (WebSocket)
- [ ] Search and filtering
- [ ] Role-based permissions

### Infrastructure

- [x] Database setup (PostgreSQL)
- [x] Prisma integration
- [x] GraphQL setup
- [x] JWT authentication
- [ ] Database migrations
- [ ] Data seeding
- [ ] File storage
- [ ] Docker setup
- [ ] Health checks
- [ ] Logging system

## Development Status

### Completed

- Project structure setup
- NestJS configuration
- GraphQL integration
- Prisma setup
- Authentication module
- Users module
- Database connection
- Docker Compose configuration

### In Progress

- None

### Planned

- Board module implementation
- List module implementation
- Card module implementation
- Comments module implementation
- Attachments module implementation
- Activities module implementation
- Notifications module implementation
- Common utilities
- Testing suite
- Documentation

## Next Steps

1. Implement Board module
2. Implement List module
3. Implement Card module
4. Add relationships between models
5. Implement Comments module
6. Implement Attachments module
7. Add authentication guards
8. Implement real-time notifications
9. Add comprehensive tests
10. Add API documentation
