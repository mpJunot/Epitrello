export type CardRow = {
  id: string;
  title: string;
  boardId: string;
  boardTitle: string;
  boardBackground?: string | null;
  listId: string;
  listTitle: string;
  dueDate?: string | null;
  completed?: boolean;
  labels?: Array<{ id: string; name?: string | null; color?: string | null }>;
  assigneeIds?: string[];
  workspaceName?: string;
};

export type SortOption = 'board' | 'list' | 'dueDate';

export type DueDateFilter = 'all' | 'overdue' | 'dueThisWeek' | 'dueThisMonth' | 'noDate';

export type AssigneeFilter = 'all' | 'assignedToMe';
