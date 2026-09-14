import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function QuizTake() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const timerRef = useRef(null);
  const selectedAnswersRef = useRef(selectedAnswers);

  // Keep ref synchronized with state to prevent stale closures in timer callback
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  const submitQuiz = useCallback(async (answersToSubmit) => {
    if (isSubmitting) return;
    clearInterval(timerRef.current);
    setIsSubmitting(true);
    setError('');

    const currentAnswers = answersToSubmit || selectedAnswersRef.current;
    const answersPayload = Object.keys(currentAnswers).map(qId => ({
      question_id: parseInt(qId, 10),
      selected_option_id: currentAnswers[qId]
    }));

    try {
      const res = await api.post(`/quizzes/${quizId}/submit`, { answers: answersPayload });
      setResult(res.data);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : 'Failed to submit quiz results. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [quizId, isSubmitting]);

  useEffect(() => {
    let isMounted = true;
    api.get(`/quizzes/${quizId}`)
      .then(res => {
        if (isMounted) {
          setQuiz(res.data);
          setTimeLeft(res.data.time_limit_minutes * 60);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Failed to load quiz:', err);
          setError('Quiz not found or could not be loaded.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      clearInterval(timerRef.current);
    };
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null || result) return;

    if (timeLeft <= 0) {
      submitQuiz(selectedAnswersRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitQuiz(selectedAnswersRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, result, submitQuiz]);

  const handleSelectOption = (questionId, optionId) => {
    if (result || isSubmitting) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleManualSubmit = () => {
    submitQuiz(selectedAnswers);
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '40px' }}>
        <div className="loading-spinner">Loading quiz questions...</div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="container" style={{ maxWidth: '600px', marginTop: '40px' }}>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button className="btn" onClick={() => navigate('/quizzes')}>Back to Quizzes</button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '40px' }}>
        <h2>Quiz not found</h2>
        <button className="btn" onClick={() => navigate('/quizzes')} style={{ marginTop: '15px' }}>
          Back to Quizzes
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="container" style={{ maxWidth: '600px', marginTop: '40px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '30px 20px' }}>
          <h1>Quiz Completed!</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>{quiz.title}</p>

          <div style={{ margin: '24px 0' }}>
            <div className="score-display" style={{ color: 'var(--primary-color)', fontSize: '3rem', fontWeight: 'bold' }}>
              {result.score}%
            </div>
            <p style={{ marginTop: '10px', fontSize: '1.1rem' }}>
              You answered <strong>{result.correct_answers}</strong> out of <strong>{result.total_questions}</strong> questions correctly.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="btn" onClick={() => navigate('/profile')}>
              View Performance History
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/quizzes')}>
              Browse More Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="container" style={{ maxWidth: '600px', marginTop: '40px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h1>{quiz.title}</h1>
          <p style={{ margin: '20px 0', color: 'var(--text-muted)' }}>
            This quiz does not have any questions yet.
          </p>
          <button className="btn" onClick={() => navigate('/quizzes')}>Back to Quizzes</button>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];

  return (
    <div className="container" style={{ maxWidth: '750px', marginTop: '20px' }}>
      {error && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '15px' }}>
          {error}
        </div>
      )}

      <div className="card">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{quiz.title}</h1>
          <div className="timer" aria-live="polite" style={{ margin: 0 }}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </header>

        <p style={{ margin: '15px 0 10px 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Question {currentIndex + 1} of {quiz.questions.length}
        </p>

        <h2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>{currentQ.text}</h2>

        <div className="options-list" role="group" aria-label="Question options">
          {currentQ.options.map(opt => {
            const isSelected = selectedAnswers[currentQ.id] === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`option-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectOption(currentQ.id, opt.id)}
                aria-pressed={isSelected}
                disabled={isSubmitting}
              >
                {opt.text}
              </button>
            );
          })}
        </div>

        <footer style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={currentIndex === 0 || isSubmitting}
            onClick={() => setCurrentIndex(prev => prev - 1)}
          >
            Previous
          </button>

          {currentIndex === quiz.questions.length - 1 ? (
            <button
              type="button"
              className="btn"
              disabled={isSubmitting}
              onClick={handleManualSubmit}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              type="button"
              className="btn"
              disabled={isSubmitting}
              onClick={() => setCurrentIndex(prev => prev + 1)}
            >
              Next
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
