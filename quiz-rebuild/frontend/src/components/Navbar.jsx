import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  // Guard against uninitialized context
  const user = auth?.user ?? null;
  const logout = auth?.logout ?? (() => {});

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">QuizPulse</Link>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/quizzes">Quizzes</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/feedback">Feedback</Link></li>
        {user ? (
          <>
            <li><Link to="/profile">Profile ({user.username})</Link></li>
            {user?.is_admin && <li><Link to="/admin" style={{ color: '#e94560', fontWeight: 600 }}>Admin Dashboard</Link></li>}
            <li><button onClick={handleLogout} className="btn btn-secondary">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register" className="btn">Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}