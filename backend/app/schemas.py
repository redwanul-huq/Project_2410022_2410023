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
    created_at: datetime

    class Config:
        from_attributes = True

# Option Schemas
class OptionResponse(BaseModel):
    id: int
    text: str

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

    class Config:
        from_attributes = True

class QuizDetailResponse(BaseModel):
    id: int
    title: str
    time_limit_minutes: int
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True

# Category Schema
class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    quizzes: List[QuizListResponse]

    class Config:
        from_attributes = True

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
