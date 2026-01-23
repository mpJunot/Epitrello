import type {
  Label as GqlLabel,
  MemberUser,
  Card as GqlCard,
} from '@/lib/graphql-types';

export type Label = GqlLabel;
export type UserRef = MemberUser;
export type Card = Pick<GqlCard, 'id' | 'title' | 'description' | 'position'> & {
  labels?: Label[];
  assignees?: UserRef[];
  completed?: boolean;
};
