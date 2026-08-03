# Task API - db connection

A CRUD API for managing a to-do list, built with **Node.js + Express** using a layered architecture (routes → controllers → services → repositories), now backed by a real **SQLite** database.

Built for FlyRank Internship - Week 2/3, Assignments BE-01 and BE-02 (Backend AI Engineering track).

## What this is

A REST API that lets you create, read, update, and delete tasks. Data is stored in `tasks.db`, a SQLite database file, so it survives server restarts.

## Why SQLite

SQLite was chosen because it needs no separate database server — it's a single file (`tasks.db`) that the app creates automatically on first run. That makes it ideal for a small project like this: zero setup, zero config, and the whole database can be inspected with a lightweight viewer like DB Browser for SQLite.

## Where the database file is stored

`tasks.db` lives at the project root (same folder as `index.js`). It's created automatically the first time the server starts, and it's git-ignored since it's generated data, not source code.

## Tech stack

- Node.js
- Express 5
- better-sqlite3 (SQLite driver)
- swagger-ui-express (for interactive API docs)

## How to run

```bash
npm install
npm start
```

The server runs at `http://localhost:3000`.
Interactive API docs (Swagger UI) are available at `http://localhost:3000/docs`.

## Project structure

```
crud-api/
├── index.js                          # starts the server
├── app.js                            # express app setup, middleware, route mounting
├── db.js                             # SQLite connection, table creation, one-time seed
├── tasks.db                          # SQLite database file (auto-created, git-ignored)
├── routes/tasks.routes.js            # path/method → controller mapping
├── controllers/tasks.controller.js   # handles req/res and HTTP status codes
├── services/tasks.service.js         # business logic and validation
├── repositories/tasks.repository.js  # SQL queries against tasks.db
└── openapi.json                      # OpenAPI spec consumed by Swagger UI
```

## Endpoints

| Method | Path         | Description                          | Success | Errors                          |
|--------|--------------|---------------------------------------|---------|----------------------------------|
| GET    | `/`          | API info                              | 200     | –                                |
| GET    | `/health`    | Health check                          | 200     | –                                |
| GET    | `/tasks`     | List all tasks                        | 200     | –                                |
| GET    | `/tasks/:id` | Get a single task                     | 200     | 404 if not found                 |
| POST   | `/tasks`     | Create a task (`{ "title": "..." }`)  | 201     | 400 if title is missing/empty    |
| PUT    | `/tasks/:id` | Update a task's title and/or done     | 200     | 400 invalid body, 404 not found  |
| DELETE | `/tasks/:id` | Delete a task                         | 204     | 404 if not found                 |

## Sample request/response

```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship the assignment"}'
```

```
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"id":4,"title":"Ship the assignment","done":false}
```

```bash
curl -i http://localhost:3000/tasks/99
```

```
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8

{"error":"Task 99 not found"}
```

## Swagger UI

Open `http://localhost:3000/docs` to test the full CRUD cycle interactively.

*(Screenshot of the Swagger UI CRUD cycle goes here.)*

## Persistence

Tasks are stored in SQLite (`tasks.db`) instead of a plain JavaScript array. On startup, `db.js` creates the `tasks` table if it doesn't exist yet, and inserts 3 example tasks only if the table is empty. Because the data lives on disk instead of in the Node process's memory, restarting the server no longer resets anything — created, updated, and deleted tasks stay exactly as they were.

## Exploring the database manually

Open `tasks.db` with [DB Browser for SQLite](https://sqlitebrowser.org/) and run queries directly against it — changes show up immediately through the API. Example:

```sql
SELECT * FROM tasks WHERE done = 1;
```

*(Screenshot of DB Browser for SQLite goes here.)*

## Architecture

This project uses a layered architecture instead of a single file:

- **Routes** — only map a path + method to a controller function.
- **Controllers** — handle HTTP concerns only (reading `req`, setting status codes).
- **Services** — hold business rules (e.g. "title can't be empty"), with no knowledge of Express.
- **Repositories** — hold the actual data and CRUD operations on it; this is the only layer that would need to change if a real database were introduced later.

This keeps each layer independently testable and isolates future changes (like swapping in a database) to a single layer.
