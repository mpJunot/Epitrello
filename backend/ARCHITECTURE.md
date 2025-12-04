# Backend Architecture

## Structure
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/           # Authentication (JWT)
│   │   ├── users/          # User management
│   │   ├── boards/         # [TODO] Board management
│   │   ├── lists/          # [TODO] List management
│   │   ├── cards/          # [TODO] Card management
│   │   ├── comments/       # [TODO] Comments
│   │   └── attachments/    # [TODO] File uploads
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

### Business Logic Modules (TODO)

**Boards Module**
- Create, read, update, delete boards
- Manage board visibility (private/public)
- Handle board member invitations and roles
- Board-level permissions and access control

**Lists Module**
- Create and manage lists within boards
- Handle drag-and-drop list reordering
- Position management with float values
- List CRUD operations

**Cards Module**
- Create and manage task cards
- Move cards between lists
- Assign users to cards
- Handle due dates and descriptions
- Card position management

**Comments Module**
- Add comments to cards
- Edit and delete comments
- Real-time comment notifications
- Comment history and threading

**Attachments Module**
- File upload to cards
- Support multiple file types
- File size and type validation
- File deletion and management

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
- [ ] Board operations - Create, manage, and share boards
- [ ] Card management - Full card lifecycle with assignments
- [ ] Real-time updates - WebSocket for live collaboration
- [ ] File uploads - Handle attachments with proper storage
- [ ] Search and filters - Advanced querying capabilities
- [ ] Role-based permissions - Fine-grained access control
