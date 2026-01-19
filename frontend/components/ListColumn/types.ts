export type Label = { 
  id: string; 
  name?: string; 
  color?: string 
};

export type UserRef = { 
  id: string; 
  name?: string; 
  avatar?: string; 
  email?: string 
};

export type Card = {
  id: string;
  title: string;
  description?: string;
  labels?: Label[];
  assignees?: UserRef[];
};

export type List = {
  id: string;
  title: string;
  cards?: Card[];
};

export type ListColumnProps = {
  list: List;
  totalListsCount?: number;
  allLists?: List[];
};

export type SortOption = 'date-newest' | 'date-oldest' | 'due-date' | 'alpha-asc' | 'alpha-desc';
