export type Label = { id: string; name?: string; color?: string };
export type UserRef = { id: string; name?: string; avatar?: string; email?: string };
export type ChecklistItem = { id: string; text: string; checked: boolean };
export type Checklist = { id: string; title: string; items: ChecklistItem[] };
export type DueDate = { date: string; isComplete: boolean };
export type Comment = { id: string; text: string; author: UserRef; createdAt: string };
export type Card = {
  id: string;
  title: string;
  description?: string;
  labels?: Label[];
  assignees?: UserRef[];
  checklists?: Checklist[];
  dueDate?: DueDate;
  comments?: Comment[];
  completed?: boolean;
};
