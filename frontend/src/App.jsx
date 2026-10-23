import { useEffect, useState } from 'react';
import FilterBar from './components/FilterBar.jsx';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import * as taskService from './services/taskService.js';
import { sortTasks } from './utils/taskUtils.js';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loadState, setLoadState] = useState('loading');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  async function loadTasks() {
    setLoadState('loading');
    try {
      setTasks(await taskService.getTasks());
      setLoadState('ready');
    } catch (err) {
      setMessage(err.message);
      setLoadState('error');
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (!showForm) return undefined;
    const closeOnEscape = (event) => event.key === 'Escape' && setShowForm(false);
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [showForm]);

  const replaceTask = (updated) =>
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

  async function runAction(action) {
    setMessage('');
    try {
      await action();
    } catch (err) {
      setMessage(err.message);
    }
  }

  const handleAdd = async (input) => {
    const created = await taskService.createTask(input);
    setTasks((prev) => [created, ...prev]);
    setShowForm(false);
  };

  const handleSave = async (id, changes) => {
    replaceTask(await taskService.updateTask(id, changes));
  };

  const handleToggle = (id) =>
    runAction(async () => replaceTask(await taskService.toggleTask(id)));

  const handleDelete = (id) =>
    runAction(async () => {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };
  const visibleTasks = sortTasks(
    filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)
  );

  return (
    <main className="app">
      <header className="app-header">
        <h1>Task-Flow</h1>
        <p>{counts.pending} pending, {counts.completed} completed</p>
      </header>

      {message && (
        <p className="banner" role="alert">
          {message}
        </p>
      )}

      {loadState === 'loading' && <p className="status-text">Loading tasks…</p>}

      {loadState === 'error' && (
        <div className="status-text">
          <button type="button" className="btn" onClick={loadTasks}>
            Retry loading tasks
          </button>
        </div>
      )}

      {loadState === 'ready' && (
        <>
          <FilterBar filter={filter} counts={counts} onChange={setFilter} />
          <TaskList
            tasks={visibleTasks}
            filter={filter}
            onToggle={handleToggle}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </>
      )}

      <button type="button" className="fab" onClick={() => setShowForm(true)}>
        <span aria-hidden="true">+</span> Add task
      </button>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-task-heading">
            <h2 id="add-task-heading">New task</h2>
            <TaskForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </main>
  );
}
