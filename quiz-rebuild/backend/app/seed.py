from app.database import SessionLocal, engine
from app import models, auth

models.Base.metadata.create_all(bind=engine)

RUET_ECE_COURSES = {
    "1st Year": {
        "Odd Semester": [
            ("ECE 1101", "Circuits & Systems-I"),
            ("ECE 1102", "Circuits & Systems-I Sessional"),
            ("ECE 1103", "Computer Programming"),
            ("ECE 1104", "Computer Programming Sessional"),
            ("Math 1117", "Calculus & Ordinary Differential Equation"),
            ("Phy 1117", "Optics and Modern Physics"),
            ("Phy 1118", "Optics and Modern Physics Sessional"),
            ("Hum 1117", "Technical English"),
            ("Hum 1118", "Technical English Sessional"),
            ("ECE 1100", "Introduction to Computer System"),
        ],
        "Even Semester": [
            ("ECE 1201", "Circuits & Systems-II"),
            ("ECE 1202", "Circuits & Systems-II Sessional"),
            ("ECE 1203", "Object Oriented Programming"),
            ("ECE 1204", "Object Oriented Programming Sessional"),
            ("ECE 1205", "Analog Electronic Circuits-I"),
            ("ECE 1206", "Analog Electronic Circuits-I Sessional"),
            ("Math 1217", "Transform Methods, Statistics & Complex Variable"),
            ("Hum 1217", "Government, Sociology, Environment Protection & History of Independence"),
            ("ECE 1200", "Engineering Ethics"),
        ],
    },
    "2nd Year": {
        "Odd Semester": [
            ("ECE 2103", "Data Structure & Algorithms"),
            ("ECE 2104", "Data Structure & Algorithms Sessional"),
            ("ECE 2105", "Analog Electronic Circuits-II"),
            ("ECE 2106", "Analog Electronic Circuits-II Sessional"),
            ("ECE 2111", "Digital Techniques"),
            ("ECE 2112", "Digital Techniques Sessional"),
            ("Math 2117", "Vector Analysis & Linear Algebra"),
            ("Chem 2117", "Inorganic and Physical Chemistry"),
            ("Chem 2118", "Inorganic and Physical Chemistry Sessional"),
            ("ECE 2100", "Software Development Project-I"),
        ],
        "Even Semester": [
            ("ECE 2207", "Electrical Machine-I"),
            ("ECE 2208", "Electrical Machine-I Sessional"),
            ("ECE 2213", "Numerical Methods & Discrete Mathematics"),
            ("ECE 2214", "Numerical Methods & Discrete Mathematics Sessional"),
            ("ECE 2215", "Data Base Systems"),
            ("ECE 2216", "Data Base Systems Sessional"),
            ("Math 2217", "Co-ordinate Geometry & Partial Differential Equations"),
            ("Hum 2217", "Legal Issues, Industrial & Operational Management"),
            ("ECE 2200", "Electronic Shop Practice"),
        ],
    },
    "3rd Year": {
        "Odd Semester": [
            ("ECE 3107", "Electrical Machine-II"),
            ("ECE 3108", "Electrical Machine-II Sessional"),
            ("ECE 3111", "Microprocessor, Assembly Language & Interfacing"),
            ("ECE 3112", "Microprocessor, Assembly Language & Interfacing Sessional"),
            ("ECE 3117", "Software Engineering & Information System Design"),
            ("ECE 3118", "Software Engineering & Information System Design Sessional"),
            ("ECE 3119", "Computer Architecture and Design"),
            ("ECE 3121", "Electromagnetic Fields & Waves"),
            ("CE 3100", "Civil Engineering Drawing"),
            ("ECE 3100", "Software Development Project-II"),
        ],
        "Even Semester": [
            ("ECE 3205", "Industrial Electronics"),
            ("ECE 3206", "Industrial Electronics Sessional"),
            ("ECE 3207", "Communication Engineering"),
            ("ECE 3208", "Communication Engineering Sessional"),
            ("ECE 3221", "Operating System"),
            ("ECE 3222", "Operating System Sessional"),
            ("ME 3219", "Basic Mechanical Engineering"),
            ("ME 3220", "Basic Mechanical Engineering Sessional"),
            ("Hum 3217", "Economics & Accountancy"),
            ("ECE 3200", "Electrical Services Design"),
        ],
    },
    "4th Year": {
        "Odd Semester": [
            ("ECE 4109", "Power System"),
            ("MTE 4117", "Control Systems & Robotics"),
            ("MTE 4118", "Control Systems & Robotics Sessional"),
            ("ECE 4123", "Digital Signal Processing"),
            ("ECE 4124", "Digital Signal Processing Sessional"),
            ("ECE 4000", "Thesis/Project-I"),
            ("ECE 4100", "Industrial Training"),
            ("ECE 4122", "Seminar"),
        ],
        "Even Semester": [
            ("ECE 4209", "Power Station, Switchgear & Protection"),
            ("ECE 4211", "Computer Networks"),
            ("ECE 4212", "Computer Networks Sessional"),
            ("ECE 4223", "Digital Image Processing"),
            ("ECE 4224", "Digital Image Processing Sessional"),
            ("ECE 4000", "Thesis/Project-II"),
        ],
    },
}

