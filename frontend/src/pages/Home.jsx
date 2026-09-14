import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '40px' }}>
      <h1>Empower Your Learning with QuizPulse</h1>
      <p style={{ color: 'var(--text-muted)', margin: '20px 0', fontSize: '1.2rem' }}>
        Interactive assessments, timed tests, instant score tracking, and detailed performance analytics.
      </p>
      <Link to="/quizzes" className="btn" style={{ fontSize: '1.1rem', padding: '12px 24px' }}>
        Explore Quizzes
      </Link>

      <div className="grid" style={{ marginTop: '50px' }}>
        <div className="card">
          <h2>Categorized Quizzes</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
            Choose from Science, Math, CS, and more.
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