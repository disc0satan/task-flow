import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim());
app.use(cors({ origin: allowedOrigins ?? '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ data: { status: 'ok' } }));
app.use('/api/tasks', taskRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Vercel imports the app as a function; locally we start a normal server.
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

export default app;
