import type {
  Board as GqlBoard,
  BoardMemberWithUser,
  List as GqlList,
  Card as GqlCard,
  Visibility,
  MemberUser,
  Label as GqlLabel,
} from '@/lib/graphql-types';

export type Card = Pick<
  GqlCard,
  'id' | 'title' | 'description' | 'position' | 'listId' | 'dueDate' | 'startDate' | 'completed' | 'background' | 'createdAt'
> & {
  assignees?: Array<MemberUser>;
  labels?: Array<GqlLabel>;
  checklists?: Array<{
    id: string;
    title: string;
    items?: Array<{
      id: string;
      checked: boolean;
      content: string;
      position: number;
      checklistId: string;
    }>;
  }>;
};

export type List = Pick<GqlList, 'id' | 'title' | 'position' | 'isArchived'> & {
  cards?: Card[];
};

export type BoardMember = BoardMemberWithUser;

export type Board = Omit<GqlBoard, 'lists'> & {
  visibility: Visibility;
  members?: BoardMember[];
  lists?: List[];
};
