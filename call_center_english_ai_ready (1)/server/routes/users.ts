import express, { Request, Response } from 'express';
import { db } from '../db';
import { users, userProgress } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const user = await db.select().from(users).where(eq(users.id, userId!));

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user[0];

    res.json({
      message: 'User profile retrieved',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { firstName, lastName } = req.body;

    const updatedUser = await db
      .update(users)
      .set({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId!))
      .returning();

    const { password, ...userWithoutPassword } = updatedUser[0];

    res.json({
      message: 'User profile updated',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize user progress (called after signup)
router.post('/initialize-progress', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Check if progress already exists
    const existingProgress = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId!));

    if (existingProgress.length > 0) {
      return res.status(400).json({ error: 'Progress already initialized' });
    }

    // Create initial progress record
    const expectedCompletionDate = new Date();
    expectedCompletionDate.setDate(expectedCompletionDate.getDate() + 90); // 3 months

    const newProgress = await db
      .insert(userProgress)
      .values({
        userId: userId!,
        currentModule: 1,
        currentWeek: 1,
        overallMasteryScore: 0,
        totalHoursCompleted: 0,
        expectedCompletionDate,
      })
      .returning();

    res.status(201).json({
      message: 'User progress initialized',
      progress: newProgress[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
