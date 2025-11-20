import express, { Request, Response } from 'express';
import { db } from '../db';
import { quizResults } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user's quiz results
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const results = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId!));

    res.json({
      message: 'Quiz results retrieved',
      quizzes: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit quiz answers
router.post('/:quizId/submit', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { quizType, totalQuestions, correctAnswers, timeSpentSeconds } = req.body;

    // Calculate score
    const score = (correctAnswers / totalQuestions) * 100;

    const result = await db
      .insert(quizResults)
      .values({
        userId: userId!,
        quizType,
        score,
        totalQuestions,
        correctAnswers,
        timeSpentSeconds,
        completedAt: new Date(),
      })
      .returning();

    res.json({
      message: 'Quiz submitted',
      result: result[0],
      score,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quiz statistics
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const results = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId!));

    // Calculate statistics
    const totalQuizzes = results.length;
    const averageScore = results.length > 0
      ? results.reduce((sum, r) => sum + parseFloat(r.score.toString()), 0) / results.length
      : 0;

    const quizzesByType: Record<string, number> = {};
    results.forEach((r) => {
      quizzesByType[r.quizType] = (quizzesByType[r.quizType] || 0) + 1;
    });

    res.json({
      message: 'Quiz statistics retrieved',
      stats: {
        totalQuizzes,
        averageScore: averageScore.toFixed(2),
        quizzesByType,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
