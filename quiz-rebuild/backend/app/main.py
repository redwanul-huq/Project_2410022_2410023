from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, auth
from app.database import engine, get_db
from fastapi import Depends

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QuizPulse API",
    description="Backend API for the Online Quiz Platform",
    version="1.0.0"
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# --- Health Check ---
@app.get("/api/health", status_code=status.HTTP_200_OK)
def health_check():
    return {"status": "ok", "message": "QuizPulse API is running"}

# --- Auth Endpoints ---

@app.post("/api/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_username = db.query(models.User).filter(models.User.username == user.username).first()
    if db_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_pw = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # form_data.username is the email in our client auth form
    user = db.query(models.User).filter(
        (models.User.email == form_data.username) | (models.User.username == form_data.username)
    ).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=schemas.UserResponse)
def get_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- Category & Quiz Endpoints ---

@app.get("/api/categories", response_model=List[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@app.get("/api/quizzes/{quiz_id}", response_model=schemas.QuizDetailResponse)
def get_quiz_detail(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@app.post("/api/quizzes/{quiz_id}/submit", response_model=schemas.QuizResultResponse)
def submit_quiz(
    quiz_id: int,
    submission: schemas.QuizSubmission,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    total_questions = len(quiz.questions)

    # Map submitted answers uniquely by question_id
    answers_map = {}
    for ans in submission.answers:
        answers_map[ans.question_id] = ans.selected_option_id

    correct_count = 0
    for q_id, opt_id in answers_map.items():
        option = db.query(models.Option).filter(
            models.Option.id == opt_id,
            models.Option.question_id == q_id
        ).first()
        if option and option.is_correct:
            correct_count += 1

    score_pct = round((correct_count / total_questions) * 100, 2) if total_questions > 0 else 0.0

    result = models.QuizResult(
        user_id=current_user.id,
        quiz_id=quiz.id,
        score=score_pct,
        total_questions=total_questions,
        correct_answers=correct_count
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    return schemas.QuizResultResponse(
        id=result.id,
        score=result.score,
        total_questions=result.total_questions,
        correct_answers=result.correct_answers,
        completed_at=result.completed_at,
        quiz_title=quiz.title,
    )

@app.get("/api/users/me/results", response_model=List[schemas.QuizResultResponse])
def get_user_results(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    results = db.query(models.QuizResult).filter(
        models.QuizResult.user_id == current_user.id
    ).order_by(models.QuizResult.completed_at.desc()).all()

    return [
        schemas.QuizResultResponse(
            id=r.id,
            score=r.score,
            total_questions=r.total_questions,
            correct_answers=r.correct_answers,
            completed_at=r.completed_at,
            quiz_title=r.quiz.title if r.quiz else "Unknown Quiz",
        ) for r in results
    ]

# --- Feedback Endpoints ---

@app.post("/api/feedback", response_model=schemas.FeedbackResponse)
def create_feedback(
    feedback: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    new_fb = models.Feedback(
        user_id=current_user.id,
        rating=feedback.rating,
        comment=feedback.comment
    )
    db.add(new_fb)
    db.commit()
    db.refresh(new_fb)

    return schemas.FeedbackResponse(
        id=new_fb.id,
        rating=new_fb.rating,
        comment=new_fb.comment,
        created_at=new_fb.created_at,
        username=current_user.username,
    )

@app.get("/api/feedback", response_model=List[schemas.FeedbackResponse])
def get_feedbacks(db: Session = Depends(get_db)):
    feedbacks = db.query(models.Feedback).order_by(models.Feedback.created_at.desc()).all()
    return [
        schemas.FeedbackResponse(
            id=fb.id,
            rating=fb.rating,
            comment=fb.comment,
            created_at=fb.created_at,
            username=fb.user.username if fb.user else "Anonymous",
        ) for fb in feedbacks
    ]


# --- Admin Endpoints ---

@app.get("/api/admin/users", response_model=List[schemas.UserResponse], dependencies=[Depends(auth.get_current_admin_user)])
def admin_list_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.post("/api/admin/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(auth.get_current_admin_user)])
def admin_create_user(user: schemas.AdminUserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_username = db.query(models.User).filter(models.User.username == user.username).first()
    if db_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    hashed_pw = auth.get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw,
        is_admin=user.is_admin
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.delete("/api/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(auth.get_current_admin_user)])
def admin_delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()

@app.post("/api/admin/courses", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(auth.get_current_admin_user)])
def admin_create_course(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_cat = db.query(models.Category).filter(models.Category.name == category.name).first()
    if db_cat:
        raise HTTPException(status_code=400, detail="Category name already exists")
    new_cat = models.Category(
        name=category.name,
        description=category.description,
        year=category.year,
        semester=category.semester,
        course_code=category.course_code,
        course_title=category.course_title
    )
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

@app.get("/api/admin/courses", response_model=List[schemas.CategoryResponse], dependencies=[Depends(auth.get_current_admin_user)])
def admin_list_courses(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@app.post("/api/admin/quizzes", response_model=schemas.QuizDetailResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(auth.get_current_admin_user)])
def admin_create_quiz(quiz: schemas.QuizCreate, db: Session = Depends(get_db)):
    cat = db.query(models.Category).filter(models.Category.id == quiz.category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    new_quiz = models.Quiz(
        title=quiz.title,
        category_id=quiz.category_id,
        quiz_type=quiz.quiz_type,
        time_limit_minutes=quiz.time_limit_minutes
    )
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)
    return new_quiz

@app.delete("/api/admin/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(auth.get_current_admin_user)])
def admin_delete_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()

@app.post("/api/admin/questions", response_model=schemas.QuestionResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(auth.get_current_admin_user)])
def admin_create_question(question_data: schemas.AdminQuestionCreate, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == question_data.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    new_q = models.Question(text=question_data.text, quiz_id=question_data.quiz_id)
    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    # Add options (accept text/is_correct payload; id optional/ignored)
    for opt in question_data.options:
        new_opt = models.Option(
            text=opt.text if hasattr(opt, 'text') else opt.get('text'),
            is_correct=opt.is_correct if hasattr(opt, 'is_correct') else opt.get('is_correct'),
            question_id=new_q.id
        )
        db.add(new_opt)
    db.commit()
    db.refresh(new_q)
    return new_q
