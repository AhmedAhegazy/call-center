import express, { Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  textToSpeechBase64,
  generateScenarioNarration,
  generateFeedbackAudio,
  generateLessonIntroduction,
  generateQuizQuestionAudio,
  getAvailableVoices,
} from '../services/tts';
import { db } from '../db';
import { scenarios, lessons } from '../../db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

/**
 * Generate speech from text and return as base64
 * POST /api/tts/generate
 */
router.post('/generate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { text, voice = 'nova', speed = 1.0, model = 'tts-1' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.length > 4096) {
      return res.status(400).json({ error: 'Text exceeds maximum length of 4096 characters' });
    }

    // Generate speech
    const audioBase64 = await textToSpeechBase64(text, {
      voice: voice as any,
      speed: parseFloat(speed),
      model: model as any,
    });

    res.json({
      message: 'Speech generated successfully',
      audio: `data:audio/mpeg;base64,${audioBase64}`,
      text,
      voice,
      speed,
      model,
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({
      error: 'Failed to generate speech',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Generate scenario narration
 * GET /api/tts/scenario/:scenarioId
 */
router.get('/scenario/:scenarioId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { scenarioId } = req.params;
    const { voice = 'nova', speed = 0.9 } = req.query;

    // Get scenario details
    const scenario = await db.select().from(scenarios).where(eq(scenarios.id, parseInt(scenarioId)));

    if (scenario.length === 0) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    const scenarioData = scenario[0];

    // Generate narration
    const narration = await generateScenarioNarration(
      scenarioData.scenarioName,
      scenarioData.customerPersona,
      {
        voice: voice as any,
        speed: parseFloat(speed as string),
      }
    );

    // Read file and convert to base64
    const fs = require('fs');
    const audioBuffer = fs.readFileSync(narration.filePath);
    const audioBase64 = audioBuffer.toString('base64');

    // Cleanup file
    fs.unlinkSync(narration.filePath);

    res.json({
      message: 'Scenario narration generated',
      scenarioId,
      scenarioName: scenarioData.scenarioName,
      audio: `data:audio/mpeg;base64,${audioBase64}`,
      narrationText: narration.text,
      voice,
      speed,
    });
  } catch (error) {
    console.error('Error generating scenario narration:', error);
    res.status(500).json({
      error: 'Failed to generate scenario narration',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Generate lesson introduction
 * GET /api/tts/lesson/:lessonId
 */
router.get('/lesson/:lessonId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { voice = 'nova', speed = 0.9 } = req.query;

    // Get lesson details
    const lesson = await db.select().from(lessons).where(eq(lessons.id, parseInt(lessonId)));

    if (lesson.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const lessonData = lesson[0];

    // Generate introduction
    const introduction = await generateLessonIntroduction(
      lessonData.title,
      lessonData.description || '',
      {
        voice: voice as any,
        speed: parseFloat(speed as string),
      }
    );

    // Read file and convert to base64
    const fs = require('fs');
    const audioBuffer = fs.readFileSync(introduction.filePath);
    const audioBase64 = audioBuffer.toString('base64');

    // Cleanup file
    fs.unlinkSync(introduction.filePath);

    res.json({
      message: 'Lesson introduction generated',
      lessonId,
      lessonTitle: lessonData.title,
      audio: `data:audio/mpeg;base64,${audioBase64}`,
      introductionText: introduction.text,
      voice,
      speed,
    });
  } catch (error) {
    console.error('Error generating lesson introduction:', error);
    res.status(500).json({
      error: 'Failed to generate lesson introduction',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Generate feedback audio
 * POST /api/tts/feedback
 */
router.post('/feedback', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { feedback, voice = 'shimmer', speed = 0.95 } = req.body;

    if (!feedback) {
      return res.status(400).json({ error: 'Feedback text is required' });
    }

    if (feedback.length > 4096) {
      return res.status(400).json({ error: 'Feedback exceeds maximum length of 4096 characters' });
    }

    // Generate feedback audio
    const result = await generateFeedbackAudio(feedback, {
      voice: voice as any,
      speed: parseFloat(speed),
    });

    // Read file and convert to base64
    const fs = require('fs');
    const audioBuffer = fs.readFileSync(result.filePath);
    const audioBase64 = audioBuffer.toString('base64');

    // Cleanup file
    fs.unlinkSync(result.filePath);

    res.json({
      message: 'Feedback audio generated',
      audio: `data:audio/mpeg;base64,${audioBase64}`,
      feedback,
      voice,
      speed,
    });
  } catch (error) {
    console.error('Error generating feedback audio:', error);
    res.status(500).json({
      error: 'Failed to generate feedback audio',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Generate quiz question audio
 * POST /api/tts/quiz-question
 */
router.post('/quiz-question', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { question, voice = 'nova', speed = 0.85 } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question text is required' });
    }

    if (question.length > 4096) {
      return res.status(400).json({ error: 'Question exceeds maximum length of 4096 characters' });
    }

    // Generate question audio
    const result = await generateQuizQuestionAudio(question, {
      voice: voice as any,
      speed: parseFloat(speed),
    });

    // Read file and convert to base64
    const fs = require('fs');
    const audioBuffer = fs.readFileSync(result.filePath);
    const audioBase64 = audioBuffer.toString('base64');

    // Cleanup file
    fs.unlinkSync(result.filePath);

    res.json({
      message: 'Quiz question audio generated',
      audio: `data:audio/mpeg;base64,${audioBase64}`,
      question,
      voice,
      speed,
    });
  } catch (error) {
    console.error('Error generating quiz question audio:', error);
    res.status(500).json({
      error: 'Failed to generate quiz question audio',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get available voices
 * GET /api/tts/voices
 */
router.get('/voices', authMiddleware, (req: Request, res: Response) => {
  try {
    const voices = getAvailableVoices();
    res.json({
      message: 'Available voices',
      voices,
      models: ['tts-1', 'tts-1-hd'],
      speedRange: { min: 0.25, max: 4.0, default: 1.0 },
    });
  } catch (error) {
    console.error('Error getting voices:', error);
    res.status(500).json({ error: 'Failed to get voices' });
  }
});

/**
 * Health check for TTS service
 * GET /api/tts/health
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'Text-to-Speech Service',
    features: ['text-to-speech', 'scenario-narration', 'lesson-introduction', 'feedback-audio', 'quiz-audio'],
  });
});

export default router;
