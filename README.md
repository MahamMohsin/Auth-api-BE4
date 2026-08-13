# Auth API

A secure API with Sign Up, Log In, Log Out, and protected routes, built with **Node.js + Express** and **Supabase Auth** as the identity provider.

Built for FlyRank Internship — Backend Track, Week 2, Assignment A4/BE-03 (Auth · Login & protect).

## What this is

An API that never handles passwords or cryptography itself — Supabase stores accounts, hashes passwords, and issues signed JWTs. This server's job is to: forward signup/login credentials to Supabase, verify the JWTs Supabase hands back, and guard specific routes so they only answer for a logged-in user.

## Tech stack

- Node.js + Express 5
- `@supabase/supabase-js` — Supabase Auth SDK
- `dotenv` — loads `.env` into `process.env`
- `swagger-ui-express` — interactive API docs with Bearer auth support

## Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy your **Project URL** and **anon public key** (never the `service_role` key).
3. In **Authentication → Sign In / Providers → Email**, turn **"Confirm email" OFF** (so a fresh signup can log in immediately, for local testing).
4. Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
PORT=3000
```

## How to run

```bash
npm install
npm start
```

Server runs at `http://localhost:3000`.
Swagger docs (with Bearer auth "Authorize" button): `http://localhost:3000/docs`

## Endpoints

| Method | Path                    | Auth required | Description                          | Success | Errors |
|--------|-------------------------|:---:|----------------------------------------|---------|--------|
| POST   | `/auth/signup`          | No  | Create a new user account (`{email, password}`) | 201 | 400 missing fields |
| POST   | `/auth/login`           | No  | Log in, returns `access_token` + `refresh_token` | 200 | 400 missing fields, 401 invalid credentials |
| POST   | `/auth/logout`          | **Yes** | End the session | 204 | 401 missing/invalid token |
| GET    | `/public/info`          | No  | Open, unprotected data | 200 | – |
| GET    | `/protected/profile`    | **Yes** | Returns the logged-in user's id/email/created_at | 200 | 401 missing/invalid/expired token |
| GET    | `/protected/dashboard`  | **Yes** | Second protected route — proves the middleware is reusable | 200 | 401 missing/invalid/expired token |

## Sample requests

```bash
# Sign up
curl -i -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
```
HTTP/1.1 201 Created
{"user": {"id": "...", "email": "test@example.com", ...}}
```

```bash
# Log in
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
```
HTTP/1.1 200 OK
{"access_token": "eyJhbGci...", "refresh_token": "...", "user": {...}}
```

```bash
# Access a protected route
curl -i http://localhost:3000/protected/profile \
  -H "Authorization: Bearer eyJhbGci..."
```
```
HTTP/1.1 200 OK
{"id": "...", "email": "test@example.com", "created_at": "..."}
```

```bash
# Tampered token
curl -i http://localhost:3000/protected/profile \
  -H "Authorization: Bearer eyJhbGci...tampered"
```
```
HTTP/1.1 401 Unauthorized
{"error": "Invalid or expired token"}
```

## Swagger UI

Open `http://localhost:3000/docs`. Protected routes show a lock icon. Click **Authorize**, paste an `access_token` from `/auth/login`, and use **Try it out** on `/protected/profile` directly from the browser.

*(Swagger screenshot goes here.)*

## Middleware — how the guard works

`middleware/auth.middleware.js` exports `requireAuth`, applied to every protected route:

1. Reads the `Authorization` header, requires the exact `Bearer <token>` shape — a missing or malformed header returns `401 { "error": "Access token required" }` without ever calling Supabase.
2. If a token is present, calls `supabase.auth.getUser(token)` — a real network call to Supabase, so the result is trustworthy (not just decoding the JWT locally).
3. Invalid/expired/tampered token → `401 { "error": "Invalid or expired token" }`.
4. Valid token → attaches `req.user` and calls `next()`. The route handler never re-checks auth — it just reads `req.user`.

`/protected/profile` and `/protected/dashboard` both use this same middleware with zero duplicated auth code — proving the guard is reusable.

## Why logout can't force-invalidate a JWT here

`POST /auth/logout` calls Supabase's `signOut()`, but with only the `anon` key (no `service_role` key — which the assignment explicitly says never to use client-side), a stateless backend cannot server-side revoke one specific user's already-issued JWT. If you take a valid token and keep calling `/protected/profile` with it after "logging out," it will keep working until the token's natural expiry (Supabase default: 1 hour). This is a real, well-known limitation of stateless JWTs, not a bug in this implementation — it's the same reason refresh tokens and short access-token lifetimes exist.
