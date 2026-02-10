# Backend Architecture

## Structure
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/           # Authentication (JWT + OAuth)
│   │   ├── users/          # User management
│   │   ├── workspaces/     # Workspaces & roles
│   │   ├── invitations/    # Workspace invitations
│   │   ├── boards/         # Board management
│   │   ├── lists/          # List management
│   │   ├── cards/          # Card management
│   │   ├── labels/         # Labels (board/card)
│   │   ├── checklists/     # Checklists on cards
│   │   ├── comments/       # Comments on cards
│   │   ├── attachments/    # File attachments on cards
│   │   ├── activity/       # Activity feed
│   │   ├── notifications/  # User notifications
│   │   ├── email/          # Email (Resend)
│   │   └── upload/         # File upload (avatars, etc.)
│   ├── prisma/            # Database service
│   └── graphql/           # GraphQL schema
├── prisma/
│   └── schema.prisma      # Database schema
└── test/                  # Tests
```

## Modules Explained

### Core Modules

**Auth Module**
- Handles user registration and login
- Generates and validates JWT tokens
- Protects routes with authentication guards
- Provides login/register GraphQL mutations

**Users Module**
- Manages user accounts and profiles
- CRUD operations for user data
- User queries and mutations in GraphQL
- Password hashing and validation

**Prisma Module**
- Database connection service
- Provides Prisma client to other modules
- Handles database transactions
- Manages connection pooling

### Business Logic Modules

**Workspaces Module**
- CRUD workspaces, roles (ADMIN, MEMBER, OBSERVER)
- Permissions and board access

**Invitations Module**
- Invite members, accept/reject invitations
- Invitation emails

**Boards Module**
- CRUD boards, archive/restore
- Members and roles

**Lists Module**
- CRUD lists, reordering, archiving

**Cards Module**
- CRUD cards, move, assign members
- Labels and checklists

**Labels Module**
- Board-level labels, assign to cards

**Checklists Module**
- CRUD checklists and items, reordering

**Comments Module**
- Comments on cards (CRUD, subscriptions)

**Attachments Module**
- File attachments on cards (upload, delete)

**Activity Module**
- Activity feed / audit log

**Notifications Module**
- User notifications and preferences

**Email Module**
- Templates (verification, welcome, invitation, password reset)

**Upload Module**
- File upload (e.g. avatars) via REST controller

## Database Models

**Core Entities**
- **User** - User accounts with email, password, profile info
- **Workspace** - Top-level organization units for teams
- **Board** - Project boards containing lists and cards
- **List** - Columns/stages in a board (To Do, In Progress, Done)
- **Card** - Individual tasks with title, description, dates
- **Comment** - User discussions on cards
- **Attachment** - Files uploaded to cards
- **Label** - Color-coded tags for categorizing cards
- **Checklist** - Sub-tasks within cards
- **Notification** - User alerts for various events

**Relationship Tables**
- **BoardMember** - Links users to boards with specific roles
- **WorkspaceMember** - Links users to workspaces with permissions
- **CardAssignee** - Assigns users to specific cards
- **CardLabel** - Applies labels to cards

## Technology Stack
- **Framework**: NestJS - Scalable Node.js framework
- **API**: GraphQL - Flexible query language and runtime
- **Database**: PostgreSQL - Robust relational database
- **ORM**: Prisma - Type-safe database toolkit
- **Auth**: JWT - Stateless authentication tokens
- **Testing**: Jest - JavaScript testing framework

## What's Done
- [x] Basic NestJS setup with modules and dependency injection
- [x] GraphQL configuration with Apollo Server
- [x] User authentication with JWT strategy
- [x] Complete database schema with all relationships
- [x] Testing setup with unit and e2e tests
- [x] Code quality tools (ESLint, Prettier)

## What's Next
- [ ] Search and filters - Advanced querying capabilities
- [ ] Real-time updates - WebSocket for live collaboration (partially in place via subscriptions)
