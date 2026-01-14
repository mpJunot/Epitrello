export type Label = { id: string; name?: string; color?: string };
export type UserRef = { id: string; name?: string; avatar?: string; email?: string };
export type Card = {
  id: string;
  title: string;
  description?: string;
  labels?: Label[];
  assignees?: UserRef[];
};
