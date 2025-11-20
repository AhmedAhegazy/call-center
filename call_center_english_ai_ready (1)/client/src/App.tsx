import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import LessonsPage from './pages/LessonsPage';
import SpeakingPracticePage from './pages/SpeakingPracticePage';
import QuizzesPage from './pages/QuizzesPage';
import ProgressPage from './pages/ProgressPage';
import AssessmentPage from './pages/AssessmentPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      {isAuthenticated && <Navigation />}
      <Routes>
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<SignupPage setIsAuthenticated={setIsAuthenticated} />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lessons"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <LessonsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/speaking-practice"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <SpeakingPracticePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <QuizzesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AssessmentPage />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
};

export default App;
