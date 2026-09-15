from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User Schemas
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_admin: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

# Option Schemas
class OptionResponse(BaseModel):
    id: int
    text: str
    is_correct: bool = False

    class Config:
        from_attributes = True

# Question Schemas
class QuestionResponse(BaseModel):
    id: int
    text: str
    options: List[OptionResponse]

    class Config:
        from_attributes = True

# Quiz Schemas
class QuizListResponse(BaseModel):
    id: int
    title: str
    time_limit_minutes: int
    category_id: int
    quiz_type: str = "Practice Quiz"

    class Config:
        from_attributes = True

class QuizDetailResponse(BaseModel):
    id: int
    title: str
    time_limit_minutes: int
    quiz_type: str = "Practice Quiz"
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True

# Category Schema
class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    year: Optional[str] = None
    semester: Optional[str] = None
    course_code: Optional[str] = None
    course_title: Optional[str] = None
    quizzes: List[QuizListResponse]

    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    year: Optional[str] = None
    semester: Optional[str] = None
    course_code: Optional[str] = None
    course_title: Optional[str] = None

# Quiz Submission Schema
class AnswerSubmit(BaseModel):
    question_id: int
    selected_option_id: int

class QuizSubmission(BaseModel):
    answers: List[AnswerSubmit]

class QuizResultResponse(BaseModel):
    id: int
    score: float
    total_questions: int
    correct_answers: int
    completed_at: datetime
    quiz_title: Optional[str] = None

    class Config:
        from_attributes = True

# Admin Schemas
class AdminUserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    is_admin: bool = False

class QuizCreate(BaseModel):
    title: str
    category_id: int
    quiz_type: str = "Practice Quiz"
    time_limit_minutes: int = 5

class QuestionCreate(BaseModel):
    text: str
    options: List[dict]  # each has text and is_correct

class AdminQuestionCreate(BaseModel):
    quiz_id: int
    text: str
    options: List[AdminOptionCreate]  # text + is_correct, no required id

class AdminOptionCreate(BaseModel):
    text: str
    is_correct: bool = False

# Feedback Schema
class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=1)

class FeedbackResponse(BaseModel):
    id: int
    rating: int
    comment: str
    created_at: datetime
    username: Optional[str] = None

    class Config:
        from_attributes = True
