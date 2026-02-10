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

export type Activity = {
  __typename?: 'Activity';
  board?: Maybe<Board>;
  boardId: Scalars['ID']['output'];
  cardId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  listId?: Maybe<Scalars['ID']['output']>;
  payload?: Maybe<ActivityPayload>;
  type: ActivityType;
  user?: Maybe<User>;
  userId: Scalars['ID']['output'];
};

export type ActivityPayload = {
  __typename?: 'ActivityPayload';
  boardTitle?: Maybe<Scalars['String']['output']>;
  cardTitle?: Maybe<Scalars['String']['output']>;
  commentPreview?: Maybe<Scalars['String']['output']>;
  listName?: Maybe<Scalars['String']['output']>;
  memberName?: Maybe<Scalars['String']['output']>;
  targetListName?: Maybe<Scalars['String']['output']>;
};

/** Type of user action recorded in the activity log */
export type ActivityType =
  | 'BOARD_ARCHIVED'
  | 'BOARD_UNARCHIVED'
  | 'CARD_ARCHIVED'
  | 'CARD_COMPLETED'
  | 'CARD_CREATED'
  | 'CARD_MOVED'
  | 'CARD_UNARCHIVED'
  | 'CARD_UNCOMPLETED'
  | 'COMMENT_ADDED'
  | 'LIST_ARCHIVED'
  | 'LIST_UNARCHIVED'
  | 'MEMBER_ADDED_TO_BOARD'
  | 'MEMBER_ADDED_TO_CARD';

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

