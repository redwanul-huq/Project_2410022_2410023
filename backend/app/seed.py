from app.database import SessionLocal, engine
from app import models

models.Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    try:
        if db.query(models.Category).first():
            print("Database already seeded.")
            return

        # Mathematics
        math = models.Category(name="Mathematics", description="Assess basic math and logical skills.")
        quiz_math = models.Quiz(title="Basic Algebra", time_limit_minutes=2, category=math)

        q1 = models.Question(text="What is the value of x if 2x + 6 = 14?", quiz=quiz_math)
        models.Option(text="3", is_correct=False, question=q1)
        models.Option(text="4", is_correct=True, question=q1)
        models.Option(text="5", is_correct=False, question=q1)
        models.Option(text="6", is_correct=False, question=q1)

        q2 = models.Question(text="What is the square root of 81?", quiz=quiz_math)
        models.Option(text="7", is_correct=False, question=q2)
        models.Option(text="8", is_correct=False, question=q2)
        models.Option(text="9", is_correct=True, question=q2)
        models.Option(text="10", is_correct=False, question=q2)

        # Computer Science
        cs = models.Category(name="Computer Fundamentals", description="Test core programming concepts.")
        quiz_cs = models.Quiz(title="Python & Web Fundamentals", time_limit_minutes=3, category=cs)

        q3 = models.Question(text="Which HTTP status code represents 'Not Found'?", quiz=quiz_cs)
        models.Option(text="200", is_correct=False, question=q3)
        models.Option(text="403", is_correct=False, question=q3)
        models.Option(text="404", is_correct=True, question=q3)
        models.Option(text="500", is_correct=False, question=q3)

        q4 = models.Question(text="What data structure uses LIFO (Last In, First Out)?", quiz=quiz_cs)
        models.Option(text="Queue", is_correct=False, question=q4)
        models.Option(text="Stack", is_correct=True, question=q4)
        models.Option(text="Array", is_correct=False, question=q4)
        models.Option(text="Tree", is_correct=False, question=q4)

        # Science
        science = models.Category(name="General Science", description="Explore foundational concepts in Physics, Chemistry, and Biology.")
        quiz_sci = models.Quiz(title="General Science Essentials", time_limit_minutes=3, category=science)

        q5 = models.Question(text="What is the chemical symbol for Gold?", quiz=quiz_sci)
        models.Option(text="Au", is_correct=True, question=q5)
        models.Option(text="Ag", is_correct=False, question=q5)
        models.Option(text="Fe", is_correct=False, question=q5)
        models.Option(text="Pb", is_correct=False, question=q5)

        q6 = models.Question(text="Which planet in our solar system is known as the Red Planet?", quiz=quiz_sci)
        models.Option(text="Venus", is_correct=False, question=q6)
        models.Option(text="Mars", is_correct=True, question=q6)
        models.Option(text="Jupiter", is_correct=False, question=q6)
        models.Option(text="Saturn", is_correct=False, question=q6)

        db.add_all([math, cs, science])
        db.commit()
        print("Database successfully seeded with Categories and Quizzes!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
