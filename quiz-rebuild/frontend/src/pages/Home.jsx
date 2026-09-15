import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '40px' }}>
      <h1>RUET ECE — QuizPulse</h1>
      <p style={{ color: 'var(--text-muted)', margin: '20px 0', fontSize: '1.2rem' }}>
        Interactive assessments for Electrical and Computer Engineering students. 4-Year Curriculum • Odd & Even Semesters • CT, Semester, Lab & Sessional, Practice Quizzes.
      </p>
      <Link to="/quiz-dashboard" className="btn" style={{ fontSize: '1.1rem', padding: '12px 24px' }}>
        Start Quiz Dashboard
      </Link>

      <div className="grid" style={{ marginTop: '50px' }}>
        <div className="card">
          <h2>4-Year Curriculum</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
            Courses from 1st Year to 4th Year, both Odd & Even Semesters.
          </p>
        </div>
        <div className="card">
          <h2>Timed Assessments</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
            Test your speed with custom countdown timers.
          </p>
        </div>
        <div className="card">
          <h2>Analytics Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
            Track your accuracy, score history, and active streak.
          </p>
        </div>
      </div>
    </div>
  );
}