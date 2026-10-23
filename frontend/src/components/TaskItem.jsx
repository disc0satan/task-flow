import { useState } from 'react';
import { PRIORITIES, formatDate, isOverdue, priorityLabel } from '../utils/taskUtils.js';

export default function TaskItem({ task, onToggle, onSave, onDelete }) {
  const [mode, setMode] = useState('view'); // 'view' | 'edit' | 'confirm-delete'
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isCompleted = task.status === 'completed';
  const overdue = isOverdue(task);

  function startEdit() {
    setTitle(task.title);
    setDescription(task.description ?? '');
    setPriority(task.priority);
    setDueDate(task.due_date ?? '');
    setError('');
    setMode('edit');
  }

  async function handleSave(event) {
    event.preventDefault();
    if (title.trim() === '') {
      setError('Title cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      await onSave(task.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate || null,
      });
      setMode('view');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (mode === 'edit') {
    return (
      <li className="task">
        <form className="task-edit" onSubmit={handleSave} noValidate>
          <label htmlFor={`title-${task.id}`}>Title</label>
          <input
            id={`title-${task.id}`}
            type="text"
            value={title}
            maxLength={255}
            aria-invalid={Boolean(error)}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label htmlFor={`desc-${task.id}`}>Description</label>
          <textarea
            id={`desc-${task.id}`}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="field-row">
            <div>
              <label htmlFor={`priority-${task.id}`}>Priority</label>
              <select
                id={`priority-${task.id}`}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`due-${task.id}`}>Due date</label>
              <input
                id={`due-${task.id}`}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <div className="task-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" className="btn" onClick={() => setMode('view')}>
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  const classes = ['task', isCompleted && 'is-completed', overdue && 'is-overdue']
    .filter(Boolean)
    .join(' ');

  return (
    <li className={classes}>
      <input
        type="checkbox"
        className="check"
        checked={isCompleted}
        onChange={() => onToggle(task.id)}
        aria-label={`Mark "${task.title}" as ${isCompleted ? 'pending' : 'completed'}`}
      />

      <div className="task-body">
        <p className="task-title">{task.title}</p>
        {task.description && <p className="task-description">{task.description}</p>}

        <p className="task-meta">
          <span className={`chip chip-${task.priority}`}>{priorityLabel(task.priority)} priority</span>
          {task.due_date && (
            <span className={overdue ? 'due is-overdue' : 'due'}>
              {overdue ? 'Overdue: ' : 'Due '}
              {formatDate(task.due_date)}
            </span>
          )}
          <span>
            {isCompleted ? 'Completed' : 'Pending'}, added {formatDate(task.created_at)}
          </span>
        </p>

        {mode === 'confirm-delete' ? (
          <div className="task-actions" role="alertdialog" aria-label="Confirm delete">
            <span className="confirm-text">Delete this task permanently?</span>
            <button type="button" className="btn btn-danger" onClick={() => onDelete(task.id)}>
              Delete
            </button>
            <button type="button" className="btn" onClick={() => setMode('view')}>
              Keep
            </button>
          </div>
        ) : (
          <div className="task-actions">
            <button type="button" className="btn" onClick={startEdit}>
              Edit
            </button>
            <button type="button" className="btn" onClick={() => setMode('confirm-delete')}>
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
