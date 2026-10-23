# Task-Flow

A personal task manager. Add, edit, complete, filter and delete tasks, stored in a PostgreSQL database.

**Live demo:** _add your Vercel frontend URL here_
**API:** _add your Vercel backend URL here_

## Tech stack

| Layer     | Choice                                   |
| --------- | ---------------------------------------- |
| Frontend  | React 18, Vite, plain CSS                |
| Backend   | Node.js, Express 4 (ES modules)          |
| Database  | PostgreSQL on Neon, raw parameterised SQL via `pg` |
| Testing   | Vitest + Supertest                       |
| Hosting   | Vercel (two projects: `backend`, `frontend`) |

## Features

- View tasks with title, description, status and creation date
- Add, edit (inline) and delete tasks (with a confirmation step)
- Toggle pending / completed with a checkbox
- Filter by All, Pending, Completed
- Priority (Low / Medium / High) with tasks sorted by priority
- Optional due date, with overdue pending tasks highlighted in red
- Validation on both the client and the API (empty title returns `400`)
- Mobile-responsive layout

## Project structure

```
task-flow/
├── backend/
│   ├── api/index.js            # Vercel serverless entry point
│   ├── db/schema.sql           # tasks table definition
│   ├── scripts/initDb.js       # creates the table
│   ├── src/
│   │   ├── routes/             # endpoint definitions
│   │   ├── controllers/        # request handlers
│   │   ├── models/             # SQL queries
│   │   ├── middleware/         # 404 + error handling
│   │   ├── utils/              # validation, HttpError
│   │   ├── config/db.js        # connection pool
│   │   └── app.js              # Express app / server entry
│   ├── tests/tasks.test.js
│   ├── .env.example
│   └── vercel.json
├── frontend/
│   ├── src/
│   │   ├── components/         # TaskForm, TaskList, TaskItem, FilterBar
│   │   ├── services/           # API calls
│   │   ├── styles/App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env.example
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- A free [Neon](https://neon.tech) account (or any PostgreSQL database)

## Run locally

### 1. Create the database

1. In Neon, create a project and copy the **connection string** (it ends in `?sslmode=require`).

### 2. Backend

```bash
cd backend
cp .env.example .env        # then paste your Neon string into DATABASE_URL
npm install
npm run db:init             # creates or upgrades the tasks table (safe to re-run)
npm run dev                 # API on http://localhost:4000
```

### 3. Frontend (second terminal)

```bash
cd frontend
npm install
npm run dev                 # App on http://localhost:5173
```

`.env` is not needed for the frontend locally: Vite proxies `/api` to `localhost:4000`.

### 4. Tests

```bash
cd backend
npm test
```

## Environment variables

| App      | Variable        | Purpose                                                |
| -------- | --------------- | ------------------------------------------------------ |
| backend  | `DATABASE_URL`  | Neon / PostgreSQL connection string                    |
| backend  | `PORT`          | Local port (default `4000`)                            |
| backend  | `CORS_ORIGIN`   | Allowed frontend origin(s), comma-separated            |
| frontend | `VITE_API_URL`  | Deployed backend URL, no trailing slash (production only) |

## API

All responses are JSON. Success: `{ "data": ... }`. Errors: `{ "error": { "message": "...", "details": [...] } }`.

| Method | Endpoint                | Body                              | Success | Errors   |
| ------ | ----------------------- | --------------------------------- | ------- | -------- |
| GET    | `/api/tasks`            |                                   | 200     | 500      |
| POST   | `/api/tasks`            | `{ title, description?, priority?, due_date? }` | 201     | 400, 500 |
| PUT    | `/api/tasks/:id`        | `{ title?, description?, status?, priority?, due_date? }` | 200   | 400, 404, 500 |
| PATCH  | `/api/tasks/:id/toggle` |                                   | 200     | 400, 404, 500 |
| DELETE | `/api/tasks/:id`        |                                   | 200     | 400, 404, 500 |

## Deploy to Vercel

Deploy the backend and frontend as two separate Vercel projects from the same repository.

**Backend**

1. Vercel > Add New > Project > import the repo, set **Root Directory** to `backend`.
2. Add environment variables: `DATABASE_URL` and `CORS_ORIGIN` (the frontend URL, set after step 2 below; redeploy once it is known).
3. Deploy. Check `https://<backend>.vercel.app/api/health`.

**Frontend**

1. Add New > Project > same repo, **Root Directory** `frontend` (Vite is detected automatically).
2. Add `VITE_API_URL` = the backend URL, then deploy.
3. Copy the frontend URL into the backend's `CORS_ORIGIN` and redeploy the backend.

Run `npm run db:init` once locally against the same Neon database before first use.

## Design decisions

- **Raw SQL with `pg`:** every query is parameterised (`$1`, `$2`). The only dynamic SQL in `update` is built from a fixed column whitelist, so user input never reaches the query text.
- **Layered backend:** routes → controllers → models, with validation and error handling in their own modules.
- **Consistent API shape:** a single `{ data }` / `{ error }` envelope, so the frontend has one place (`taskService.js`) that unwraps responses.
- **Inline delete confirmation** instead of `window.confirm`, which is easier to use on mobile and easy to test.

## AI assistance

_Replace with an honest note, for example: "I used Claude to scaffold the initial structure, then reviewed, ran and modified the code myself."_ Be ready to explain every file in the interview.

`priority` is `low`, `medium` (default) or `high`. `due_date` is `YYYY-MM-DD` or `null`/`""` for none. `GET /api/tasks` returns tasks ordered by priority, then newest first.

## Bonus checklist

- [x] Filter bar (All / Pending / Completed)
- [x] Due date with overdue highlighting
- [x] Backend unit tests (`backend/tests/tasks.test.js`, run with `npm test`)
- [x] Priority field with sort by priority
- [ ] Deployed (follow "Deploy to Vercel" and paste the URLs at the top)

## Known limitations / next steps

- Frontend has no automated tests.
- No pagination on `GET /api/tasks`.
