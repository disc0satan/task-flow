import { Router } from 'express';
import {
  createTask,
  deleteTask,
  listTasks,
  toggleTask,
  updateTask,
} from '../controllers/taskController.js';

const router = Router();

router.get('/', listTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/toggle', toggleTask);
router.delete('/:id', deleteTask);

export default router;
