export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export const priorityLabel = (value) =>
  PRIORITIES.find((p) => p.value === value)?.label ?? value;

// High priority first; newest first within the same priority.
export function sortTasks(tasks) {
  return [...tasks].sort(
    (a, b) =>
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
      new Date(b.created_at) - new Date(a.created_at)
  );
}

const pad = (n) => String(n).padStart(2, '0');

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// A pending task is overdue once its due date is before today (local time).
export const isOverdue = (task) =>
  task.status === 'pending' && Boolean(task.due_date) && task.due_date < todayString();

export function formatDate(value) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(...value.split('-').map((n, i) => (i === 1 ? n - 1 : Number(n))))
    : new Date(value);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
