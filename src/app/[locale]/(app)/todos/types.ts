export interface FamilyMember {
  id: string;
  name: string;
  avatarColor: string;
}

export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TodoItemData {
  id: string;
  title: string;
  notes: string | null;
  done: boolean;
  priority: TodoPriority;
  dueDate: Date | null;
  assignee: FamilyMember | null;
}

/** Preset swatches for todo lists. */
export const LIST_COLORS = [
  '#6366f1', // indigo
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#ef4444', // red
  '#84cc16', // lime
] as const;
