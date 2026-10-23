import { useState } from 'react';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function TaskItem({ task, onToggle, onSave, onDelete }) {
  const [mode, setMode] = useState('view'); // 'view' | 'edit' | 'confirm-delete'
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isCompleted = task.status === 'completed';

  function startEdit() {
    setTitle(task.title);
    setDescription(task.description ?? '');
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
      await onSave(task.id, { title: title.trim(), description: description.trim() });
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

  return (
    <li className={`task${isCompleted ? ' is-completed' : ''}`}>
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
          {isCompleted ? 'Completed' : 'Pending'}, added {formatDate(task.created_at)}
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
