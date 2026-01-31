# Epitrello Development Tasks

This document outlines the prioritized development tasks for the Epitrello project.

## PRIORITY 1 - Foundations (Critical)

### 1.1 Environment Configuration

- [ ] Create `.env` file from `.env.example` (if not exists)
- [ ] Verify that `DATABASE_URL` is correctly configured for Mac and Linux
- [ ] Regenerate Prisma client: `cd backend && pnpm prisma generate`
- [ ] Test database connection

### 1.2 Prisma Database Schema

- [ ] Add `Board` model in `schema.prisma`
  - Relations with User (creator, members)
  - Fields: id, title, description, visibility, background, createdAt, updatedAt
- [ ] Add `List` (ListColumn) model in `schema.prisma`
  - Relation with Board
  - Fields: id, boardId, title, position, createdAt, updatedAt
- [ ] Add `Card` model in `schema.prisma`
  - Relations with List, User (assignees), Comment, Attachment
  - Fields: id, listId, title, description, coverUrl, startDate, dueDate, position, createdAt, updatedAt
- [ ] Add `Comment` model in `schema.prisma`
  - Relation with Card and User (author)
  - Fields: id, cardId, authorId, content, createdAt, updatedAt
- [ ] Add `Attachment` model in `schema.prisma`
  - Relation with Card and User (uploader)
  - Fields: id, cardId, uploaderId, url, filename, size, createdAt
- [ ] Create junction tables (many-to-many):
  - `BoardMember` (Board ↔ User)
  - `CardAssignee` (Card ↔ User)
- [ ] Run migrations: `pnpm prisma migrate dev`

### 1.3 Authentication and Security

- [ ] Create GraphQL guard `GqlAuthGuard` in `src/common/guards/`
- [ ] Create `@CurrentUser()` decorator in `src/common/decorators/`
- [ ] Create `@Public()` decorator for public routes
- [ ] Apply guards on existing resolvers (Users)
- [ ] Test JWT authentication

## PRIORITY 2 - Core Modules (Essential)

### 2.1 Boards Module

- [ ] Create `boards.module.ts`
- [ ] Create `boards.service.ts` with full CRUD
- [ ] Create `boards.resolver.ts` with GraphQL queries and mutations
- [ ] Create DTOs:
  - `create-board.input.ts`
  - `update-board.input.ts`
  - `add-member.input.ts`
  - `board-filter.input.ts`
- [ ] Create `board.entity.ts` (GraphQL type)
- [ ] Implement board member management
- [ ] Implement permissions (owner, admin, member)
- [ ] Add module to `app.module.ts`

### 2.2 Lists Module

- [ ] Create `lists.module.ts`
- [ ] Create `lists.service.ts` with full CRUD
- [ ] Create `lists.resolver.ts` with GraphQL queries and mutations
- [ ] Create DTOs:
  - `create-list.input.ts`
  - `update-list.input.ts`
  - `move-list.input.ts`
  - `list-filter.input.ts`
- [ ] Create `list.entity.ts` (GraphQL type)
- [ ] Implement reordering (position management)
- [ ] Add module to `app.module.ts`

### 2.3 Cards Module

- [ ] Create `cards.module.ts`
- [ ] Create `cards.service.ts` with full CRUD
- [ ] Create `cards.resolver.ts` with GraphQL queries and mutations
- [ ] Create DTOs:
  - `create-card.input.ts`
  - `update-card.input.ts`
  - `move-card.input.ts`
  - `assign-user.input.ts`
  - `card-filter.input.ts`
- [ ] Create `card.entity.ts` (GraphQL type)
- [ ] Implement card movement between lists
- [ ] Implement user assignment
- [ ] Add module to `app.module.ts`

## PRIORITY 3 - Secondary Features

### 3.1 Comments Module

- [ ] Create `comments.module.ts`
- [ ] Create `comments.service.ts`
- [ ] Create `comments.resolver.ts`
- [ ] Create necessary DTOs
- [ ] Create `comment.entity.ts`
- [ ] Implement CRUD for comments
- [ ] Add module to `app.module.ts`

