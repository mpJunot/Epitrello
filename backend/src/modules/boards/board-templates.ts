/**
 * Predefined board templates (Trello-style).
 * Each template defines list titles and optional sample cards per list.
 */

export type BoardTemplateList = {
  title: string;
  position: number;
  sampleCards?: { title: string; position: number }[];
};

export type BoardTemplate = {
  id: string;
  name: string;
  description: string;
  lists: BoardTemplateList[];
};

export const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Empty board with To Do, Doing, Done',
    lists: [
      { title: 'To Do', position: 0 },
      { title: 'Doing', position: 1 },
      { title: 'Done', position: 2 },
    ],
  },
  {
    id: 'kanban',
    name: 'Kanban',
    description: 'Classic Kanban: To Do, In Progress, Done',
    lists: [
      { title: 'To Do', position: 0, sampleCards: [{ title: 'Get started', position: 0 }] },
      { title: 'In Progress', position: 1 },
      { title: 'Done', position: 2 },
    ],
  },
  {
    id: 'sprint',
    name: 'Sprint',
    description: 'Agile sprint: Backlog, To Do, In Progress, In Review, Done',
    lists: [
      { title: 'Backlog', position: 0 },
      { title: 'To Do', position: 1 },
      { title: 'In Progress', position: 2 },
      { title: 'In Review', position: 3 },
      { title: 'Done', position: 4 },
    ],
  },
  {
    id: 'project',
    name: 'Project',
    description: 'Project tracking: To Do, In Progress, Blocked, Done',
    lists: [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Blocked', position: 2 },
      { title: 'Done', position: 3 },
    ],
  },
];

const TEMPLATES_BY_ID = new Map(BOARD_TEMPLATES.map((t) => [t.id, t]));

export function getBoardTemplate(templateId: string | null | undefined): BoardTemplate {
  if (!templateId) {
    return BOARD_TEMPLATES[0]; // blank
  }
  return TEMPLATES_BY_ID.get(templateId) ?? BOARD_TEMPLATES[0];
}
