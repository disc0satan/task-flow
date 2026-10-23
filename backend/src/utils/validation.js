export const TASK_STATUSES = ['pending', 'completed'];
const MAX_TITLE_LENGTH = 255;

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

// Empty or whitespace-only descriptions are stored as NULL.
function normaliseDescription(description) {
  const trimmed = typeof description === 'string' ? description.trim() : '';
  return trimmed === '' ? null : trimmed;
}

export function validateCreate(body = {}) {
  const errors = [];
  const titleError = validateTitle(body.title);
  if (titleError) errors.push(titleError);

  const description = body.description ?? null;
  const descriptionError = validateDescription(description);
  if (descriptionError) errors.push(descriptionError);

  return {
    errors,
    value: {
      title: errors.length ? null : body.title.trim(),
      description: normaliseDescription(description),
    },
  };
}

export function validateUpdate(body = {}) {
  const errors = [];
  const value = {};

  if ('title' in body) {
    const titleError = validateTitle(body.title);
    if (titleError) errors.push(titleError);
    else value.title = body.title.trim();
  }

  if ('description' in body) {
    const descriptionError = validateDescription(body.description);
    if (descriptionError) errors.push(descriptionError);
    else value.description = normaliseDescription(body.description);
  }

  if ('status' in body) {
    if (!TASK_STATUSES.includes(body.status)) {
      errors.push(`Status must be one of: ${TASK_STATUSES.join(', ')}.`);
    } else {
      value.status = body.status;
    }
  }

  if (!['title', 'description', 'status'].some((key) => key in body)) {
    errors.push('Provide at least one of: title, description, status.');
  }

  return { errors, value };
}
