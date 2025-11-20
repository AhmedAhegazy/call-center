import express, { Request, Response } from 'express';
import { db } from '../db';
import { userProgress, skillMastery } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user progress
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const progress = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId!));

    if (progress.length === 0) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    res.json({
      message: 'User progress data retrieved',
      progress: progress[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get skill mastery
router.get('/skills', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const skills = await db
      .select()
      .from(skillMastery)
      .where(eq(skillMastery.userId, userId!));

    res.json({
      message: 'Skill mastery data retrieved',
      skills,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user progress
router.put('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { currentModule, currentWeek, overallMasteryScore, totalHoursCompleted } = req.body;

    const updatedProgress = await db
      .update(userProgress)
      .set({
        currentModule: currentModule || undefined,
        currentWeek: currentWeek || undefined,
        overallMasteryScore: overallMasteryScore || undefined,
        totalHoursCompleted: totalHoursCompleted || undefined,
        updatedAt: new Date(),
      })
      .where(eq(userProgress.userId, userId!))
      .returning();

    res.json({
      message: 'User progress updated',
      progress: updatedProgress[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update skill mastery
router.post('/skills', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { skillName, skillCategory, masteryScore } = req.body;

    // Check if skill already exists
    const existingSkill = await db
      .select()
      .from(skillMastery)
      .where(
        eq(skillMastery.userId, userId!) && eq(skillMastery.skillName, skillName)
      );

    let result;
    if (existingSkill.length > 0) {
      // Update existing skill
      result = await db
        .update(skillMastery)
        .set({
          masteryScore: masteryScore || undefined,
          practiceCount: (existingSkill[0].practiceCount || 0) + 1,
          lastPracticedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(skillMastery.id, existingSkill[0].id))
        .returning();
    } else {
      // Create new skill
      result = await db
        .insert(skillMastery)
        .values({
          userId: userId!,
          skillName,
          skillCategory,
          masteryScore: masteryScore || 0,
          practiceCount: 1,
          lastPracticedAt: new Date(),
        })
        .returning();
    }

    res.json({
      message: 'Skill mastery updated',
      skill: result[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
