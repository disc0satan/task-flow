import { useState } from 'react';
import { PRIORITIES } from '../utils/taskUtils.js';

export default function TaskForm({ onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (title.trim() === '') {
      setError('Enter a title to add a task.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onAdd({
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate || null,
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="new-title">Title</label>
      <input
        id="new-title"
        type="text"
        autoFocus
        value={title}
        maxLength={255}
        placeholder="What needs doing?"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'new-title-error' : undefined}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label htmlFor="new-description">Description (optional)</label>
      <textarea
        id="new-description"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="field-row">
        <div>
          <label htmlFor="new-priority">Priority</label>
          <select id="new-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
            {PRIORITIES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="new-due">Due date (optional)</label>
          <input
            id="new-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p id="new-title-error" className="field-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Adding…' : 'Add task'}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
