import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { progressAPI, usersAPI } from '../services/api';

interface UserProgress {
  currentModule: number;
  currentWeek: number;
  overallMasteryScore: number;
  totalHoursCompleted: number;
  expectedCompletionDate: string;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

const DashboardPage: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, userRes] = await Promise.all([
          progressAPI.getProgress(),
          usersAPI.getProfile(),
        ]);
        setProgress(progressRes.data.progress);
        setUser(userRes.data.user);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600">
            You're on track to complete your B2 English certification in 3 months
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Progress Overview */}
        {progress && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-semibold text-gray-600 mb-2">Current Module</div>
              <div className="text-3xl font-bold text-blue-600">{progress.currentModule}/3</div>
              <div className="text-xs text-gray-500 mt-2">Week {progress.currentWeek}/4</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-semibold text-gray-600 mb-2">Overall Mastery</div>
              <div className="text-3xl font-bold text-green-600">
                {progress.overallMasteryScore.toFixed(1)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress.overallMasteryScore}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-semibold text-gray-600 mb-2">Hours Completed</div>
              <div className="text-3xl font-bold text-purple-600">
                {progress.totalHoursCompleted.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 mt-2">of ~150 hours</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-semibold text-gray-600 mb-2">Time Remaining</div>
              <div className="text-3xl font-bold text-orange-600">
                {Math.ceil((150 - progress.totalHoursCompleted) / 5)} weeks
              </div>
              <div className="text-xs text-gray-500 mt-2">at 5 hrs/week</div>
            </div>
          </div>
        )}

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Lessons Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-green-500 to-green-600 h-2"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-green-600">📚 Lessons</h2>
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Daily
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                Continue with structured lessons covering grammar, vocabulary, listening, and cultural communication.
              </p>
              <Link
                to="/lessons"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Start Lessons →
              </Link>
            </div>
          </div>

          {/* Speaking Practice Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-purple-600">🎤 Speaking Practice</h2>
                <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                  AI-Powered
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                Practice real call center scenarios with AI feedback on pronunciation, fluency, and cultural nuance.
              </p>
              <Link
                to="/speaking-practice"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Practice Now →
              </Link>
            </div>
          </div>

          {/* Quizzes Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-orange-600">✏️ Quizzes</h2>
                <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Adaptive
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                Test your knowledge with adaptive quizzes that focus on your weak areas.
              </p>
              <Link
                to="/quizzes"
                className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition font-semibold"
              >
                Take Quiz →
              </Link>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-blue-600">📊 Progress</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Analytics
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                Track your progress, view skill mastery scores, and see detailed analytics.
              </p>
              <Link
                to="/progress"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                View Details →
              </Link>
            </div>
          </div>

          {/* Assessment Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-red-500 to-red-600 h-2"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-red-600">🎯 B2 Assessment</h2>
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Final
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                Take the comprehensive B2 certification exam when you're ready.
              </p>
              {progress && progress.currentModule === 3 && progress.currentWeek === 4 ? (
                <Link
                  to="/assessment"
                  className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Start Assessment →
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-block bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed font-semibold"
                >
                  Available Later
                </button>
              )}
            </div>
          </div>

          {/* AI Tutor Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-indigo-600">🤖 AI Tutor</h2>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                  24/7
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                Ask questions and get instant help from the AI tutor anytime, anywhere.
              </p>
              <button className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold">
                Ask a Question →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {progress && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Your Learning Path</h3>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">Module 1</div>
                <div className="text-sm text-gray-600">Foundations</div>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded">
                <div
                  className="h-1 bg-blue-600 rounded transition-all"
                  style={{
                    width: progress.currentModule > 1 ? '100%' : `${(progress.currentWeek / 4) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">Module 2</div>
                <div className="text-sm text-gray-600">Intermediate</div>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded">
                <div
                  className="h-1 bg-blue-600 rounded transition-all"
                  style={{
                    width: progress.currentModule > 2 ? '100%' : progress.currentModule === 2 ? `${(progress.currentWeek / 4) * 100}%` : '0%',
                  }}
                ></div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">Module 3</div>
                <div className="text-sm text-gray-600">Advanced</div>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded">
                <div
                  className="h-1 bg-blue-600 rounded transition-all"
                  style={{
                    width: progress.currentModule === 3 ? `${(progress.currentWeek / 4) * 100}%` : '0%',
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
