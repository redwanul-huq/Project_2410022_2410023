import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="card">
        <h1>About QuizPulse</h1>
        <p style={{ marginTop: '15px', lineHeight: '1.7', fontSize: '1.05rem' }}>
          QuizPulse is an interactive online assessment platform designed to help learners, developers, and students test and refine their knowledge across a wide range of academic and technical subjects.
        </p>

        <h2 style={{ marginTop: '30px', fontSize: '1.4rem' }}>Platform Features</h2>
        <ul style={{ marginTop: '12px', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li><strong>Categorized Assessments:</strong> Explore quizzes in Computer Science, Mathematics, Science, and more.</li>
          <li><strong>Real-time Timed Tests:</strong> Sharpen your speed with automated countdown timers and automatic submission.</li>
          <li><strong>Instant Performance Metrics:</strong> Get immediate scoring feedback and track your overall accuracy and streak history.</li>
          <li><strong>Community Feedback:</strong> Share your insights and suggestions to help continuously improve the platform.</li>
        </ul>

        <h2 style={{ marginTop: '30px', fontSize: '1.4rem' }}>Developer Bio</h2>
        <p style={{ marginTop: '10px', lineHeight: '1.7', color: 'var(--text-muted)' }}>
          QuizPulse is built with modern, scalable web technologies including React 18, FastAPI, SQLAlchemy 2.0, and SQLite. It features secure JWT authentication, responsive UI design, and strict accessibility standards.
        </p>

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <Link to="/quizzes" className="btn">
            Explore Quizzes
          </Link>
        </div>
      </div>
    </div>
  );
}
