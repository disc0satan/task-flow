import { useState } from 'react';

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
      await onAdd({ title: title.trim(), description: description.trim() });
      setTitle('');
      setDescription('');
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

      {error && (
        <p id="new-title-error" className="field-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? 'Adding…' : 'Add task'}
      </button>
    </form>
  );
}
