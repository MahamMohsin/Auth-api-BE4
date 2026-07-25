# Task API

A simple in-memory CRUD API for managing a to-do list, built with **Node.js + Express** using a layered architecture (routes → controllers → services → repositories).

Built for FlyRank Internship - Week 2, Assignment BE-01 (Backend AI Engineering track).

## What this is

A REST API that lets you create, read, update, and delete tasks. Data is stored in memory (a plain JavaScript array) — it resets whenever the server restarts. No database is used yet (that comes in a later stage of the program).

## Tech stack

- Node.js
- Express 5
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
├── routes/tasks.routes.js            # path/method → controller mapping
├── controllers/tasks.controller.js   # handles req/res and HTTP status codes
├── services/tasks.service.js         # business logic and validation
├── repositories/tasks.repository.js  # in-memory data storage
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

## The mortality experiment

Tasks are stored in a plain JavaScript array in `repositories/tasks.repository.js`. If the server is restarted, all created/updated/deleted changes are lost and the API resets to the original 3 seed tasks. This happens because the data only lives in the Node process's memory — nothing is written to disk. This is the reason a real database is introduced in a later stage of the program.

## Architecture

This project uses a layered architecture instead of a single file:

- **Routes** — only map a path + method to a controller function.
- **Controllers** — handle HTTP concerns only (reading `req`, setting status codes).
- **Services** — hold business rules (e.g. "title can't be empty"), with no knowledge of Express.
- **Repositories** — hold the actual data and CRUD operations on it; this is the only layer that would need to change if a real database were introduced later.

This keeps each layer independently testable and isolates future changes (like swapping in a database) to a single layer.
