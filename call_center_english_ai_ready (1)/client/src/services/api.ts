import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication
export const authAPI = {
  signup: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
};

// Users
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: { firstName?: string; lastName?: string }) =>
    api.put('/users/profile', data),
  initializeProgress: () => api.post('/users/initialize-progress'),
};

// Progress
export const progressAPI = {
  getProgress: () => api.get('/progress'),
  getSkills: () => api.get('/progress/skills'),
  updateProgress: (data: any) => api.put('/progress', data),
  updateSkill: (data: { skillName: string; skillCategory: string; masteryScore: number }) =>
    api.post('/progress/skills', data),
};

// Lessons
export const lessonsAPI = {
  getLessons: (module?: number, week?: number) =>
    api.get('/lessons', { params: { module, week } }),
  getLesson: (lessonId: number) => api.get(`/lessons/${lessonId}`),
  getLessonProgress: (lessonId: number) => api.get(`/lessons/${lessonId}/progress`),
  completeLesson: (lessonId: number, data: { timeSpentSeconds?: number; score?: number }) =>
    api.post(`/lessons/${lessonId}/complete`, data),
};

// Quizzes
export const quizzesAPI = {
  getQuizzes: () => api.get('/quizzes'),
  submitQuiz: (quizId: string, data: any) => api.post(`/quizzes/${quizId}/submit`, data),
  getQuizStats: () => api.get('/quizzes/stats'),
};

// AI Features
export const aiAPI = {
  startSpeakingSession: (scenarioType: string) =>
    api.post('/ai/speaking-session', { scenarioType }),
  submitSpeakingResponse: (
    sessionId: number,
    data: {
      duration: number;
      fluencyScore: number;
      pronunciationScore: number;
      grammarScore: number;
      culturalNuanceScore: number;
      recordingUrl?: string;
      aiTranscript?: string;
      aiFeedback?: string;
    }
  ) => api.post(`/ai/speaking-session/${sessionId}/submit`, data),
  getScenarios: (difficulty?: string) =>
    api.get('/ai/scenarios', { params: { difficulty } }),
  recordScenarioAttempt: (scenarioId: number, data: any) =>
    api.post(`/ai/scenario/${scenarioId}/attempt`, data),
  askTutor: (question: string) => api.post('/ai/ask-tutor', { question }),
  getSpeakingSessions: () => api.get('/ai/speaking-sessions'),
};

// Assessments
export const assessmentsAPI = {
  getStatus: () => api.get('/assessments/status'),
  submitAssessment: (assessmentId: string, data: any) =>
    api.post(`/assessments/${assessmentId}/submit`, data),
  getCertification: () => api.get('/assessments/certification'),
  issueCertification: (certificationLevel: string) =>
    api.post('/assessments/certification/issue', { certificationLevel }),
};

export default api;
