import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthContext } from './context/AuthContext';

// Real Page Components
import Home from './pages/Home';
import Quizzes from './pages/Quizzes';
import QuizTake from './pages/QuizTake';
import Profile from './pages/Profile';
import About from './pages/About';
import Feedback from './pages/Feedback';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import QuizDashboard from './pages/QuizDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '60px' }}>
        <div className="loading-spinner">Loading session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public-Only Route Guard (Redirects away from Login/Register if already logged in)
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return children;
};

function App() {
  const { loading } = useContext(AuthContext);

  // Prevent UI flash while checking token in localStorage on first mount
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">Loading QuizPulse...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/about" element={<About />} />
          <Route path="/feedback" element={<Feedback />} />

          {/* Guest Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />

          {/* Quiz Dashboard */}
          <Route path="/quiz-dashboard" element={<QuizDashboard />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

          {/* Protected Routes */}
          <Route
            path="/quiz/:quizId"
            element={
              <ProtectedRoute>
                <QuizTake />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
