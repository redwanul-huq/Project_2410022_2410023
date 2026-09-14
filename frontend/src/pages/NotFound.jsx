import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '60px' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '10px' }}>404</h1>
        <h2>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '15px 0 25px 0', fontSize: '1.1rem' }}>
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
