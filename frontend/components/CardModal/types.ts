import type {
  Label as GqlLabel,
  MemberUser,
  Checklist as GqlChecklist,
  ChecklistItem as GqlChecklistItem,
  Card as GqlCard,
} from '@/lib/graphql-types';

export type Label = Omit<GqlLabel, 'boardId'> & {
  boardId?: string;
};
export type UserRef = MemberUser;
export type ChecklistItem = GqlChecklistItem & {
  text?: string;
};
export type Checklist = Omit<GqlChecklist, 'cardId'> & {
  cardId?: string;
  items?: ChecklistItem[];
};
export type DueDate = { date: string; isComplete: boolean };
export type Comment = { id: string; text: string; author: UserRef; createdAt: string };
export type Card = Pick<GqlCard, 'id' | 'title' | 'description' | 'position' | 'dueDate' | 'startDate' | 'coverUrl'> & {
  listId?: string;
  labels?: Label[];
  assignees?: UserRef[];
  checklists?: Checklist[];
  comments?: Comment[];
  completed?: boolean;
};
