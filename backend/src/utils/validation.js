export const TASK_STATUSES = ['pending', 'completed'];
export const TASK_PRIORITIES = ['low', 'medium', 'high'];
const MAX_TITLE_LENGTH = 255;
const UPDATABLE_KEYS = ['title', 'description', 'status', 'priority', 'due_date'];

export function parseId(raw) {
  return /^\d+$/.test(raw) ? Number(raw) : null;
}

function validateTitle(title) {
  if (typeof title !== 'string' || title.trim() === '') {
    return 'Title is required.';
  }
  if (title.trim().length > MAX_TITLE_LENGTH) {
    return `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }
  return null;
}

function validateDescription(description) {
  if (description !== null && typeof description !== 'string') {
    return 'Description must be text.';
  }
  return null;
}

function validatePriority(priority) {
  return TASK_PRIORITIES.includes(priority)
    ? null
    : `Priority must be one of: ${TASK_PRIORITIES.join(', ')}.`;
}

// Accepts null (no due date) or a real calendar date formatted YYYY-MM-DD.
function validateDueDate(dueDate) {
  if (dueDate === null) return null;
  const isRealDate =
    typeof dueDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(dueDate) &&
    new Date(`${dueDate}T00:00:00Z`).toISOString().slice(0, 10) === dueDate;
  return isRealDate ? null : 'Due date must be a valid date (YYYY-MM-DD).';
}

// Empty or whitespace-only text is stored as NULL.
function normaliseOptionalText(value) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed === '' ? null : trimmed;
}

// An empty due date string from a cleared date input means "no due date".
function normaliseDueDate(dueDate) {
  return dueDate === '' ? null : dueDate;
}

export function validateCreate(body = {}) {
  const errors = [];
  const description = body.description ?? null;
  const priority = body.priority ?? 'medium';
  const dueDate = normaliseDueDate(body.due_date ?? null);

  const checks = [
    validateTitle(body.title),
    validateDescription(description),
    validatePriority(priority),
    validateDueDate(dueDate),
  ];
  checks.forEach((error) => error && errors.push(error));

  return {
    errors,
    value: {
      title: errors.length ? null : body.title.trim(),
      description: normaliseOptionalText(description),
      priority,
      due_date: dueDate,
    },
  };
}

export function validateUpdate(body = {}) {
  const errors = [];
  const value = {};

  function check(key, validate, normalise = (v) => v) {
    if (!(key in body)) return;
    const input = normalise(body[key]);
    const error = validate(input);
    if (error) errors.push(error);
    else value[key] = input;
  }

  check('title', validateTitle, (v) => (typeof v === 'string' ? v.trim() : v));
  check('description', validateDescription, normaliseOptionalText);
  check('status', (v) =>
    TASK_STATUSES.includes(v) ? null : `Status must be one of: ${TASK_STATUSES.join(', ')}.`
  );
  check('priority', validatePriority);
  check('due_date', validateDueDate, normaliseDueDate);

  if (!UPDATABLE_KEYS.some((key) => key in body)) {
    errors.push(`Provide at least one of: ${UPDATABLE_KEYS.join(', ')}.`);
  }

  return { errors, value };
}
