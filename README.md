# Task-Flow

A personal task manager built as a full-stack mini project. Add, edit, complete, filter, prioritise and delete tasks. Everything is stored in a PostgreSQL database and served through a REST API.

|||
|-|-|
|**Live app**|https://task-flow-7cel.vercel.app|
|**Live API**|https://task-flow-zeta-gold.vercel.app (try `/api/health` or `/api/tasks`)|

## Tech stack

|Layer|Choice|
|-|-|
|Frontend|React 18, Vite, plain CSS (no CSS framework)|
|Backend|Node.js, Express 4 (ES modules)|
|Database|PostgreSQL on [Neon](https://neon.tech), raw parameterised SQL via `pg`|
|Testing|Vitest + Supertest|
|Hosting|Vercel, as two projects (`backend` and `frontend`)|

## Features

* View all tasks with title, description, status, priority, due date and creation date
* Add tasks from a popup form opened by the floating **+ Add task** button
* Edit tasks inline (title, description, priority, due date)
* Mark tasks complete or pending with one click; completed tasks get a strikethrough
* Delete tasks with an inline confirmation step
* Filter by All, Pending or Completed
* Priority (Low / Medium / High); tasks are sorted by priority, then newest first
* Optional due date; overdue pending tasks are highlighted in red
* Validation on both the client (instant feedback) and the API (`400` on invalid input)
* Mobile-responsive layout

## Project structure

```
task-flow/
├── backend/
│   ├── api/index.js              # Vercel serverless entry point
│   ├── db/schema.sql             # tasks table definition (safe to re-run)
│   ├── scripts/initDb.js         # applies schema.sql
│   ├── src/
│   │   ├── routes/               # endpoint definitions
│   │   ├── controllers/          # request handlers
│   │   ├── models/               # SQL queries
│   │   ├── middleware/           # 404 and error handling
│   │   ├── utils/                # validation, HttpError
│   │   ├── config/db.js          # connection pool
│   │   └── app.js                # Express app / local server entry
│   ├── tests/tasks.test.js       # API tests
│   ├── .env.example
│   └── vercel.json
├── frontend/
│   ├── src/
│   │   ├── components/           # TaskForm, TaskList, TaskItem, FilterBar
│   │   ├── services/             # API calls (taskService.js)
│   │   ├── utils/                # sorting, overdue check, date formatting
│   │   ├── styles/App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Prerequisites

* Node.js 18 or newer (and npm)
* A free [Neon](https://neon.tech) account, or any PostgreSQL database

## Run locally

### 1\. Create the database

Create a project in Neon and copy its **connection string** (Connect > Connection string). It ends in `?sslmode=require`.

### 2\. Start the backend

```bash
git clone https://github.com/<your-username>/task-flow.git
cd task-flow/backend
cp .env.example .env      # then paste your connection string into DATABASE\_URL
npm install
npm run db:init           # creates the tasks table (safe to re-run)
npm run dev               # API at http://localhost:4000
```

`npm run db:init` runs `db/schema.sql`. Alternatively, paste the contents of `backend/db/schema.sql` into Neon's SQL Editor and run it.

### 3\. Start the frontend (second terminal)

```bash
cd task-flow/frontend
npm install
npm run dev               # app at http://localhost:5173
```

No `.env` is needed for the frontend locally, because Vite proxies `/api` to `http://localhost:4000`.

### 4\. Run the tests

```bash
cd backend
npm test
```

The tests run the real Express app with the database layer mocked, so they need no database connection.

## Environment variables

|App|Variable|Purpose|
|-|-|-|
|backend|`DATABASE\_URL`|Neon / PostgreSQL connection string (**secret**, never commit it)|
|backend|`PORT`|Local port, default `4000` (ignored on Vercel)|
|backend|`CORS\_ORIGIN`|Allowed frontend origin(s), comma-separated, no trailing slash|
|frontend|`VITE\_API\_URL`|Deployed backend URL, no trailing slash (production only)|

Real `.env` files are git-ignored. Each app has a `.env.example` with placeholder values.

## Database schema

Table `tasks`:

|Column|Type|Notes|
|-|-|-|
|`id`|`SERIAL`|Primary key, auto-generated|
|`title`|`VARCHAR(255)`|Required, not null|
|`description`|`TEXT`|Optional, nullable|
|`status`|`VARCHAR(20)`|`'pending'` or `'completed'` (CHECK)|
|`priority`|`VARCHAR(10)`|`'low'`, `'medium'` (default), `'high'`|
|`due\_date`|`DATE`|Optional, nullable|
|`created\_at`|`TIMESTAMPTZ`|Set automatically on insert|
|`updated\_at`|`TIMESTAMPTZ`|Updated on every change|

## API

All responses are JSON. Success: `{ "data": ... }`. Errors: `{ "error": { "message": "...", "details": \[...] } }`.

|Method|Endpoint|Body|Success|Errors|
|-|-|-|-|-|
|GET|`/api/tasks`||200|500|
|POST|`/api/tasks`|`{ title, description?, priority?, due\_date? }`|201|400, 500|
|PUT|`/api/tasks/:id`|`{ title?, description?, status?, priority?, due\_date? }`|200|400, 404, 500|
|PATCH|`/api/tasks/:id/toggle`||200|400, 404, 500|
|DELETE|`/api/tasks/:id`||200|400, 404, 500|

* `priority` is `low`, `medium` (default) or `high`.
* `due\_date` is `YYYY-MM-DD`, or `null` / `""` for no due date.
* `GET /api/tasks` returns tasks ordered by priority, then newest first.
* An invalid or non-numeric id returns `400`; an unknown id returns `404`; unknown routes return `404`.
* `GET /api/health` is a simple liveness check.

## Deploy to Vercel

Deploy the backend and frontend as two separate Vercel projects from the same repository.

**Backend**

1. Vercel > Add New > Project > import the repo and set **Root Directory** to `backend`.
2. Add environment variables `DATABASE\_URL` and `CORS\_ORIGIN` (the frontend's main domain).
3. Deploy, then check `https://<backend>.vercel.app/api/health`.
4. If the API shows a Vercel login page, turn off **Deployment Protection** (Settings > Deployment Protection).

**Frontend**

1. Add New > Project > same repo, **Root Directory** `frontend` (Vite is detected automatically).
2. Add `VITE\_API\_URL` set to the backend URL. Use type **Config**, not Secret: it is a public URL that Vite embeds in the browser bundle.
3. Deploy.

**Finish**

1. Set the backend's `CORS\_ORIGIN` to the frontend's main domain (for example `https://task-flow-7cel.vercel.app`), then redeploy the backend.
2. Create the table once by running `backend/db/schema.sql` in Neon's SQL Editor (or `npm run db:init` locally).

Open the app from its main domain. Vercel also creates a unique URL for every deployment, and those are blocked by `CORS\_ORIGIN`. Environment variable changes only apply after a redeploy.

## Design decisions

* **Raw SQL with `pg`.** Every query is parameterised (`$1`, `$2`). The only dynamic SQL is in `update`, where column names come from a fixed whitelist, so user input never reaches the query text.
* **Layered backend.** Routes call controllers, controllers call models, with validation and error handling in their own modules.
* **Consistent API shape.** One `{ data }` / `{ error }` envelope, so the frontend unwraps responses in a single place (`taskService.js`).
* **Validation on both sides.** The frontend gives instant feedback; the API is the source of truth and rejects bad input with `400`.
* **Dates as plain strings.** `due\_date` is returned as `YYYY-MM-DD` to avoid timezone shifts; overdue is computed in the user's local time.
* **Inline delete confirmation** instead of `window.confirm`, which works better on mobile.
* **Add form in a popup.** The list is the main view and the form opens on demand from a floating button.

## AI assistance

I used Claude (Anthropic's AI assistant) to build this project. I chose the tech stack and architecture, and I made the major decisions about the API design, how the frontend and backend connect and deploy, and the styling and layout. Claude wrote the code from my prompts and direction.

After that, I read through all of the code, tested the application manually, and traced the error cases myself, including empty and invalid input, unknown ids, CORS and environment variable problems, and persistence after refresh. I also used Claude to help make this README thorough.

## Bonus features

* \[x] Filter bar (All / Pending / Completed)
* \[x] Due date with overdue highlighting
* \[x] Backend unit tests (`backend/tests/tasks.test.js`, run with `npm test`)
* \[x] Priority field with sort by priority
* \[x] Deployed on Vercel (links at the top)

## Known limitations and next steps

* The backend tests mock the database; an integration test against a real test database would be a good addition.
* The frontend has no automated tests.
* `GET /api/tasks` has no pagination.
* There is no authentication, as the brief specifies a single user.

