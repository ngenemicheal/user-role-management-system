# User Role Management System

A full-stack role-based access control (RBAC) application for managing users across four roles (student, teacher, admin, super-admin) with JWT authentication, bcrypt-hashed passwords, hierarchical visibility rules, role editing, and super-admin user deletion.

## Overview

This project includes:

- A React frontend with registration, login, and a home dashboard that lists users, edits roles (permissions permitting), and deletes users (super-admin only)
- An Express backend with REST APIs for auth, role-aware user listing, role updates, and user deletion
- MongoDB with Mongoose for persisting users with an enum-based `role` field
- JWT-based authentication with tokens stored on the client and verified on the server
- A configurable super-admin assigned automatically by email at registration time
- Hierarchical role visibility and role-editing rules enforced on both client and server
- A Tailwind-styled responsive UI with role-aware action buttons and an edit-role modal
- Production serving of the built React client from the Express backend

## Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM v7
- Axios
- React Hot Toast
- Tailwind CSS

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JSON Web Token (JWT)
- bcrypt
- CORS
- dotenv
- express-validator (installed but not wired into route handlers yet)

## Project Structure

```text
user-role-management-system/
├── client/
│   ├── src/
│   │   ├── components/    # Register, Login, Home pages
│   │   ├── App.jsx        # Root routes with react-router
│   │   ├── main.jsx       # React entry
│   │   └── ...
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── controllers/       # user.controller.js (all business logic)
│   ├── models/            # user.model.js (Mongoose schema)
│   ├── routes/            # user.route.js (API routes)
│   ├── index.js           # Express server entry + MongoDB connect
│   └── package.json
├── package.json           # Root build/start scripts
└── README.md
```

## Features

### Authentication & Users
- Register a new user with first/last name, email, password, and password confirmation
- Auto-assigns `student` role by default; assigns `super-admin` if the email matches `SUPER_ADMIN` env var
- Duplicate email check on registration
- Login with email + password; bcrypt compare verifies the password
- JWT is signed with `userId`, `email`, `role`, and `name` (expires in 1h) and returned to the client
- Client stores the JWT in `localStorage` under `user_token`
- Token check route decodes the JWT and returns user identity to the client UI

### Role Model (4-level hierarchy)
- **student**: sees only themselves; cannot edit roles or delete users
- **teacher**: sees all students; cannot edit roles or delete users
- **admin**: sees teachers + students; may promote/demote between teacher and student
- **super-admin**: sees every user; may assign student/teacher/admin; may delete any user (except themselves)

### Dashboard (Home Page)
- Greeting banner with user's name and current role
- Logout button (clears token and redirects to login)
- Users table with: first/last name, email, role, and action column
- Role-aware **Edit** button with selectable role options per current user's permissions
- Edit role modal with save/cancel
- Role-aware **Delete** button (super-admin only; self-delete blocked)
- Loading and error states with a reload option

### Guardrails
- Unauthenticated users are redirected to `/login`
- Role visibility rules are enforced server-side (cannot leak users beyond what your role allows)
- Role-change rules are enforced server-side (admin cannot create another admin, etc.)
- Deletion is restricted to super-admin and blocked for self-delete

## Environment Variables

Create a `.env` file in the `server/` folder:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SUPER_ADMIN=admin@example.com
NODE_ENV=development
```

## Installation

### 1. Install server dependencies

```bash
cd server
npm install
```

### 2. Install client dependencies

```bash
cd ../client
npm install
```

Or install both from the project root with the helper script:

```bash
npm run installDev
```

## Running Locally

### Terminal 1 — Start the backend

```bash
cd server
npm run dev
```

Backend runs on `PORT` from `.env` (default shown here):

```text
http://localhost:3000
```

### Terminal 2 — Start the frontend

```bash
cd client
npm run dev
```

The Vite dev server typically runs on:

```text
http://localhost:5173
```

The client uses `http://localhost:3000/api` as the API base in development mode and `/api` in production.

## Available Scripts

### Root scripts

```bash
npm run installDev   # install deps in both server and client
npm run build        # install deps in both folders + build client for production
npm start            # start server in production mode (serves built client)
```

### Server scripts

```bash
cd server
npm run dev     # start Express with nodemon
npm start       # start Express with node
```

### Client scripts

```bash
cd client
npm run dev       # start Vite dev server
npm run build     # production build to client/dist
npm run lint      # run ESLint
npm run preview   # preview production build locally
```

## API Routes

Base path: `/api`.

### Auth
- `POST /api/register`     — Create a new user; body: `{firstname, lastname, email, password}`. Auto-sets role based on `SUPER_ADMIN` env.
- `POST /api/login`        — Sign in and receive a JWT; body: `{email, password}`.
- `POST /api/check-user`   — Verify a stored JWT and return decoded user; body: `{token}`.

### Users
- `POST /api/users`        — List users scoped to the requester's role; body: `{role?, userId}`.
- `POST /api/user-edit`    — Update a user's role (permissions enforced); body: `{userId, userToUpdateId, newRole}`.
- `POST /api/user-delete`  — Delete a user (super-admin only, no self-delete); body: `{userId, userToDeleteId}`.

## Production Build

```bash
npm run build
npm start
```

When `NODE_ENV=production`, the Express server serves the compiled frontend from `client/dist` and falls back to the SPA `index.html` for unmatched routes.

## Notes

- Visibility + edit + delete rules are enforced in `server/controllers/user.controller.js`; do not rely only on client-side button state.
- The JWT is stored in `localStorage` (not httpOnly); keep that in mind for production threat models.
- `express-validator` is installed as a dependency but no validation middleware is yet attached to route handlers.
- The first super-admin is seeded automatically by registering with the email set in `SUPER_ADMIN`.
