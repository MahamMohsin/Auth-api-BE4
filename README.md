# Task API - containerization

A CRUD API for managing a to-do list, built with **Node.js + Express**, using a layered architecture (routes → controllers → services → repositories), backed by **PostgreSQL running in Docker**.

Built for FlyRank Internship — Backend Track, Week 3, Assignment A3/BE-04 (Containerize your stack).

## What this is

A REST API for creating, reading, updating, and deleting tasks. This is the third storage swap in the same project:

| Stage | Where tasks live |
|---|---|
| A1 | an array in memory |
| A2 | a `tasks.db` SQLite file |
| A3 (this) | rows in a containerized Postgres database |

The API's routes, request/response shapes, and status codes have not changed across any of these three swaps — only the `repositories/tasks.repository.js` module (and `db.js`) changed. This proves storage is an implementation detail, not part of the API contract.

**One necessary change:** the `pg` driver is asynchronous (Promise-based), unlike `better-sqlite3` which was synchronous. So the service and controller functions are now `async`/`await` — but their logic, paths, and status codes are identical to A1/A2.

## Tech stack

- Node.js + Express 5
- PostgreSQL 16 (official Docker image)
- `pg` (node-postgres) — database driver, parameterized queries
- `dotenv` — loads `.env` into `process.env`
- Docker + Docker Compose
- `swagger-ui-express` — interactive API docs

## How to run (one command)

```bash
cp .env.example .env
docker compose up
```

This brings up both the API (`http://localhost:3000`) and a Postgres database, creates the `tasks` table if missing, and seeds 3 example tasks on first run.

Swagger docs: `http://localhost:3000/docs`

### Environment variables

Set in `.env` (git-ignored — see `.env.example` for the required keys):

```
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
```

Inside Docker Compose, the app reaches Postgres via the service name `db`, not `localhost` — already configured in `compose.yaml`.

### Running without Docker (local development)

```bash
npm install
# make sure a Postgres server is running locally and DATABASE_URL in .env points to it
npm start
```

## Project structure

```
crud-api/
├── index.js                          # loads .env, starts the server
├── app.js                            # express app setup, middleware, route mounting
├── db.js                             # Postgres connection pool, table creation, seed data
├── routes/tasks.routes.js            # path/method → controller mapping (unchanged since A1)
├── controllers/tasks.controller.js   # handles req/res and HTTP status codes
├── services/tasks.service.js         # business logic and validation (unchanged since A1)
├── repositories/tasks.repository.js  # Postgres queries — the only module that changed
├── openapi.json                      # OpenAPI spec consumed by Swagger UI
├── Dockerfile                        # builds the app image
├── compose.yaml                      # api + db services, started together
├── .env.example                      # committed placeholder env values
└── .env                              # real secrets — git-ignored, never committed
```

## Endpoints

| Method | Path         | Description                          | Success | Errors                          |
|--------|--------------|----------------------------------------|---------|----------------------------------|
| GET    | `/`          | API info                              | 200     | –                                |
| GET    | `/health`    | Health check (pings the database)     | 200     | –                                |
| GET    | `/tasks`     | List all tasks                        | 200     | –                                |
| GET    | `/tasks/:id` | Get a single task                     | 200     | 404 if not found                 |
| POST   | `/tasks`     | Create a task (`{ "title": "..." }`)  | 201     | 400 if title is missing/empty    |
| PUT    | `/tasks/:id` | Update a task's title and/or done     | 200     | 400 invalid body, 404 not found  |
| DELETE | `/tasks/:id` | Delete a task                         | 204     | 404 if not found                 |

## Sample request/response

```bash
curl -i http://localhost:3000/tasks
```

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":1,"title":"Buy milk","done":false},{"id":2,"title":"Walk dog","done":false},{"id":3,"title":"Write code","done":true},{"id":4,"title":"docker task","done":false}]
```

## Persistence proof

Tested by:
1. Running `docker compose up`, then creating a task (`"docker task"`, id 4) via a POST request.
2. Running `docker compose down` — this stops and removes both containers.
3. Running `docker compose up` again — a fresh `db` container starts, but attaches to the same named volume (`taskdata`).
4. Confirmed via `GET /tasks` and directly in the database — task id 4 was still present after the full teardown and restart.

Database contents, queried directly inside the container:

```bash
docker exec -it crud-api-db-1 psql -U postgres -d tasks -c "SELECT * FROM tasks;"
```

```
 id |    title    | done
----+--------------+------
  1 | Buy milk     | f
  2 | Walk dog     | f
  3 | Write code   | t
  4 | docker task  | f
(4 rows)
```

![Database contents showing 4 tasks including "docker task", proving data survived a full docker compose down/up cycle](./docs/db-screenshot.png)

This confirms the named volume (`taskdata` in `compose.yaml`) is what keeps Postgres's data files on disk — without it, `docker compose down` would delete the container and all its data with it.

## Database schema

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id serial PRIMARY KEY,
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false
);
```

Seeded only if the table is empty on startup — restarting never duplicates the seed rows (verified across multiple `docker compose down`/`up` cycles).

## Architecture

- **Routes** — map a path + method to a controller function. Unchanged since A1.
- **Controllers** — handle HTTP concerns (status codes, req/res). Now `async` because the database driver is Promise-based.
- **Services** — hold business rules (e.g. "title can't be empty"). No knowledge of Express or Postgres.
- **Repositories** — the only layer that talks to the database. This is the module that changed at every storage swap (array → SQLite → Postgres) while everything above it stayed the same.