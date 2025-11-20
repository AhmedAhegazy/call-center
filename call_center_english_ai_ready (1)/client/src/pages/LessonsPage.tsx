import React, { useEffect, useState } from 'react';
import { lessonsAPI, progressAPI } from '../services/api';

interface Lesson {
  id: number;
  module: number;
  week: number;
  day: number;
  lessonTitle: string;
  lessonContent: string;
  lessonType: string;
  duration: number;
}

const LessonsPage: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [currentModule, setCurrentModule] = useState(1);
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonsRes, progressRes] = await Promise.all([
          lessonsAPI.getLessons(currentModule, currentWeek),
          progressAPI.getProgress(),
        ]);
        setLessons(lessonsRes.data.lessons);
        setCurrentModule(progressRes.data.progress.currentModule);
        setCurrentWeek(progressRes.data.progress.currentWeek);
      } catch (err) {
        setError('Failed to load lessons');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentModule, currentWeek]);

  const handleCompleteLesson = async (lessonId: number) => {
    try {
      await lessonsAPI.completeLesson(lessonId, {
        timeSpentSeconds: 1800, // 30 minutes
        score: 85,
      });
      setCompletedLessons([...completedLessons, lessonId]);
      // Update skill mastery
      if (selectedLesson) {
        await progressAPI.updateSkill({
          skillName: selectedLesson.lessonTitle,
          skillCategory: selectedLesson.lessonType,
          masteryScore: 85,
        });
      }
    } catch (err) {
      setError('Failed to complete lesson');
      console.error(err);
    }
  };

  const getLessonIcon = (type: string) => {
    const icons: Record<string, string> = {
      Grammar: '📝',
      Vocabulary: '📚',
      Listening: '👂',
      Speaking: '🎤',
      Cultural: '🌍',
    };
    return icons[type] || '📖';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Lessons</h1>
        <p className="text-gray-600 mb-8">
          Module {currentModule}, Week {currentWeek} - Complete all lessons to progress
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lessons List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedLesson?.id === lesson.id ? 'ring-2 ring-blue-500' : ''
                  } ${completedLessons.includes(lesson.id) ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getLessonIcon(lesson.lessonType)}</span>
                        <h3 className="text-lg font-semibold text-gray-800">{lesson.lessonTitle}</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{lesson.lessonContent}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📅 Day {lesson.day}</span>
                        <span>⏱️ {lesson.duration} min</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {lesson.lessonType}
                        </span>
                      </div>
                    </div>
                    {completedLessons.includes(lesson.id) && (
                      <div className="text-green-600 text-2xl">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lesson Details */}
          <div className="lg:col-span-1">
            {selectedLesson ? (
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedLesson.lessonTitle}</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Type</label>
                    <p className="text-gray-800">{selectedLesson.lessonType}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Duration</label>
                    <p className="text-gray-800">{selectedLesson.duration} minutes</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Module</label>
                    <p className="text-gray-800">Module {selectedLesson.module}, Week {selectedLesson.week}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Content</label>
                    <p className="text-gray-800 text-sm">{selectedLesson.lessonContent}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Learning Objectives</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ Understand key concepts</li>
                    <li>✓ Practice with examples</li>
                    <li>✓ Apply in real scenarios</li>
                    <li>✓ Receive AI feedback</li>
                  </ul>
                </div>

                {!completedLessons.includes(selectedLesson.id) ? (
                  <button
                    onClick={() => handleCompleteLesson(selectedLesson.id)}
                    className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Complete Lesson
                  </button>
                ) : (
                  <div className="w-full mt-6 bg-green-100 text-green-800 py-2 rounded-lg text-center font-semibold">
                    ✓ Completed
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                <p>Select a lesson to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonsPage;
