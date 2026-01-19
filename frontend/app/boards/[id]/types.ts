export interface Card {
  id: string;
  title: string;
  description?: string;
  position?: number;
  listId?: string;
}

export interface List {
  id: string;
  title: string;
  position?: number;
  cards?: Card[];
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  background?: string;
  visibility?: string;
  workspaceId?: string;
  createdAt?: string;
  updatedAt?: string;
  lists?: List[];
}
