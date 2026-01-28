import type {
  Label as GqlLabel,
  MemberUser,
  Card as GqlCard,
} from '@/lib/graphql-types';

export type Label = GqlLabel;
export type UserRef = MemberUser;
export type Card = Pick<GqlCard, 'id' | 'title' | 'description' | 'position' | 'background'> & {
  labels?: Label[];
  assignees?: UserRef[];
  completed?: boolean;
  dueDate?: string | null;
  startDate?: string | null;
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
