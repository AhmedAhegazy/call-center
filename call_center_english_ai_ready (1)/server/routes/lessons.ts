import express, { Request, Response } from 'express';
import { db } from '../db';
import { lessons, userLessonProgress } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get lessons for current module/week
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { module, week } = req.query;

    let query = db.select().from(lessons);

    if (module) {
      query = query.where(eq(lessons.module, parseInt(module as string)));
    }

    if (week) {
      query = query.where(eq(lessons.week, parseInt(week as string)));
    }

    const lessonsList = await query;

    res.json({
      message: 'Lessons retrieved',
      lessons: lessonsList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific lesson
router.get('/:lessonId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;

    const lesson = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, parseInt(lessonId)));

    if (lesson.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({
      message: 'Lesson retrieved',
      lesson: lesson[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's lesson progress
router.get('/:lessonId/progress', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { lessonId } = req.params;

    const progress = await db
      .select()
      .from(userLessonProgress)
      .where(
        and(
          eq(userLessonProgress.userId, userId!),
          eq(userLessonProgress.lessonId, parseInt(lessonId))
        )
      );

    if (progress.length === 0) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    res.json({
      message: 'Lesson progress retrieved',
      progress: progress[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark lesson as complete
router.post('/:lessonId/complete', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { lessonId } = req.params;
    const { timeSpentSeconds, score } = req.body;

    // Check if progress record exists
    const existingProgress = await db
      .select()
      .from(userLessonProgress)
      .where(
        and(
          eq(userLessonProgress.userId, userId!),
          eq(userLessonProgress.lessonId, parseInt(lessonId))
        )
      );

    let result;
    if (existingProgress.length > 0) {
      // Update existing progress
      result = await db
        .update(userLessonProgress)
        .set({
          completed: true,
          completedAt: new Date(),
          timeSpentSeconds: timeSpentSeconds || existingProgress[0].timeSpentSeconds,
          score: score || existingProgress[0].score,
        })
        .where(eq(userLessonProgress.id, existingProgress[0].id))
        .returning();
    } else {
      // Create new progress record
      result = await db
        .insert(userLessonProgress)
        .values({
          userId: userId!,
          lessonId: parseInt(lessonId),
          completed: true,
          completedAt: new Date(),
          timeSpentSeconds: timeSpentSeconds || 0,
          score: score || undefined,
        })
        .returning();
    }

    res.json({
      message: 'Lesson marked as complete',
      progress: result[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
