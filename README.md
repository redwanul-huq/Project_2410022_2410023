# QuizPulse - Online Quiz Platform

QuizPulse is a full-stack, modern online assessment platform built with **FastAPI** (Python 3.12) and **React 18** (Vite). It features timed assessments, instant scoring, user authentication via JWT, performance analytics dashboards, and community feedback.

---

## 🚀 Tech Stack

- **Backend**:
  - FastAPI (Python)
  - SQLAlchemy 2.0 (ORM)
  - SQLite (Default database)
  - Pydantic v2 (Validation & Schemas)
  - Passlib + Bcrypt (Password Hashing)
  - Python-Jose (JWT Authentication)
  - Uvicorn (ASGI Web Server)

- **Frontend**:
  - React 18
  - React Router DOM v6
  - Vite
  - Axios (with centralized interceptors & 401 token invalidation)
  - WAI-ARIA Accessible UI & Responsive CSS

---

## 📁 Project Structure

```text
online-quiz-platform/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── auth.py         # Password hashing, JWT token generation & validation
│   │   ├── database.py     # SQLAlchemy engine, session factory, Base
│   │   ├── main.py         # FastAPI routes, health check & middleware
│   │   ├── models.py       # ORM models (User, Category, Quiz, Question, Option, QuizResult, Feedback)
│   │   ├── schemas.py      # Pydantic request/response validation schemas
│   │   └── seed.py         # Database seeding script
│   ├── requirements.txt    # Python dependencies
│   └── quizapp.db          # SQLite database
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/            # Centralized Axios instance & request interceptor
│   │   ├── components/     # Reusable components (Navbar)
│   │   ├── context/        # Global AuthContext & state management
│   │   ├── pages/          # Home, Quizzes, QuizTake, Profile, About, Feedback, Login, Register, NotFound
│   │   ├── utils/          # Custom auth event dispatchers
│   │   ├── App.jsx         # Client-side routing with protected routes
│   │   ├── index.css       # Global styles & accessibility classes
│   │   └── main.jsx        # React root mount point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js      # Vite configuration & backend proxy (/api -> localhost:8000)
└── README.md
```

---

## 🛠️ Getting Started

### 1. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Activate the Python virtual environment:
   ```bash
   source venv/bin/activate
   ```

3. Install required packages (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```

4. Seed the database with sample categories, quizzes, and questions:
   ```bash
   python -m app.seed
   ```

5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *Interactive API documentation is available at:* `http://localhost:8000/docs`

---

### 2. Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if needed):
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be running at:* `http://localhost:3000`

4. To build the frontend for production:
   ```bash
   npm run build
   ```

---

## 🔐 Key Features & Capabilities

- **Categorized Quizzes**: Browse quizzes by categories like Computer Science, Mathematics, and General Science.
- **Timed Test Engine**: Real-time countdown timer with automated submission when time expires.
- **Instant Results & History**: Immediate percentage scoring and correct answer breakdown stored in user profile.
- **User Dashboard & Analytics**: Overall accuracy, total quizzes completed, active streak status, and detailed attempt history.
- **Community Feedback**: Leave reviews and 1-5 star ratings visible to all platform users.
- **Accessible & Responsive**: Fully semantic heading hierarchy (`h1` &rarr; `h2` &rarr; `h3`), ARIA attributes, and mobile-responsive layouts.
