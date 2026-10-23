import TaskItem from './TaskItem.jsx';

const EMPTY_MESSAGES = {
  all: 'No tasks yet. Use the Add task button to create your first one.',
  pending: 'Nothing pending. Every task is done.',
  completed: 'No completed tasks yet.',
};

export default function TaskList({ tasks, filter, onToggle, onSave, onDelete }) {
  if (tasks.length === 0) {
    return <p className="status-text">{EMPTY_MESSAGES[filter]}</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onSave={onSave}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
