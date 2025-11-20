import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navigation: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="text-xl font-bold">
            Call Center English AI
          </Link>
          <div className="hidden md:flex gap-6">
            <Link to="/dashboard" className="hover:text-blue-200">
              Dashboard
            </Link>
            <Link to="/lessons" className="hover:text-blue-200">
              Lessons
            </Link>
            <Link to="/speaking-practice" className="hover:text-blue-200">
              Speaking Practice
            </Link>
            <Link to="/quizzes" className="hover:text-blue-200">
              Quizzes
            </Link>
            <Link to="/progress" className="hover:text-blue-200">
              Progress
            </Link>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
