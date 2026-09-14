import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users/me/results')
      .then(res => {
        setResults(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load user results:', err);
        setError('Failed to load quiz performance history.');
        setLoading(false);
      });
  }, []);

  const totalQuizzes = results.length;
  const avgScore = totalQuizzes > 0
    ? (results.reduce((acc, curr) => acc + curr.score, 0) / totalQuizzes).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '40px' }}>
        <div className="loading-spinner">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '20px' }}>User Profile & Dashboard</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card" style={{ marginTop: '10px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Account Information</h2>
        <p style={{ margin: '6px 0' }}><strong>Username:</strong> {user?.username}</p>
        <p style={{ margin: '6px 0' }}><strong>Email:</strong> {user?.email}</p>
      </div>

      <h2 style={{ margin: '30px 0 15px 0', fontSize: '1.3rem' }}>Performance Metrics</h2>
      <div className="grid">
        <div className="stat-box">
          <div className="stat-value">{totalQuizzes}</div>
          <p>Quizzes Completed</p>
        </div>
        <div className="stat-box">
          <div className="stat-value">{avgScore}%</div>
          <p>Overall Accuracy</p>
        </div>
        <div className="stat-box">
          <div className="stat-value">{totalQuizzes > 0 ? '🔥 Active' : 'None'}</div>
          <p>Streak Status</p>
        </div>
      </div>

      <h2 style={{ margin: '35px 0 15px 0', fontSize: '1.3rem' }}>Recent Quiz Attempts</h2>
      <div className="card">
        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>
              No quiz attempts recorded yet.
            </p>
            <Link to="/quizzes" className="btn">
              Take Your First Quiz
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '10px 8px' }}>Quiz Title</th>
                  <th style={{ padding: '10px 8px' }}>Score</th>
                  <th style={{ padding: '10px 8px' }}>Correct Answers</th>
                  <th style={{ padding: '10px 8px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 8px' }}><strong>{r.quiz_title}</strong></td>
                    <td style={{ padding: '10px 8px', color: r.score >= 70 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                      {r.score}%
                    </td>
                    <td style={{ padding: '10px 8px' }}>{r.correct_answers} / {r.total_questions}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>
                      {new Date(r.completed_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
