import * as Task from '../models/taskModel.js';
import { HttpError } from '../utils/httpError.js';
import { parseId, validateCreate, validateUpdate } from '../utils/validation.js';

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function requireId(req) {
  const id = parseId(req.params.id);
  if (id === null) throw new HttpError(400, 'Task id must be a positive integer.');
  return id;
}

function requireFound(task) {
  if (!task) throw new HttpError(404, 'Task not found.');
  return task;
}

function throwIfInvalid(errors) {
  if (errors.length) throw new HttpError(400, errors[0], errors);
}

export const listTasks = asyncHandler(async (req, res) => {
  res.json({ data: await Task.findAll() });
});

export const createTask = asyncHandler(async (req, res) => {
  const { errors, value } = validateCreate(req.body);
  throwIfInvalid(errors);
  res.status(201).json({ data: await Task.create(value) });
});

export const updateTask = asyncHandler(async (req, res) => {
  const id = requireId(req);
  const { errors, value } = validateUpdate(req.body);
  throwIfInvalid(errors);
  res.json({ data: requireFound(await Task.update(id, value)) });
});

export const toggleTask = asyncHandler(async (req, res) => {
  const id = requireId(req);
  res.json({ data: requireFound(await Task.toggle(id)) });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const id = requireId(req);
  res.json({ data: requireFound(await Task.remove(id)) });
});
