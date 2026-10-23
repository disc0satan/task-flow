const BASE_URL = `${import.meta.env.VITE_API_URL ?? ''}/api/tasks`;

async function request(path = '', options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error?.message ?? 'Something went wrong. Try again.');
  }
  return body.data;
}

export const getTasks = () => request();

export const createTask = (task) =>
  request('', { method: 'POST', body: JSON.stringify(task) });

export const updateTask = (id, changes) =>
  request(`/${id}`, { method: 'PUT', body: JSON.stringify(changes) });

export const toggleTask = (id) => request(`/${id}/toggle`, { method: 'PATCH' });

export const deleteTask = (id) => request(`/${id}`, { method: 'DELETE' });