export type BoardActivityInput = {
  /** Cursor for pagination (activity id). */
  cursor?: InputMaybe<Scalars['ID']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
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

export type BoardTemplate = {
  __typename?: 'BoardTemplate';
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  /** List titles in order */
  listTitles: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
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
  isArchived: Scalars['Boolean']['output'];
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

export type CommentDeletedEvent = {
  __typename?: 'CommentDeletedEvent';
  cardId: Scalars['ID']['output'];
  commentId: Scalars['ID']['output'];
};

export type CopyBoardInput = {
  background?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  /** ID of the board to copy (lists, cards, labels, checklists). */
  sourceBoardId: Scalars['ID']['input'];
  /** Title for the new board. */
  title: Scalars['String']['input'];
  visibility?: InputMaybe<Visibility>;
  workspaceId?: InputMaybe<Scalars['ID']['input']>;
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
  /** Predefined template: blank, kanban, sprint, project */
  templateId?: InputMaybe<Scalars['String']['input']>;
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

export type CreateTemplateInput = {
  description: Scalars['String']['input'];
  lists: Array<TemplateListInput>;
  name: Scalars['String']['input'];
  visibility?: InputMaybe<Visibility>;
  workspaceId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateUserInput = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
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
  /** Archive a card. User must have access to the board. */
  archiveCard: Card;
  /** Archive a list. User must have access to the board. */
  archiveList: List;
  /** Assign a member to a card. User must have access to the board. */
  assignMemberToCard: Card;
  /** Cancel a pending invitation. Only the inviter or workspace admin can cancel. */
  cancelInvitation: Scalars['Boolean']['output'];
  /** Copy a board (lists, cards, labels, checklists). New board has current user as ADMIN. */
  copyBoard: Board;
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
  /** Create a custom board template. Optional workspaceId to scope to a workspace. */
  createTemplate: Template;
  /** Create a template from an existing board (lists and cards become template structure). */
  createTemplateFromBoard: Template;
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
  /** Delete a template. Only creator or workspace admin. */
  deleteTemplate: Scalars['Boolean']['output'];
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
  /** Mark all notifications as read for the current user. Returns count updated. */
  markAllNotificationsRead: Scalars['Int']['output'];
  /** Mark a notification as read. */
  markNotificationRead: Notification;
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
  /** Unarchive a card. User must have access to the board. */
  unarchiveCard: Card;
  /** Unarchive a list. User must have access to the board. */
  unarchiveList: List;
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
  /** Update current user notification preferences. */
  updateMyNotificationPreferences: NotificationPreferences;
  /** Update a template. Only creator or workspace admin. */
  updateTemplate: Template;
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


export type MutationArchiveCardArgs = {
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


export type MutationCopyBoardArgs = {
  input: CopyBoardInput;
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


export type MutationCreateTemplateArgs = {
  input: CreateTemplateInput;
};


export type MutationCreateTemplateFromBoardArgs = {
  boardId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
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


export type MutationDeleteTemplateArgs = {
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


export type MutationMarkNotificationReadArgs = {
  id: Scalars['ID']['input'];
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


export type MutationUnarchiveCardArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnarchiveListArgs = {
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


export type MutationUpdateMyNotificationPreferencesArgs = {
  input: UpdateNotificationPreferencesInput;
};


export type MutationUpdateTemplateArgs = {
  input: UpdateTemplateInput;
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

export type MyActivityInput = {
  /** Cursor for pagination (activity id). Fetch activities older than this. */
  cursor?: InputMaybe<Scalars['ID']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Filter by workspace IDs. Only activities from boards in these workspaces. */
  workspaceIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type MyActivityResult = {
  __typename?: 'MyActivityResult';
  activities: Array<Activity>;
  hasMore: Scalars['Boolean']['output'];
  /** Cursor for next page (last activity id) */
  nextCursor?: Maybe<Scalars['ID']['output']>;
};

export type MyNotificationsInput = {
  /** Cursor for pagination (notification id) */
  cursor?: InputMaybe<Scalars['String']['input']>;
  /** Max number of notifications to return (default 20, max 50) */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** If true, only unread notifications */
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MyNotificationsResult = {
  __typename?: 'MyNotificationsResult';
  hasMore: Scalars['Boolean']['output'];
  /** Cursor for next page (last notification id) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  notifications: Array<Notification>;
};

export type Notification = {
  __typename?: 'Notification';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** JSON payload (cardId, boardId, workspaceId, etc.) */
  payload?: Maybe<Scalars['String']['output']>;
  read: Scalars['Boolean']['output'];
  type: NotificationType;
  userId: Scalars['ID']['output'];
};

/** How often to receive notification emails. */
export type NotificationEmailFrequency =
  | 'DAILY'
  | 'INSTANT'
  | 'NEVER'
  | 'PERIODICALLY';

export type NotificationPreferences = {
  __typename?: 'NotificationPreferences';
  allowDesktopNotifications: Scalars['Boolean']['output'];
  emailFrequency: NotificationEmailFrequency;
};

/** Type of notification (card assigned, due soon, comment, invitation, etc.) */
export type NotificationType =
  | 'BOARD_INVITATION'
  | 'CARD_ASSIGNED'
  | 'CARD_DUE_SOON'
  | 'COMMENT_ADDED'
  | 'WORKSPACE_INVITATION';

export type Query = {
  __typename?: 'Query';
  /** Get activity feed from all boards the user has access to (all members). Optional workspace filter. */
  activityFeed: MyActivityResult;
  /** Get archived cards for a board. User must have access to the board. */
  archivedCards: Array<Card>;
  /** Get archived lists for a board. User must have access to the board. */
  archivedLists: Array<List>;
  /** Get an attachment by ID. User must have access to the board. */
  attachment: Attachment;
  /** Get a board by ID. Access based on visibility and membership. */
  board: Board;
  /** Get activity for a board (all members). User must have access to the board. */
  boardActivity: MyActivityResult;
  /** List all labels for a board. User must have access to the board. */
  boardLabels: Array<Label>;
  /** List predefined board templates (blank, kanban, sprint, project). */
  boardTemplates: Array<BoardTemplate>;
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
  /** Get current user activity log with optional workspace filter and pagination. */
  myActivity: MyActivityResult;
  /** Get all pending invitations for the current user. */
  myInvitations: Array<WorkspaceInvitation>;
  /** Get current user notification preferences (email frequency, desktop notifications). */
  myNotificationPreferences: NotificationPreferences;
  /** Get current user notifications with pagination and optional unread filter. */
  myNotifications: MyNotificationsResult;
  /** Get all workspaces where the current user is a member */
  myWorkspaces: Array<Workspace>;
  /** Get a template by ID. User must have access (global or workspace member). */
  template: Template;
  /** List templates. If workspaceId is provided, returns global + workspace templates; otherwise global only. */
  templates: Array<Template>;
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


export type QueryActivityFeedArgs = {
  input?: InputMaybe<MyActivityInput>;
};


export type QueryArchivedCardsArgs = {
  boardId: Scalars['ID']['input'];
};


export type QueryArchivedListsArgs = {
  boardId: Scalars['ID']['input'];
};


export type QueryAttachmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBoardArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBoardActivityArgs = {
  boardId: Scalars['String']['input'];
  input?: InputMaybe<BoardActivityInput>;
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


export type QueryMyActivityArgs = {
  input?: InputMaybe<MyActivityInput>;
};


export type QueryMyNotificationsArgs = {
  input?: InputMaybe<MyNotificationsInput>;
};


export type QueryTemplateArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTemplatesArgs = {
  workspaceId?: InputMaybe<Scalars['ID']['input']>;
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

export type Subscription = {
  __typename?: 'Subscription';
  /** Subscribe to board members changes (add/remove/role). Refetch board to get updated members. */
  boardMembersUpdated: Scalars['Boolean']['output'];
  /** Subscribe to board metadata changes for a single board. */
  boardUpdated: Board;
  /** Subscribe to card deletions for a board. */
  cardDeleted: Scalars['ID']['output'];
  /** Subscribe to card create/update/move/delete for a board. */
  cardUpdated: Card;
  /** Subscribe to updates for a single card (e.g. card modal). */
  cardUpdatedByCardId: Card;
  /** Subscribe to new comments on a card. Filter by cardId. */
  commentAdded: Comment;
  /** Subscribe to comment deletions on a card. Payload has commentId and cardId. */
  commentDeleted: CommentDeletedEvent;
  /** Subscribe to comment edits on a card. Filter by cardId. */
  commentUpdated: Comment;
  /** Subscribe to list deletions for a board. */
  listDeleted: Scalars['ID']['output'];
  /** Subscribe to list create/update/reorder/delete for a board. */
  listUpdated: List;
  /** Subscribe to current user invitations changes (new invite, accept, reject, cancel). Invalidate myInvitations query when received. */
  myInvitationsUpdated: Scalars['Boolean']['output'];
  /** Real-time notifications for the current user (WebSocket). */
  notificationReceived: Notification;
  /** Subscribe to workspace pending invitations changes (invite, cancel, accept, reject). Invalidate workspace invitations query when received. */
  workspaceInvitationsUpdated: Scalars['Boolean']['output'];
  /** Subscribe to workspace members changes (add, remove, role update). Invalidate workspace members query when received. */
  workspaceMembersUpdated: Scalars['Boolean']['output'];
};


export type SubscriptionBoardMembersUpdatedArgs = {
  boardId: Scalars['ID']['input'];
};


export type SubscriptionBoardUpdatedArgs = {
  boardId: Scalars['ID']['input'];
};


export type SubscriptionCardDeletedArgs = {
  boardId: Scalars['ID']['input'];
};


export type SubscriptionCardUpdatedArgs = {
  boardId: Scalars['ID']['input'];
};


export type SubscriptionCardUpdatedByCardIdArgs = {
  cardId: Scalars['ID']['input'];
};


export type SubscriptionCommentAddedArgs = {
  cardId: Scalars['ID']['input'];
};


export type SubscriptionCommentDeletedArgs = {
  cardId: Scalars['ID']['input'];
};


export type SubscriptionCommentUpdatedArgs = {
  cardId: Scalars['ID']['input'];
};


export type SubscriptionListDeletedArgs = {
  boardId: Scalars['ID']['input'];
};


export type SubscriptionListUpdatedArgs = {
  boardId: Scalars['ID']['input'];
};


export type SubscriptionMyInvitationsUpdatedArgs = {
  userId: Scalars['ID']['input'];
};


export type SubscriptionWorkspaceInvitationsUpdatedArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type SubscriptionWorkspaceMembersUpdatedArgs = {
  workspaceId: Scalars['ID']['input'];
};

export type Template = {
  __typename?: 'Template';
  createdAt: Scalars['DateTime']['output'];
  creatorId: Scalars['ID']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lists: Array<TemplateListType>;
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  visibility: Visibility;
  workspaceId?: Maybe<Scalars['ID']['output']>;
};

export type TemplateListInput = {
  position: Scalars['Int']['input'];
  sampleCards?: InputMaybe<Array<TemplateSampleCardInput>>;
  title: Scalars['String']['input'];
};

export type TemplateListType = {
  __typename?: 'TemplateListType';
  position: Scalars['Int']['output'];
  sampleCards?: Maybe<Array<TemplateSampleCard>>;
  title: Scalars['String']['output'];
};

export type TemplateSampleCard = {
  __typename?: 'TemplateSampleCard';
  position: Scalars['Float']['output'];
  title: Scalars['String']['output'];
};

export type TemplateSampleCardInput = {
  position: Scalars['Float']['input'];
  title: Scalars['String']['input'];
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

export type UpdateNotificationPreferencesInput = {
  allowDesktopNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  emailFrequency?: InputMaybe<NotificationEmailFrequency>;
};

export type UpdateTemplateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  lists?: InputMaybe<Array<TemplateListInput>>;
  name?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Visibility>;
};

export type UpdateUserInput = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
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
