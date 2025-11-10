import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    email: String!
    username: String!
    firstName: String
    lastName: String
    avatar: String
    createdAt: Date!
    updatedAt: Date!
  }

  type Board {
    id: ID!
    title: String!
    description: String
    owner: User!
    members: [User!]!
    lists: [List!]!
    background: String
    isPrivate: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  type List {
    id: ID!
    title: String!
    board: Board!
    cards: [Card!]!
    position: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  type Card {
    id: ID!
    title: String!
    description: String
    list: List!
    assignees: [User!]!
    position: Int!
    dueDate: Date
    createdAt: Date!
    updatedAt: Date!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    username: String!
    password: String!
    firstName: String
    lastName: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateBoardInput {
    title: String!
    description: String
    isPrivate: Boolean = false
  }

  input UpdateBoardInput {
    title: String
    description: String
    isPrivate: Boolean
  }

  type Query {
    me: User
    boards: [Board!]!
    board(id: ID!): Board

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createBoard(input: CreateBoardInput!): Board!
    updateBoard(id: ID!, input: UpdateBoardInput!): Board!
    deleteBoard(id: ID!): Boolean!
  }
`;
