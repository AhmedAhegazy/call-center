import React, { useEffect, useState } from 'react';
import { progressAPI } from '../services/api';

interface UserProgress {
  currentModule: number;
  currentWeek: number;
  overallMasteryScore: number;
  totalHoursCompleted: number;
  expectedCompletionDate: string;
  lessonsCompleted: number;
  quizzesCompleted: number;
  speakingSessionsCompleted: number;
}

interface SkillMastery {
  skillName: string;
  skillCategory: string;
  masteryScore: number;
  practiceCount: number;
  lastPracticedAt: string;
}

const ProgressPage: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [skills, setSkills] = useState<SkillMastery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, skillsRes] = await Promise.all([
          progressAPI.getProgress(),
          progressAPI.getSkills(),
        ]);
        setProgress(progressRes.data.progress);
        setSkills(skillsRes.data.skills || []);
      } catch (err) {
        setError('Failed to load progress data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSkillColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Grammar: '📝',
      Vocabulary: '📚',
      Listening: '👂',
      Speaking: '🎤',
      Cultural: '🌍',
    };
    return icons[category] || '📖';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Your Progress</h1>
        <p className="text-gray-600 mb-8">Track your learning journey and skill development</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {progress && (
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Overall Progress</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Current Module</p>
                  <p className="text-3xl font-bold text-blue-600">{progress.currentModule}/3</p>
                  <p className="text-xs text-gray-500 mt-2">Week {progress.currentWeek}/4</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Mastery Score</p>
                  <p className="text-3xl font-bold text-green-600">
                    {progress.overallMasteryScore.toFixed(1)}%
                  </p>
                  <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${progress.overallMasteryScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Hours Completed</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {progress.totalHoursCompleted.toFixed(1)}h
                  </p>
                  <p className="text-xs text-gray-500 mt-2">of ~150 hours</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Completion</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {Math.round((progress.totalHoursCompleted / 150) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-2">of course</p>
                </div>
              </div>

              {/* Learning Path */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Learning Path</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Module 1: Foundations</span>
                      <span className="text-sm text-gray-600">
                        {progress.currentModule > 1 ? '100%' : `${(progress.currentWeek / 4) * 100}%`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{
                          width: progress.currentModule > 1 ? '100%' : `${(progress.currentWeek / 4) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Module 2: Intermediate</span>
                      <span className="text-sm text-gray-600">
                        {progress.currentModule > 2
                          ? '100%'
                          : progress.currentModule === 2
                          ? `${(progress.currentWeek / 4) * 100}%`
                          : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{
                          width:
                            progress.currentModule > 2
                              ? '100%'
                              : progress.currentModule === 2
                              ? `${(progress.currentWeek / 4) * 100}%`
                              : '0%',
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Module 3: Advanced</span>
                      <span className="text-sm text-gray-600">
                        {progress.currentModule === 3 ? `${(progress.currentWeek / 4) * 100}%` : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-600 h-3 rounded-full transition-all"
                        style={{
                          width: progress.currentModule === 3 ? `${(progress.currentWeek / 4) * 100}%` : '0%',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">📚 Lessons</h3>
                  <span className="text-2xl font-bold text-green-600">
                    {progress.lessonsCompleted || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600">lessons completed</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">✏️ Quizzes</h3>
                  <span className="text-2xl font-bold text-blue-600">
                    {progress.quizzesCompleted || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600">quizzes taken</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">🎤 Speaking</h3>
                  <span className="text-2xl font-bold text-purple-600">
                    {progress.speakingSessionsCompleted || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600">practice sessions</p>
              </div>
            </div>

            {/* Skill Mastery */}
            {skills.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Skill Mastery</h2>
                
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getCategoryIcon(skill.skillCategory)}</span>
                          <div>
                            <p className="font-semibold text-gray-800">{skill.skillName}</p>
                            <p className="text-xs text-gray-500">{skill.skillCategory}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-800">
                            {skill.masteryScore.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500">{skill.practiceCount} practices</p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className={`h-3 rounded-full transition-all ${getSkillColor(skill.masteryScore)}`}
                          style={{ width: `${skill.masteryScore}%` }}
                        ></div>
                      </div>

                      <p className="text-xs text-gray-500">
                        Last practiced: {new Date(skill.lastPracticedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Timeline</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                    <div className="w-1 h-12 bg-gray-300"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Started Course</p>
                    <p className="text-sm text-gray-600">November 1, 2025</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    <div className="w-1 h-12 bg-gray-300"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Module 1 Complete</p>
                    <p className="text-sm text-gray-600">Expected: November 29, 2025</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                    <div className="w-1 h-12 bg-gray-300"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Module 2 Complete</p>
                    <p className="text-sm text-gray-600">Expected: December 27, 2025</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">B2 Certification</p>
                    <p className="text-sm text-gray-600">Expected: {progress.expectedCompletionDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
