export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
};

export type AddBoardMemberInput = {
  boardId: Scalars['ID']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['ID']['input'];
};

export type AddChecklistItemInput = {
  checklistId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
  /** Optional position. If not provided, will be calculated automatically. */
  position?: InputMaybe<Scalars['Float']['input']>;
};

export type AddLabelToCardInput = {
  cardId: Scalars['ID']['input'];
  labelId: Scalars['ID']['input'];
};

export type AssignMemberToCardInput = {
  cardId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type Attachment = {
  __typename?: 'Attachment';
  cardId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  filename: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  size: Scalars['Int']['output'];
  uploader?: Maybe<User>;
  uploaderId: Scalars['ID']['output'];
  url: Scalars['String']['output'];
};

/** Authentication response containing JWT token and user data */
export type AuthPayload = {
  __typename?: 'AuthPayload';
  /** JWT token to use in Authorization header for authenticated requests */
  token: Scalars['String']['output'];
  /** Authenticated user information */
  user: User;
};

export type Board = {
  __typename?: 'Board';
  background?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  creatorId: Scalars['ID']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isArchived: Scalars['Boolean']['output'];
  lists?: Maybe<Array<List>>;
  members?: Maybe<Array<BoardMemberWithUser>>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  visibility: Visibility;
  workspaceId?: Maybe<Scalars['ID']['output']>;
};

export type BoardMemberWithUser = {
  __typename?: 'BoardMemberWithUser';
  boardId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  joinedAt: Scalars['DateTime']['output'];
  role: Scalars['String']['output'];
  user: MemberUser;
  userId: Scalars['ID']['output'];
};

export type Card = {
  __typename?: 'Card';
  assignees?: Maybe<Array<MemberUser>>;
  background?: Maybe<Scalars['String']['output']>;
  checklists?: Maybe<Array<Checklist>>;
  completed: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  labels?: Maybe<Array<Label>>;
  listId: Scalars['ID']['output'];
  position: Scalars['Float']['output'];
  startDate?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CardPosition = {
  id: Scalars['ID']['input'];
  position: Scalars['Float']['input'];
};

export type Checklist = {
  __typename?: 'Checklist';
  cardId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  items?: Maybe<Array<ChecklistItem>>;
  title: Scalars['String']['output'];
};

export type ChecklistItem = {
  __typename?: 'ChecklistItem';
  checked: Scalars['Boolean']['output'];
  checklistId: Scalars['ID']['output'];
  content: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  position: Scalars['Float']['output'];
};

export type ChecklistItemPositionInput = {
  id: Scalars['ID']['input'];
  position: Scalars['Float']['input'];
};

export type Comment = {
  __typename?: 'Comment';
  author?: Maybe<User>;
  authorId: Scalars['ID']['output'];
  cardId: Scalars['ID']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateAttachmentInput = {
  cardId: Scalars['ID']['input'];
  filename: Scalars['String']['input'];
  size: Scalars['Int']['input'];
  url: Scalars['String']['input'];
};

export type CreateBoardInput = {
  background?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  visibility?: InputMaybe<Visibility>;
  workspaceId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateCardInput = {
  background?: InputMaybe<Scalars['String']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Card description with markdown support */
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  listId: Scalars['ID']['input'];
  /** Optional position. If not provided, will be calculated automatically. */
  position?: InputMaybe<Scalars['Float']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
};

export type CreateChecklistInput = {
  cardId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
};

export type CreateCommentInput = {
  cardId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
};

export type CreateLabelInput = {
  boardId: Scalars['ID']['input'];
  color: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type CreateListInput = {
  boardId: Scalars['ID']['input'];
  /** Optional position. If not provided, will be calculated automatically. */
  position?: InputMaybe<Scalars['Float']['input']>;
  title: Scalars['String']['input'];
};

export type CreateUserInput = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type CreateWorkspaceInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  visibility?: InputMaybe<Scalars['String']['input']>;
};

/** Input for requesting password reset */
export type ForgotPasswordInput = {
  /** User email address */
  email: Scalars['String']['input'];
};

/** Status of a workspace invitation */
export type InvitationStatus =
  | 'ACCEPTED'
  | 'CANCELLED'
  | 'PENDING'
  | 'REJECTED';

export type InviteMemberInput = {
  inviteeEmail: Scalars['String']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
  workspaceId: Scalars['String']['input'];
};

export type Label = {
  __typename?: 'Label';
  boardId: Scalars['ID']['output'];
  color: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type List = {
  __typename?: 'List';
  boardId: Scalars['ID']['output'];
  cards?: Maybe<Array<Card>>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isArchived: Scalars['Boolean']['output'];
  position: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ListPosition = {
  id: Scalars['ID']['input'];
  position: Scalars['Float']['input'];
};

/** Input for user login */
export type LoginInput = {
  /** User email address */
  email: Scalars['String']['input'];
  /** User password */
  password: Scalars['String']['input'];
  /** If true, token expires in 30 days instead of 7 days */
  rememberMe?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MemberUser = {
  __typename?: 'MemberUser';
  avatar?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

/** Generic message response */
export type MessageResponse = {
  __typename?: 'MessageResponse';
  /** Response message */
  message: Scalars['String']['output'];
};

export type MoveCardInput = {
  cardId: Scalars['ID']['input'];
  /** Optional position in target list. If not provided, will be calculated automatically. */
  position?: InputMaybe<Scalars['Float']['input']>;
  targetListId: Scalars['ID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Accept a workspace invitation. */
  acceptInvitation: WorkspaceInvitation;
  /** Add a member to a board. Only board ADMIN can add members. */
  addBoardMember: BoardMemberWithUser;
  /** Add an item to a checklist. */
  addChecklistItem: ChecklistItem;
  /** Add a label to a card. User must have access to the board. */
  addLabelToCard: Card;
  /** Archive a board. User must be ADMIN or MEMBER. */
  archiveBoard: Board;
  /** Archive a list. User must have access to the board. */
  archiveList: List;
  /** Assign a member to a card. User must have access to the board. */
  assignMemberToCard: Card;
  /** Cancel a pending invitation. Only the inviter or workspace admin can cancel. */
  cancelInvitation: Scalars['Boolean']['output'];
  /** Create an attachment on a card. */
  createAttachment: Attachment;
  /** Create a new board. User must be ADMIN or MEMBER of the workspace (if provided). */
  createBoard: Board;
  /** Create a new card. Position is calculated automatically if not provided. */
  createCard: Card;
  /** Create a new checklist for a card. */
  createChecklist: Checklist;
  /** Create a comment on a card. */
  createComment: Comment;
  /** Create a new label for a board. User must have access to the board. */
  createLabel: Label;
  /** Create a new list. Position is calculated automatically if not provided. */
  createList: List;
  /** Create a new user (requires authentication) */
  createUser: User;
  /** Create a new workspace. The creator becomes an ADMIN automatically. */
  createWorkspace: Workspace;
  /** Delete an attachment. Uploader only. */
  deleteAttachment: Scalars['Boolean']['output'];
  /** Delete a board. Only board ADMIN can delete. */
  deleteBoard: Scalars['Boolean']['output'];
  /** Delete a card. User must have access to the board. */
  deleteCard: Scalars['Boolean']['output'];
  /** Delete a checklist. */
  deleteChecklist: Scalars['Boolean']['output'];
  /** Delete a checklist item. */
  deleteChecklistItem: Scalars['Boolean']['output'];
  /** Delete a comment. Author only. */
  deleteComment: Scalars['Boolean']['output'];
  /** Delete a label. User must have access to the board. */
  deleteLabel: Scalars['Boolean']['output'];
  /** Delete a list. Cards are automatically deleted via cascade. */
  deleteList: Scalars['Boolean']['output'];
  /** Delete a user by ID (requires authentication) */
  deleteUser: Scalars['Boolean']['output'];
  /** Delete a workspace. Only ADMIN members can delete. */
  deleteWorkspace: Scalars['Boolean']['output'];
  /** Request a password reset. A reset token will be sent to the provided email address if the account exists. */
  forgotPassword: MessageResponse;
  /** Invite a member to a workspace. Only ADMIN members can invite. */
  inviteMember: WorkspaceInvitation;
  /** Join a workspace via invite link. Adds current user as MEMBER if not already a member. */
  joinWorkspaceByInviteLink: Scalars['Boolean']['output'];
  /** Leave a board. Cannot leave if you are the last admin. */
  leaveBoard: Scalars['Boolean']['output'];
  /** Leave a workspace. Cannot leave if you are the last admin. */
  leaveWorkspace: Scalars['Boolean']['output'];
  /** Login with email and password. Returns a JWT token for authenticated requests. */
  login: AuthPayload;
  /** Move a card to a different list within the same board. Position is calculated automatically if not provided. */
  moveCard: Card;
  /** Register a new user account. If companyName is provided, a workspace is automatically created. */
  register: AuthPayload;
  /** Reject a workspace invitation. */
  rejectInvitation: WorkspaceInvitation;
  /** Remove a member from a board. Only board ADMIN can remove members. */
  removeBoardMember: Scalars['Boolean']['output'];
  /** Remove a label from a card. User must have access to the board. */
  removeLabelFromCard: Card;
  /** Remove a member from a workspace. Only ADMIN can remove members. */
  removeMember: Scalars['Boolean']['output'];
  /** Reorder multiple cards within the same list. All cards must belong to the same list. */
  reorderCards: Array<Card>;
  /** Reorder items in a checklist. */
  reorderChecklistItems: Array<ChecklistItem>;
  /** Reorder multiple lists at once. All lists must belong to the same board. */
  reorderLists: Array<List>;
  /** Reset password using a valid reset token. The token is received via email after requesting a password reset. */
  resetPassword: MessageResponse;
  /** Unarchive a board. User must be ADMIN or MEMBER. */
  unarchiveBoard: Board;
  /** Unassign a member from a card. User must have access to the board. */
  unassignMemberFromCard: Card;
  /** Update an attachment. Uploader only. */
  updateAttachment: Attachment;
  /** Update a board. User must be ADMIN or MEMBER of the board. */
  updateBoard: Board;
  /** Update a member role in a board. Only board ADMIN can update roles. */
  updateBoardMemberRole: Scalars['Boolean']['output'];
  /** Update a card. User must have access to the board. */
  updateCard: Card;
  /** Update a checklist title. */
  updateChecklist: Checklist;
  /** Update a checklist item (content, checked, position). */
  updateChecklistItem: ChecklistItem;
  /** Update a comment. Author only. */
  updateComment: Comment;
  /** Update a label. User must have access to the board. */
  updateLabel: Label;
  /** Update a list. User must have access to the board. */
  updateList: List;
  /** Update a member role in a workspace. Only ADMIN can update roles. */
  updateMemberRole: Scalars['Boolean']['output'];
  /** Update an existing user (requires authentication) */
  updateUser: User;
  /** Update a workspace. Only ADMIN members can update. */
  updateWorkspace: Workspace;
  /** Verify email address using the verification token received via email. A welcome email will be sent upon successful verification. */
  verifyEmail: MessageResponse;
};


export type MutationAcceptInvitationArgs = {
  input: RespondInvitationInput;
};


export type MutationAddBoardMemberArgs = {
  input: AddBoardMemberInput;
};


export type MutationAddChecklistItemArgs = {
  input: AddChecklistItemInput;
};


export type MutationAddLabelToCardArgs = {
  input: AddLabelToCardInput;
};


export type MutationArchiveBoardArgs = {
  id: Scalars['ID']['input'];
};


export type MutationArchiveListArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAssignMemberToCardArgs = {
  input: AssignMemberToCardInput;
};


export type MutationCancelInvitationArgs = {
  invitationId: Scalars['ID']['input'];
};


export type MutationCreateAttachmentArgs = {
  input: CreateAttachmentInput;
};


export type MutationCreateBoardArgs = {
  input: CreateBoardInput;
};


export type MutationCreateCardArgs = {
  input: CreateCardInput;
};


export type MutationCreateChecklistArgs = {
  input: CreateChecklistInput;
};


export type MutationCreateCommentArgs = {
  input: CreateCommentInput;
};


export type MutationCreateLabelArgs = {
  input: CreateLabelInput;
};


export type MutationCreateListArgs = {
  input: CreateListInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationCreateWorkspaceArgs = {
  input: CreateWorkspaceInput;
};


export type MutationDeleteAttachmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteBoardArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCardArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteChecklistArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteChecklistItemArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCommentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteLabelArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteListArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWorkspaceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationForgotPasswordArgs = {
  input: ForgotPasswordInput;
};


export type MutationInviteMemberArgs = {
  input: InviteMemberInput;
};


export type MutationJoinWorkspaceByInviteLinkArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type MutationLeaveBoardArgs = {
  boardId: Scalars['ID']['input'];
};


export type MutationLeaveWorkspaceArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMoveCardArgs = {
  input: MoveCardInput;
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRejectInvitationArgs = {
  input: RespondInvitationInput;
};


export type MutationRemoveBoardMemberArgs = {
  boardId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationRemoveLabelFromCardArgs = {
  input: RemoveLabelFromCardInput;
};


export type MutationRemoveMemberArgs = {
  input: RemoveMemberInput;
};


export type MutationReorderCardsArgs = {
  input: ReorderCardsInput;
};


export type MutationReorderChecklistItemsArgs = {
  input: ReorderChecklistItemsInput;
};


export type MutationReorderListsArgs = {
  input: ReorderListsInput;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};


export type MutationUnarchiveBoardArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnassignMemberFromCardArgs = {
  input: UnassignMemberFromCardInput;
};


export type MutationUpdateAttachmentArgs = {
  input: UpdateAttachmentInput;
};


export type MutationUpdateBoardArgs = {
  input: UpdateBoardInput;
};


export type MutationUpdateBoardMemberRoleArgs = {
  input: UpdateBoardMemberRoleInput;
};


export type MutationUpdateCardArgs = {
  input: UpdateCardInput;
};


export type MutationUpdateChecklistArgs = {
  input: UpdateChecklistInput;
};


export type MutationUpdateChecklistItemArgs = {
  input: UpdateChecklistItemInput;
};


export type MutationUpdateCommentArgs = {
  input: UpdateCommentInput;
};


export type MutationUpdateLabelArgs = {
  input: UpdateLabelInput;
};


export type MutationUpdateListArgs = {
  input: UpdateListInput;
};


export type MutationUpdateMemberRoleArgs = {
  input: UpdateMemberRoleInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};


export type MutationUpdateWorkspaceArgs = {
  id: Scalars['ID']['input'];
  input: UpdateWorkspaceInput;
};


export type MutationVerifyEmailArgs = {
  token: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  /** Get an attachment by ID. User must have access to the board. */
  attachment: Attachment;
  /** Get a board by ID. Access based on visibility and membership. */
  board: Board;
  /** List all labels for a board. User must have access to the board. */
  boardLabels: Array<Label>;
  /** Get a card by ID. User must have access to the board. */
  card: Card;
  /** List attachments for a card. User must have access to the board. */
  cardAttachments: Array<Attachment>;
  /** List all checklists for a card. User must have access to the board. */
  cardChecklists: Array<Checklist>;
  /** List comments for a card. User must have access to the board. */
  cardComments: Array<Comment>;
  /** Get a checklist by ID. User must have access to the board. */
  checklist: Checklist;
  /** Get a comment by ID. User must have access to the board. */
  comment: Comment;
  /** Get a list by ID. User must have access to the board. */
  list: List;
  /** Get the currently authenticated user information */
  me?: Maybe<User>;
  /** Get all pending invitations for the current user. */
  myInvitations: Array<WorkspaceInvitation>;
  /** Get all workspaces where the current user is a member */
  myWorkspaces: Array<Workspace>;
  /** Get a user by ID (requires authentication) */
  user?: Maybe<User>;
  /** Get a user by email (for invite flows; requires authentication) */
  userByEmail?: Maybe<User>;
  /** Get all users (requires authentication) */
  users: Array<User>;
  /** Get a workspace by ID. User must be a member to access. */
  workspace: Workspace;
  /** List all boards in a workspace. User must be a workspace member. */
  workspaceBoards: Array<Board>;
  /** Get pending invitations for a workspace. Only ADMIN can view. */
  workspaceInvitations: Array<WorkspaceInvitation>;
  /** Get workspace name/logo for the invite link page. Public. */
  workspaceInviteInfo: WorkspaceInviteInfo;
  /** Get all members of a workspace. User must be a member to view. */
  workspaceMembers: Array<WorkspaceMemberWithUser>;
};


export type QueryAttachmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBoardArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBoardLabelsArgs = {
  boardId: Scalars['ID']['input'];
};


export type QueryCardArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCardAttachmentsArgs = {
  cardId: Scalars['ID']['input'];
};


export type QueryCardChecklistsArgs = {
  cardId: Scalars['ID']['input'];
};


export type QueryCardCommentsArgs = {
  cardId: Scalars['ID']['input'];
};


export type QueryChecklistArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCommentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryListArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserByEmailArgs = {
  email: Scalars['String']['input'];
};


export type QueryWorkspaceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWorkspaceBoardsArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryWorkspaceInvitationsArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryWorkspaceInviteInfoArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryWorkspaceMembersArgs = {
  workspaceId: Scalars['ID']['input'];
};

/** Input for user registration */
export type RegisterInput = {
  /** Optional company name - creates a workspace if provided */
  companyName?: InputMaybe<Scalars['String']['input']>;
  /** User email address (must be unique) */
  email: Scalars['String']['input'];
  /** User full name (minimum 3 characters) */
  name: Scalars['String']['input'];
  /** User password (minimum 6 characters) */
  password: Scalars['String']['input'];
};

export type RemoveLabelFromCardInput = {
  cardId: Scalars['ID']['input'];
  labelId: Scalars['ID']['input'];
};

export type RemoveMemberInput = {
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type ReorderCardsInput = {
  cardPositions: Array<CardPosition>;
  listId: Scalars['ID']['input'];
};

export type ReorderChecklistItemsInput = {
  checklistId: Scalars['ID']['input'];
  itemPositions: Array<ChecklistItemPositionInput>;
};

export type ReorderListsInput = {
  boardId: Scalars['ID']['input'];
  listPositions: Array<ListPosition>;
};

/** Input for resetting password with token */
export type ResetPasswordInput = {
  /** New password (minimum 6 characters) */
  newPassword: Scalars['String']['input'];
  /** Password reset token received via email */
  token: Scalars['String']['input'];
};

export type RespondInvitationInput = {
  invitationId: Scalars['String']['input'];
};

export type UnassignMemberFromCardInput = {
  cardId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type UpdateAttachmentInput = {
  filename?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  size?: InputMaybe<Scalars['Int']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBoardInput = {
  background?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Visibility>;
};

export type UpdateBoardMemberRoleInput = {
  boardId: Scalars['ID']['input'];
  role: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};

export type UpdateCardInput = {
  background?: InputMaybe<Scalars['String']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Card description with markdown support */
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['ID']['input'];
  position?: InputMaybe<Scalars['Float']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateChecklistInput = {
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateChecklistItemInput = {
  checked?: InputMaybe<Scalars['Boolean']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  position?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateCommentInput = {
  content: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};

export type UpdateLabelInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateListInput = {
  id: Scalars['ID']['input'];
  position?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMemberRoleInput = {
  role: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type UpdateUserInput = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWorkspaceInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Board visibility settings */
export type Visibility =
  | 'PRIVATE'
  | 'PUBLIC'
  | 'WORKSPACE';

export type Workspace = {
  __typename?: 'Workspace';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  memberCount: Scalars['Float']['output'];
  memberships?: Maybe<Array<WorkspaceMember>>;
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  visibility: Visibility;
};

export type WorkspaceInvitation = {
  __typename?: 'WorkspaceInvitation';
  createdAt: Scalars['DateTime']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  inviteeEmail: Scalars['String']['output'];
  inviteeId?: Maybe<Scalars['ID']['output']>;
  inviterId: Scalars['ID']['output'];
  inviterName?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  status: InvitationStatus;
  updatedAt: Scalars['DateTime']['output'];
  workspaceId: Scalars['ID']['output'];
  workspaceName?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceInviteInfo = {
  __typename?: 'WorkspaceInviteInfo';
  id: Scalars['ID']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  id: Scalars['ID']['output'];
  joinedAt: Scalars['DateTime']['output'];
  role: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type WorkspaceMemberWithUser = {
  __typename?: 'WorkspaceMemberWithUser';
  id: Scalars['ID']['output'];
  joinedAt: Scalars['DateTime']['output'];
  role: Scalars['String']['output'];
  user: MemberUser;
  userId: Scalars['ID']['output'];
  workspaceId: Scalars['ID']['output'];
};
