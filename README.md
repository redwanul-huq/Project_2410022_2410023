### Over View

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Project Overview

"QuizPulse" — an online quiz platform with a React frontend and a FastAPI/SQLAlchemy backend, communicating over JSON. The app lives in `quiz-rebuild/` (a renamed copy of the original `backend/` + `frontend/`).

## Tech Stack

- **Frontend** (`quiz-rebuild/frontend/`): React 18, Vite, React Router 6, axios. Dev server on port 3000.
- **Backend** (`quiz-rebuild/backend/`): FastAPI + SQLAlchemy + SQLite. Served via Uvicorn on port 8000. JWT auth (HS256, bcrypt password hashing, python-jose).
- **Database**: SQLite (`quizapp.db`), created from SQLAlchemy models at import time.

## Architecture

### Backend (`quiz-rebuild/backend/`)
- `app/main.py` — FastAPI app, CORS, and all routes. Auth: `/api/auth/register`, `/api/auth/login`. User: `/api/users/me`. Categories/quizzes: `/api/categories`, `/api/quizzes/{id}`, `/api/quizzes/{id}/submit`. Results: `/api/users/me/results`. Feedback: `/api/feedback`. Health: `/api/health`.
- `app/models.py` — SQLAlchemy models: `User`, `Category`, `Quiz`, `Question`, `Option`, `QuizResult`, `Feedback`.
- `app/schemas.py` — Pydantic request/response models.
- `app/auth.py` — `verify_password`, `get_password_hash`, `create_access_token`, `get_current_user` (JWT `sub` is the user's email).
- `app/database.py` — engine, session factory, `get_db` dependency. Reads `DATABASE_URL` from `.env` (defaults to `sqlite:///./quizapp.db`).
- `app/seed.py` — `seed_db()` populates 3 categories (Mathematics, Computer Fundamentals, General Science) with quizzes/questions/options. Run as `python -m app.seed`.

### Frontend (`quiz-rebuild/frontend/`)
- `src/App.jsx` — routing. Public: `/`, `/quizzes`, `/about`, `/feedback`. Guest-only: `/login`, `/register`. Protected (requires auth): `/quiz/:quizId`, `/profile`. `ProtectedRoute` and `PublicOnlyRoute` guards use `AuthContext`.
- `src/api/axiosInstance.js` — axios instance with `baseURL: '/api'`, attaches `Bearer` token from `localStorage`, and on 401 clears the token + triggers an unauthorized event.
- `src/context/AuthContext.jsx` — auth state (user, loading).
- `src/utils/authEvents.js` — unauthorized event bus used to log out the UI on 401.
- `vite.config.js` — proxies `/api` → `http://localhost:8000` during dev.

## Commands

**Backend** (run from `quiz-rebuild/backend/`):
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # dev server
python -m app.seed                          # seed the database (idempotent)
```
API docs available at `http://localhost:8000/docs`.

**Frontend** (run from `quiz-rebuild/frontend/`):
```bash
npm install
npm run dev     # vite dev server on :3000
npm run build   # production build
npm run preview
```

## Environment

Backend config comes from `quiz-rebuild/backend/.env`:
- `SECRET_KEY`, `ALGORITHM` (HS256), `ACCESS_TOKEN_EXPIRE_MINUTES` (60)
- `DATABASE_URL` = `sqlite:///./quizapp.db`

The committed `quizapp.db` is generated; it is gitignored (untracked) but present on disk. The `.env` contains a hardcoded secret — do not commit real secrets.

## Notes

- The root-level `backend/` and `frontend/` directories have been deleted (moved into `quiz-rebuild/`); git still has them staged for deletion until committed.
- `node_modules/`, `__pycache__/`, `.venv/`, `venv/`, `.DS_Store`, and `*.db` are not tracked in git. `node_modules` and `__pycache__` were previously committed — see `.gitignore` (currently only ignores `.DS_Store`).
