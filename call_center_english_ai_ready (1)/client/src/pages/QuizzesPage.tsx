import React, { useEffect, useState } from 'react';
import { quizzesAPI } from '../services/api';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

interface QuizResult {
  id: number;
  quizType: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
}

const QuizzesPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<QuizResult[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await quizzesAPI.getQuizzes();
        setQuizzes(res.data.quizzes);
      } catch (err) {
        setError('Failed to load quizzes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const startQuiz = (quizType: string) => {
    const mockQuestions: QuizQuestion[] = [
      {
        id: 1,
        question: 'What is the correct form of the present simple tense?',
        options: ['He go to school', 'He goes to school', 'He going to school', 'He gone to school'],
        correctAnswer: 1,
        category: 'Grammar',
      },
      {
        id: 2,
        question: 'Which word means the same as "customer"?',
        options: ['Client', 'Employee', 'Manager', 'Supervisor'],
        correctAnswer: 0,
        category: 'Vocabulary',
      },
      {
        id: 3,
        question: 'What is the most polite way to greet a customer?',
        options: [
          'Hey, what do you want?',
          'Good morning, how can I help you?',
          'What is it?',
          'Yeah, what\'s up?',
        ],
        correctAnswer: 1,
        category: 'Cultural',
      },
    ];

    setCurrentQuiz(mockQuestions);
    setAnswers({});
    setSubmitted(false);
    setCurrentQuestionIndex(0);
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleNextQuestion = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = async () => {
    if (!currentQuiz) return;

    let correctCount = 0;
    currentQuiz.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });

    try {
      await quizzesAPI.submitQuiz('grammar', {
        totalQuestions: currentQuiz.length,
        correctAnswers: correctCount,
        timeSpentSeconds: 600,
      });
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit quiz');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">✏️ Quizzes</h1>
        <p className="text-gray-600 mb-8">Test your knowledge with adaptive quizzes</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!currentQuiz ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Quizzes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => startQuiz('Grammar')}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg hover:shadow-lg transition text-left"
                >
                  <h3 className="text-xl font-bold mb-2">📝 Grammar Quiz</h3>
                  <p className="text-sm opacity-90">Test your grammar knowledge</p>
                </button>

                <button
                  onClick={() => startQuiz('Vocabulary')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:shadow-lg transition text-left"
                >
                  <h3 className="text-xl font-bold mb-2">📚 Vocabulary Quiz</h3>
                  <p className="text-sm opacity-90">Expand your vocabulary</p>
                </button>

                <button
                  onClick={() => startQuiz('Listening')}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg hover:shadow-lg transition text-left"
                >
                  <h3 className="text-xl font-bold mb-2">👂 Listening Quiz</h3>
                  <p className="text-sm opacity-90">Improve your listening skills</p>
                </button>

                <button
                  onClick={() => startQuiz('Cultural')}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg hover:shadow-lg transition text-left"
                >
                  <h3 className="text-xl font-bold mb-2">🌍 Cultural Quiz</h3>
                  <p className="text-sm opacity-90">Learn cultural communication</p>
                </button>
              </div>
            </div>
          </div>
        ) : submitted ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Completed!</h2>
            <p className="text-gray-600 mb-6">Great job! Your answers have been recorded.</p>
            <button
              onClick={() => setCurrentQuiz(null)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Back to Quizzes
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            {currentQuiz && (
              <div>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold text-gray-600">
                      Question {currentQuestionIndex + 1} of {currentQuiz.length}
                    </p>
                    <p className="text-sm font-semibold text-gray-600">
                      {Math.round(((currentQuestionIndex + 1) / currentQuiz.length) * 100)}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {currentQuiz[currentQuestionIndex].question}
                </h2>

                <div className="space-y-3 mb-8">
                  {currentQuiz[currentQuestionIndex].options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        answers[currentQuiz[currentQuestionIndex].id] === index
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={index}
                        checked={answers[currentQuiz[currentQuestionIndex].id] === index}
                        onChange={() =>
                          handleAnswerSelect(currentQuiz[currentQuestionIndex].id, index)
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-3 text-gray-800">{option}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>

                  {currentQuestionIndex === currentQuiz.length - 1 ? (
                    <button
                      onClick={submitQuiz}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      Next →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizzesPage;