QUIZ_TYPES = [
    "CT Quiz",
    "Semester Quiz",
    "Lab & Sessional Quiz",
    "Practice Quiz",
]

def seed_db():
    db = SessionLocal()
    try:
        # Create admin user
        admin_email = "admin@ece.ruet.ac.bd"
        admin_user = db.query(models.User).filter(models.User.email == admin_email).first()
        if not admin_user:
            admin_user = models.User(
                username="admin",
                email=admin_email,
                hashed_password=auth.get_password_hash("admin123"),
                is_admin=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"Admin created: {admin_email}")
        else:
            print(f"Admin already exists: {admin_email}")

        # Also promote the project owner's account if it exists
        owner = db.query(models.User).filter(
            models.User.email == "rhtamim300@gmail.com"
        ).first()
        if owner and not owner.is_admin:
            owner.is_admin = True
            db.commit()
            print(f"Promoted owner to admin: {owner.email}")

        # Seed all RUET ECE courses
        for year, semesters in RUET_ECE_COURSES.items():
            for semester, courses in semesters.items():
                for code, title in courses:
                    cat_name = f"{code} - {title}"
                    existing = db.query(models.Category).filter(
                        models.Category.name == cat_name
                    ).first()
                    if existing:
                        continue
                    new_cat = models.Category(
                        name=cat_name,
                        description=f"{code} - {title}",
                        year=year,
                        semester=semester,
                        course_code=code,
                        course_title=title
                    )
                    db.add(new_cat)
                    db.commit()
                    db.refresh(new_cat)

                    # Create 4 quizzes per course
                    for qt in QUIZ_TYPES:
                        quiz_title = f"{code} - {qt}"
                        existing_quiz = db.query(models.Quiz).filter(
                            models.Quiz.title == quiz_title
                        ).first()
                        if existing_quiz:
                            continue
                        new_quiz = models.Quiz(
                            title=quiz_title,
                            category_id=new_cat.id,
                            quiz_type=qt,
                            time_limit_minutes=10 if qt == "Lab & Sessional Quiz" else 5
                        )
                        db.add(new_quiz)
                        db.commit()
                        db.refresh(new_quiz)

        # Populate DSA Lab Quiz with questions
        dsa_category = db.query(models.Category).filter(
            models.Category.course_code == "ECE 2104"
        ).first()
        if dsa_category:
            dsa_quiz = db.query(models.Quiz).filter(
                models.Quiz.category_id == dsa_category.id,
                models.Quiz.quiz_type == "Lab & Sessional Quiz"
            ).first()
            if dsa_quiz:
                # Check if already seeded
                existing_q = db.query(models.Question).filter(
                    models.Question.quiz_id == dsa_quiz.id
                ).first()
                if not existing_q:
                    dsa_questions = [
                        ("Which traversal of a Binary Search Tree gives the elements in sorted order?",
                         ["Preorder", "Inorder", "Postorder", "Level order"], 1),
                        ("What is the maximum number of children a node can have in a binary tree?",
                         ["1", "2", "3", "Any number"], 1),
                        ("Which data structure is commonly used to implement Breadth-First Search (BFS)?",
                         ["Stack", "Queue", "Heap", "Linked List"], 1),
                        ("Which data structure is commonly used for Depth-First Search (DFS)?",
                         ["Queue", "Stack", "Heap", "Hash table"], 1),
                        ("What is the time complexity of searching an element in a Binary Search Tree (BST)?",
                         ["O(n)", "O(log n)", "O(n log n)", "O(n²)"], 1),
                        ("Which of the following is NOT a tree traversal method?",
                         ["Inorder", "Preorder", "Postorder", "BFS"], 3),
                        ("In a Binary Search Tree, which node has no left child?",
                         ["Root node", "Leaf node", "Internal node with smallest value", "None"], 2),
                        ("What is the height of a skewed binary tree with n nodes?",
                         ["n", "n - 1", "log n", "n / 2"], 1),
                        ("Which algorithm uses a graph traversal to find the shortest path in an unweighted graph?",
                         ["DFS", "BFS", "Dijkstra", "A*"], 1),
                        ("A graph with n vertices has maximum number of edges in an undirected graph is:",
                         ["n", "n(n-1)/2", "n²", "2n"], 1),
                    ]
                    for q_text, options, correct_idx in dsa_questions:
                        q = models.Question(text=q_text, quiz_id=dsa_quiz.id)
                        db.add(q)
                        db.commit()
                        db.refresh(q)
                        for idx, opt_text in enumerate(options):
                            opt = models.Option(
                                text=opt_text,
                                is_correct=(idx == correct_idx),
                                question_id=q.id
                            )
                            db.add(opt)
                        db.commit()
                    print("DSA Lab Quiz seeded with 10 questions")

        print("RUET ECE Curriculum seeded successfully!")
        print(f"Admin user: admin@ece.ruet.ac.bd / admin123")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
