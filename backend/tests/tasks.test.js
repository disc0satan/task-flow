import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/models/taskModel.js');

const Task = await import('../src/models/taskModel.js');
const { default: app } = await import('../src/app.js');

const sampleTask = {
  id: 1,
  title: 'Write README',
  description: null,
  status: 'pending',
  created_at: '2026-01-01T10:00:00.000Z',
  updated_at: '2026-01-01T10:00:00.000Z',
};

beforeEach(() => vi.resetAllMocks());

describe('POST /api/tasks', () => {
  it('creates a task and returns 201', async () => {
    Task.create.mockResolvedValue(sampleTask);

    const res = await request(app).post('/api/tasks').send({ title: '  Write README  ' });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual(sampleTask);
    expect(Task.create).toHaveBeenCalledWith({ title: 'Write README', description: null });
  });

  it('rejects an empty title with 400', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Title is required.');
    expect(Task.create).not.toHaveBeenCalled();
  });
});

describe('GET /api/tasks', () => {
  it('returns all tasks', async () => {
    Task.findAll.mockResolvedValue([sampleTask]);

    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('PUT /api/tasks/:id', () => {
  it('returns 404 when the task does not exist', async () => {
    Task.update.mockResolvedValue(null);

    const res = await request(app).put('/api/tasks/99').send({ title: 'New title' });

    expect(res.status).toBe(404);
  });

  it('rejects an invalid status with 400', async () => {
    const res = await request(app).put('/api/tasks/1').send({ status: 'done' });

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/tasks/:id/toggle', () => {
  it('returns the toggled task', async () => {
    Task.toggle.mockResolvedValue({ ...sampleTask, status: 'completed' });

    const res = await request(app).patch('/api/tasks/1/toggle');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
  });

  it('rejects a non-numeric id with 400', async () => {
    const res = await request(app).patch('/api/tasks/abc/toggle');

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('returns 404 when the task does not exist', async () => {
    Task.remove.mockResolvedValue(null);

    const res = await request(app).delete('/api/tasks/99');

    expect(res.status).toBe(404);
  });
});
