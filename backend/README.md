# Backend Structure - NestJS + GraphQL + PostgreSQL + Prisma

```
backend/
├── src/
│   ├── app.module.ts           # Main application module
│   ├── main.ts                 # Application entry point
│   ├── common/                 # (Planned) Shared utilities and guards
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
│   ├── config/                 # (Planned) Configuration modules
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── app.config.ts
│   ├── modules/
│   │   ├── auth/               # (Planned) Authentication module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.resolver.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.input.ts
│   │   │   │   ├── register.input.ts
│   │   │   │   └── auth-payload.type.ts
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts     # (Planned) User CRUD operations
│   │   │   ├── users.resolver.ts    # (Planned) User GraphQL operations
│   │   │   ├── dto/
│   │   │   │   ├── create-user.input.ts
│   │   │   │   ├── update-user.input.ts
│   │   │   │   └── user-filter.input.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   ├── boards/             # (Planned) Board management module
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
│   │   ├── lists/              # (Planned) List management module
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
│   │   ├── cards/              # (Planned) Card management module
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
│   │   ├── comments/           # (Planned) Card comments module
│   │   │   ├── comments.module.ts
│   │   │   ├── comments.service.ts
│   │   │   ├── comments.resolver.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-comment.input.ts
│   │   │   │   ├── update-comment.input.ts
│   │   │   │   └── comment-filter.input.ts
│   │   │   └── entities/
│   │   │       └── comment.entity.ts
│   │   ├── attachments/        # (Planned) File attachments module
│   │   │   ├── attachments.module.ts
│   │   │   ├── attachments.service.ts
│   │   │   ├── attachments.resolver.ts
│   │   │   ├── dto/
│   │   │   │   ├── upload-file.input.ts
│   │   │   │   └── attachment-filter.input.ts
│   │   │   └── entities/
│   │   │       └── attachment.entity.ts
│   │   ├── activities/         # (Planned) Activity tracking module
│   │   │   ├── activities.module.ts
│   │   │   ├── activities.service.ts
│   │   │   ├── activities.resolver.ts
│   │   │   ├── dto/
│   │   │   │   └── activity-filter.input.ts
│   │   │   └── entities/
│   │   │       └── activity.entity.ts
│   │   └── notifications/      # (Planned) Real-time notifications
│   │       ├── notifications.module.ts
│   │       ├── notifications.service.ts
│   │       ├── notifications.resolver.ts
│   │       ├── notifications.gateway.ts
│   │       ├── dto/
│   │       │   ├── create-notification.input.ts
│   │       │   └── notification-filter.input.ts
│   │       └── entities/
│   │           └── notification.entity.ts
│   ├── prisma/
│   │   ├── prisma.module.ts    # Prisma module
│   │   └── prisma.service.ts   # Prisma service
│   └── graphql/
│       ├── schema.gql          # Generated GraphQL schema
│       └── scalars/            # (Planned) Custom GraphQL scalars
│           ├── date.scalar.ts
│           └── upload.scalar.ts
├── prisma/
│   ├── schema.prisma           # (Planned) Complete Prisma schema
│   ├── migrations/             # (Planned) Database migrations
│   ├── seeds/                  # (Planned) Database seeding
│   │   ├── seed.ts
│   │   └── data/
│   │       ├── users.json
│   │       ├── boards.json
│   │       └── demo-data.json
│   └── dev.db                  # (Generated) SQLite dev database
├── uploads/                    # (Planned) File upload directory
│   ├── avatars/
│   └── attachments/
├── test/                       # (Planned) Testing files
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   ├── boards.e2e-spec.ts
│   ├── jest-e2e.json
│   └── setup.ts
├── .env                        # (Planned) Environment variables
├── .env.example                # (Planned) Environment variables template
├── .env.test                   # (Planned) Test environment variables
├── .gitignore
├── docker-compose.yml          # (Planned) Development database
├── Dockerfile                  # (Planned) Production containerization
├── package.json                # (Planned) Complete dependencies
├── pnpm-lock.yaml             # (Generated) Package lock file
├── tsconfig.json               # (Planned) TypeScript configuration
├── tsconfig.build.json         # (Planned) Build configuration
├── eslint.config.js            # (Planned) ESLint configuration
├── prettier.config.js          # (Planned) Prettier configuration
├── jest.config.js              # (Planned) Jest configuration
└── README.md                   # Documentation
```

## Currently Implemented

### Core Structure
- **NestJS Application Module** - Basic app setup with GraphQL and Prisma integration
- **Prisma Module & Service** - Database service foundation
- **GraphQL Setup** - Apollo Server integration with auto-schema generation
- **User Entity** - GraphQL entity definition with proper decorators
- **Users Module Structure** - Module, service, and resolver files created

### Planned Implementation

#### Essential Features
- **(Planned) Authentication System** - Complete JWT auth with registration/login
- **(Planned) User Management** - Full CRUD operations and profile management
- **(Planned) Board Operations** - Create, read, update, delete boards with permissions
- **(Planned) List Management** - Column operations with drag & drop positioning
- **(Planned) Card System** - Task cards with descriptions, assignments, due dates
- **(Planned) Member Management** - Board collaboration and user roles

#### Advanced Features
- **(Planned) Comments System** - Card comments and discussions
- **(Planned) File Attachments** - Upload and manage files on cards
- **(Planned) Activity Tracking** - Audit log of all board activities
- **(Planned) Real-time Updates** - WebSocket notifications for live collaboration
- **(Planned) Search & Filtering** - Advanced search across boards, cards, and users

#### Database & Infrastructure
- **(Planned) Complete Prisma Schema** - All entities with proper relationships
- **(Planned) Database Migrations** - Version controlled schema changes
- **(Planned) Data Seeding** - Sample data for development and testing
- **(Planned) File Storage** - Avatar and attachment management
- **(Planned) Docker Setup** - Containerized development environment

#### Development & Quality
- **(Planned) Input Validation** - Comprehensive DTOs and validation pipes
- **(Planned) Error Handling** - Global exception filters and custom errors
- **(Planned) Testing Suite** - Unit tests, integration tests, and E2E tests
- **(Planned) Authentication Guards** - JWT protection for GraphQL resolvers
- **(Planned) Rate Limiting** - API protection and abuse prevention
- **(Planned) API Documentation** - GraphQL schema documentation

#### Configuration & Deployment
- **(Planned) Environment Management** - Development, test, and production configs
- **(Planned) Database Configuration** - PostgreSQL connection and optimization
- **(Planned) Security Headers** - CORS, helmet, and security best practices
- **(Planned) Logging System** - Structured logging with different levels
- **(Planned) Health Checks** - Application and database health monitoring

## Technology Stack

- **Framework**: NestJS
- **API**: GraphQL with Apollo Server
- **Database**: PostgreSQL (planned)
- **ORM**: Prisma (planned)
- **Authentication**: JWT with Passport (planned)
- **Package Manager**: pnpm

## Next Steps

1. **Complete Prisma Setup**:
   - Define complete database schema
   - Set up migrations
   - Configure database connection

2. **Implement Authentication**:
   - JWT strategy and guards
   - Login/register mutations
   - Password hashing

3. **Build Core Features**:
   - User CRUD operations
   - Board management
   - List and card operations

4. **Add Advanced Features**:
   - Role-based permissions
   - Real-time updates
   - File uploads
