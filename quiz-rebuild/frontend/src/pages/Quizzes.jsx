import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

export default function Quizzes() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories')
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load categories:', err);
        setError('Failed to load quiz categories. Please try again later.');
        setLoading(false);
      });
  }, []);

  const handleStart = (quizId) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/quiz/${quizId}`);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '40px' }}>
        <div className="loading-spinner">Loading available quizzes...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '20px' }}>Available Quiz Categories</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {categories.length === 0 && !error ? (
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No quizzes available at the moment. Please check back soon!</p>
        </div>
      ) : (
        categories.map(cat => (
          <section key={cat.id} style={{ marginTop: '30px' }}>
            <h2 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
              {cat.name}
            </h2>
            {cat.description && (
              <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>{cat.description}</p>
            )}
            <div className="grid">
              {cat.quizzes && cat.quizzes.length > 0 ? (
                cat.quizzes.map(quiz => (
                  <div key={quiz.id} className="card">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{quiz.title}</h3>
                    <p style={{ margin: '8px 0 16px 0', color: 'var(--text-muted)' }}>
                      ⏱ Time Limit: {quiz.time_limit_minutes} {quiz.time_limit_minutes === 1 ? 'min' : 'mins'}
                    </p>
                    <button onClick={() => handleStart(quiz.id)} className="btn">
                      {user ? 'Start Quiz' : 'Login to Start'}
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No quizzes in this category yet.</p>
              )}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
