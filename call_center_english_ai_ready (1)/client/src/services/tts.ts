import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ttsAPI = axios.create({
  baseURL: `${API_URL}/api/tts`,
});

// Add token to requests
ttsAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ttsService = {
  /**
   * Generate speech from text
   */
  generateSpeech: async (text: string, voice: string = 'nova', speed: number = 1.0) => {
    return ttsAPI.post('/generate', { text, voice, speed });
  },

  /**
   * Generate scenario narration
   */
  generateScenarioNarration: async (scenarioId: number, voice: string = 'nova', speed: number = 0.9) => {
    return ttsAPI.get(`/scenario/${scenarioId}`, { params: { voice, speed } });
  },

  /**
   * Generate lesson introduction
   */
  generateLessonIntroduction: async (lessonId: number, voice: string = 'nova', speed: number = 0.9) => {
    return ttsAPI.get(`/lesson/${lessonId}`, { params: { voice, speed } });
  },

  /**
   * Generate feedback audio
   */
  generateFeedbackAudio: async (feedback: string, voice: string = 'shimmer', speed: number = 0.95) => {
    return ttsAPI.post('/feedback', { feedback, voice, speed });
  },

  /**
   * Generate quiz question audio
   */
  generateQuizQuestionAudio: async (question: string, voice: string = 'nova', speed: number = 0.85) => {
    return ttsAPI.post('/quiz-question', { question, voice, speed });
  },

  /**
   * Get available voices
   */
  getAvailableVoices: async () => {
    return ttsAPI.get('/voices');
  },

  /**
   * Check TTS service health
   */
  getHealth: async () => {
    return ttsAPI.get('/health');
  },
};

export default ttsService;
