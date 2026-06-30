# AuthKit — Auth Starter + Dashboard

A full authentication system built from scratch to understand how modern auth actually works — no Auth0, no Clerk, no Supabase Auth. Just JWT, bcrypt, PostgreSQL, and Express, wired up by hand.

## Features

- Register / Login with email + password
- Passwords hashed with bcrypt (12 rounds), never stored in plain text
- JWT-based authentication with 7-day expiry
- Protected dashboard route — inaccessible without a valid token
- Change password (requires current password verification)
- Delete account (requires password confirmation)
- Forgot password flow with email-based reset links (via Resend)
- One-time, expiring reset tokens (1 hour) stored server-side
- Regex validation on email, password strength, and name fields
- Live password strength indicator on registration

## Tech Stack

**Frontend:** React (Vite), React Router, Axios
**Backend:** Node.js, Express
**Database:** PostgreSQL
**Auth:** JWT (jsonwebtoken), bcrypt
**Email:** Resend

## Project Structure

```
auth-dashboard/
├── client/                 React frontend
│   └── src/
│       ├── api.js          Axios instance with auto token attachment
│       ├── components/
│       │   └── PrivateRoute.jsx
│       └── pages/
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── DashboardPage.jsx
│           ├── ForgotPasswordPage.jsx
│           └── ResetPasswordPage.jsx
│
└── server/                 Express backend
    ├── db/
    │   └── index.js        PostgreSQL connection pool
    ├── middleware/
    │   └── auth.js         JWT verification middleware
    ├── routes/
    │   └── auth.js         All auth routes
    ├── utils/
    │   └── email.js        Resend email sending
    └── index.js             Server entry point
```

## API Routes

| Method | Route | Protected | Description |
|--------|-------|-----------|-------------|
| POST | `/api/auth/register` | No | Create a new account |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| GET | `/api/auth/me` | Yes | Get current user's profile |
| PUT | `/api/auth/password` | Yes | Change password (requires current password) |
| DELETE | `/api/auth/account` | Yes | Delete account (requires password) |
| POST | `/api/auth/forgot-password` | No | Request a password reset link |
| POST | `/api/auth/reset-password` | No | Reset password using a valid token |

## Database Schema

```sql
CREATE TABLE users (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(100),
  email               VARCHAR(255) UNIQUE NOT NULL,
  password_hash       VARCHAR(255) NOT NULL,
  reset_token         VARCHAR(255),
  reset_token_expiry  TIMESTAMP,
  created_at          TIMESTAMP DEFAULT NOW()
);
```

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd auth-dashboard

cd server && npm install
cd ../client && npm install
```

### 2. Set up PostgreSQL

Create a database and run the schema above. See `Database Schema` section.

### 3. Set up environment variables

Create `server/.env`:

```
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/auth_db
JWT_SECRET=generate_with_crypto_randomBytes
RESEND_API_KEY=your_resend_api_key
CLIENT_URL=http://localhost:5173
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Get a free Resend API key at [resend.com](https://resend.com).

### 4. Run both servers

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Visit `http://localhost:5173`.

## What This Project Demonstrates

This was built to deeply understand the full authentication lifecycle rather than relying on a managed auth provider:

- **Password security** - bcrypt hashing with salt, why plain text and reversible encryption are both wrong choices
- **Stateless auth** - how JWT lets a server "remember" a user without storing sessions
- **Middleware pattern** - how Express intercepts and verifies requests before they reach route handlers
- **One-time tokens** - a separate, simpler mechanism from JWT used for password resets, stored server-side and destroyed after use
- **Client-server separation** - React and Express as two independent processes communicating over HTTP
- **SQL fundamentals** - parameterized queries, schema evolution via `ALTER TABLE`, and relational data modeling

## Known Limitations

- No rate limiting on auth endpoints (would add `express-rate-limit` in production)
- Reset tokens stored as plain text in DB (acceptable for short-lived, single-use tokens — see guide for reasoning)
- No refresh token mechanism — JWT expiry requires re-login after 7 days
- No email verification on signup

## Author

Built by Garvitha as part of a 7-project portfolio series leading up to placement preparation.