### 3.2 Attachments Module

- [ ] Create `attachments.module.ts`
- [ ] Create `attachments.service.ts`
- [ ] Create `attachments.resolver.ts`
- [ ] Configure file storage (local or S3)
- [ ] Implement file upload
- [ ] Implement file deletion
- [ ] Create `attachment.entity.ts`
- [ ] Add module to `app.module.ts`

## PRIORITY 4 - Improvements and Optimizations

### 4.1 Common Utilities

- [ ] Create `pagination.dto.ts` for pagination
- [ ] Create `http-exception.filter.ts` for error handling
- [ ] Create `validation.pipe.ts` for validation
- [ ] Create shared types (`context.type.ts`, `auth.type.ts`)

### 4.2 Testing

- [ ] Unit tests for services
- [ ] Integration tests for resolvers
- [ ] E2E tests for complete flows

### 4.3 Documentation

- [ ] Document GraphQL API
- [ ] Create query examples
- [ ] Update README

### 4.4 Advanced Features (optional)

- [ ] Activities Module (action history)
- [ ] Notifications Module (WebSocket)
- [ ] Label system for cards
- [ ] Checklists in cards
- [ ] Advanced search and filtering

### 4.5 WebSocket & real-time (Activity, Comments, etc.)

- [ ] **Backend – WebSocket infrastructure**
  - [ ] Set up a WebSocket gateway (NestJS `@WebSocketGateway`) or GraphQL Subscriptions
  - [ ] Authenticate connections (JWT / cookie) and associate the user
  - [ ] Define rooms/channels per board (or per card) to target events
- [ ] **Activity feed**
  - [ ] Model / table `Activity` or equivalent (type, boardId, cardId?, userId, payload, createdAt)
  - [ ] Emit a WebSocket event on each action (card creation, move, assignment, etc.)
  - [ ] Frontend: subscribe to current board events and display the activity feed (sidebar or panel)
- [ ] **Real-time comments**
  - [ ] On comment add / edit / delete, publish an event (e.g. `commentAdded`, `commentUpdated`, `commentDeleted`)
  - [ ] Frontend: subscribe per card or per board to update the comment list without reloading
- [ ] **Real-time notifications**
  - [ ] Events: card assigned, comment on a card, due date soon, board/workspace invitation
  - [ ] Backend: publish to user or board channel
  - [ ] Frontend: listen and display toasts / notification badge / notification center
- [ ] **Collaboration (optional)**
  - [ ] Presence: who is viewing the board / card (cursors or list of viewers)
  - [ ] Live card updates (title, description) to avoid edit conflicts

## Recommended Execution Order

| Phase                            | Priority   | Tasks                                                                                   |
| -------------------------------- | ---------- | --------------------------------------------------------------------------------------- |
| Phase 1 - Foundations            | Priority 1 | Environment configuration, Complete Prisma schema, Authentication guards and decorators |
| Phase 2 - Core Features          | Priority 2 | Boards Module, Lists Module, Cards Module                                               |
| Phase 3 - Complementary Features | Priority 3 | Comments Module, Attachments Module                                                     |
| Phase 4 - Polish                 | Priority 4 | Testing, Documentation, Optimizations                                                   |
| Phase 5 - Real-time              | Priority 4 | WebSocket infrastructure, Activity feed, Real-time comments, Notifications              |

## Useful Commands

| Task                   | Command                                                       |
| ---------------------- | ------------------------------------------------------------- |
| Generate Prisma client | `cd backend && pnpm prisma generate`                          |
| Create a migration     | `cd backend && pnpm prisma migrate dev --name migration_name` |
| Apply migrations       | `cd backend && pnpm prisma migrate deploy`                    |
| Open Prisma Studio     | `cd backend && pnpm prisma studio`                            |
| Start DB in dev        | `docker-compose -f docker-compose.dev.yml up -d postgres`     |
| Start backend in dev   | `cd backend && pnpm start:dev`                                |
| Start frontend in dev  | `cd frontend && pnpm dev`                                     |
