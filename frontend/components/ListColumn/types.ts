import type {
  Card as GqlCard,
  List as GqlList,
  Label as GqlLabel,
  MemberUser,
} from '@/lib/graphql-types';

export type Label = GqlLabel;

export type UserRef = MemberUser;

export type Card = Pick<GqlCard, 'id' | 'title' | 'description' | 'position' | 'listId' | 'startDate' | 'dueDate' | 'coverUrl'> & {
  completed?: boolean;
  assignees?: UserRef[];
};

export type List = Pick<GqlList, 'id' | 'title' | 'position'> & {
  cards?: Card[];
};

export type ListColumnProps = {
  list: List;
  totalListsCount?: number;
  allLists?: List[];
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
};

export type SortOption = 'date-newest' | 'date-oldest' | 'due-date' | 'alpha-asc' | 'alpha-desc';
