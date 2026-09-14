import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Feedback() {
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api.get('/feedback')
      .then(res => {
        setFeedbacks(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load feedback:', err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!user) {
      setErrorMessage('Please log in to submit your feedback.');
      return;
    }

    if (!comment.trim()) {
      setErrorMessage('Please enter a comment.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post('/feedback', { rating: Number(rating), comment });
      setFeedbacks([res.data, ...feedbacks]);
      setComment('');
      setRating(5);
      setSuccessMessage('Thank you for your feedback! Your review is now visible to the community.');
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      const detail = err.response?.data?.detail;
      setErrorMessage(
        (typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : null) ||
        'Failed to submit feedback. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (num) => {
    return '★'.repeat(num) + '☆'.repeat(5 - num);
  };

  return (
    <div className="container" style={{ maxWidth: '750px' }}>
      <div className="card">
        <h1 style={{ fontSize: '1.75rem', marginBottom: '15px' }}>Submit Feedback</h1>

        {successMessage && (
          <div className="alert alert-success" role="alert" style={{ marginBottom: '15px' }}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: '15px' }}>
            {errorMessage}
          </div>
        )}

        {!user ? (
          <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '6px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>
              You need to be logged in to share your feedback.
            </p>
            <Link to="/login" className="btn">
              Log In to Leave Feedback
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="feedback-rating">Rating (1 to 5 Stars)</label>
              <select
                id="feedback-rating"
                name="rating"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                disabled={isSubmitting}
              >
                <option value="5">★★★★★ (5 - Excellent)</option>
                <option value="4">★★★★☆ (4 - Good)</option>
                <option value="3">★★★☆☆ (3 - Average)</option>
                <option value="2">★★☆☆☆ (2 - Poor)</option>
                <option value="1">★☆☆☆☆ (1 - Terrible)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="feedback-comment">Your Feedback / Suggestion</label>
              <textarea
                id="feedback-comment"
                name="comment"
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                aria-required="true"
                placeholder="Let us know what you think of QuizPulse..."
                disabled={isSubmitting}
              ></textarea>
            </div>

            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>

      <h2 style={{ margin: '30px 0 15px 0', fontSize: '1.4rem' }}>Community Feedback</h2>

      {loading ? (
        <div className="loading-spinner" style={{ textAlign: 'center', margin: '20px 0' }}>
          Loading community feedback...
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No feedback submitted yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        feedbacks.map(fb => (
          <div key={fb.id} className="card" style={{ padding: '18px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong>{fb.username || 'Anonymous'}</strong>
              <span style={{ color: '#eab308', fontSize: '1.1rem', letterSpacing: '2px' }} title={`${fb.rating} out of 5 stars`}>
                {renderStars(fb.rating)}
              </span>
            </div>
            <p style={{ color: 'var(--text-main)', lineHeight: '1.5' }}>{fb.comment}</p>
            {fb.created_at && (
              <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {new Date(fb.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
