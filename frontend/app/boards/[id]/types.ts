import type {
  Board as GqlBoard,
  BoardMemberWithUser,
  List as GqlList,
  Card as GqlCard,
  Visibility,
} from '@/lib/graphql-types';

export type Card = Pick<
  GqlCard,
  'id' | 'title' | 'description' | 'position' | 'listId' | 'dueDate' | 'startDate' | 'completed' | 'assignees'
>;

export type List = Pick<GqlList, 'id' | 'title' | 'position'> & {
  cards?: Card[];
};

export type BoardMember = BoardMemberWithUser;

export type Board = Omit<GqlBoard, 'lists'> & {
  visibility: Visibility;
  members?: BoardMember[];
  lists?: List[];
};
