# WebSocket & GraphQL Subscriptions (real-time collaboration)

Real-time collaboration is provided via **GraphQL Subscriptions** over WebSocket (no separate `@WebSocketGateway`). Same transport and schema as GraphQL HTTP.

## Setup summary

| Requirement | Implementation |
|-------------|----------------|
| **WebSocket** | GraphQL Subscriptions with `graphql-ws` (same URL as `/graphql`) |
| **Authentication** | JWT in connection params; `onConnect` validates token and attaches user; unauthenticated connections are rejected |
| **Rooms/channels** | **Per board**: `cardUpdated(boardId)`, `listUpdated(boardId)` — **Per card**: `cardUpdatedByCardId(cardId)` |

## Transport

- **Protocol**: `graphql-ws` (WebSocket)
- **Path**: Same as GraphQL HTTP endpoint (e.g. `/graphql`). The subscription server runs on the same path.
- **Authentication**: JWT in **connection params** when opening the WebSocket (not cookies). Pass `Authorization: "Bearer <token>"` or `authToken: "<token>"` in `connectionParams`. Connections without a valid JWT are rejected in `onConnect`.

## Channels (rooms)

- **Per board** (all cards/lists on a board):
  - **`cardUpdated(boardId: ID!)`** – Card created/updated/moved/reordered/assigned/labeled/archived on that board. Payload: `Card`.
  - **`listUpdated(boardId: ID!)`** – List created/updated/reordered/archived on that board. Payload: `List`.
- **Per card** (single card, e.g. card modal):
  - **`cardUpdatedByCardId(cardId: ID!)`** – Only events for that card. Payload: `Card`.

Only subscribers whose variable matches the event receive it (server-side filter).

## Backend implementation

- **PubSub**: In-memory `graphql-subscriptions` `PubSub` (see `pubsub.provider.ts`). For production with multiple instances, use a Redis-backed PubSub.
- **Auth**: `onConnect` (see `ws-auth.ts`) validates JWT from `connectionParams` and attaches the user to the connection context. Subscription resolvers are protected by `GqlAuthGuard`; for WebSocket the guard accepts pre-authenticated context (`req.user` set from `onConnect`).
- **Publishing**: `CardsResolver` and `ListsResolver` inject `PUB_SUB` and call `pubSub.publish(trigger, payload)` after mutations. Payload includes `boardId` for filtering.

## Frontend usage (Apollo Client)

1. Install `graphql-ws` and use a `GraphQLWsLink` (or Apollo’s `split` with `GraphQLWsLink` for subscriptions and `HttpLink` for queries/mutations).
2. When creating the WebSocket client, pass connection params with the JWT:
   - `connectionParams: { Authorization: "Bearer " + token }` or `connectionParams: { authToken: token }`
3. Subscribe with the right variable:
   - Board: `cardUpdated(boardId: $boardId)` or `listUpdated(boardId: $boardId)`
   - Single card: `cardUpdatedByCardId(cardId: $cardId)`
   Refetch or update cache when events arrive.

Example (board):

```graphql
subscription CardUpdated($boardId: ID!) {
  cardUpdated(boardId: $boardId) {
    id
    listId
    title
    dueDate
    # ... other fields
  }
}
```

Example (single card, e.g. card modal):

```graphql
subscription CardUpdatedByCardId($cardId: ID!) {
  cardUpdatedByCardId(cardId: $cardId) {
    id
    listId
    title
    dueDate
    # ...
  }
}
```
