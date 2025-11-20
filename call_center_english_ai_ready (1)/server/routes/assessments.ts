import express, { Request, Response } from 'express';
import { db } from '../db';
import { assessmentResults, certifications, userProgress } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get assessment status
router.get('/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Check user progress
    const progress = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId!));

    // Check if user has completed all modules
    const canTakeAssessment = progress.length > 0 && progress[0].currentModule === 3 && progress[0].currentWeek === 4;

    // Get completed assessments
    const completedAssessments = await db
      .select()
      .from(assessmentResults)
      .where(eq(assessmentResults.userId, userId!));

    res.json({
      message: 'Assessment status retrieved',
      canTakeAssessment,
      completedAssessments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit assessment result
router.post('/:assessmentId/submit', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { assessmentType, score, passingScore, feedback } = req.body;

    const passed = score >= passingScore;

    const result = await db
      .insert(assessmentResults)
      .values({
        userId: userId!,
        assessmentType,
        score,
        passingScore,
        passed,
        feedback,
        completedAt: new Date(),
      })
      .returning();

    res.json({
      message: 'Assessment submitted',
      result: result[0],
      passed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get certification
router.get('/certification', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const cert = await db
      .select()
      .from(certifications)
      .where(eq(certifications.userId, userId!));

    if (cert.length === 0) {
      return res.status(404).json({ error: 'No certification found' });
    }

    res.json({
      message: 'Certification retrieved',
      certification: cert[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Issue certification (admin endpoint)
router.post('/certification/issue', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { certificationLevel } = req.body;

    // Check if certification already exists
    const existingCert = await db
      .select()
      .from(certifications)
      .where(eq(certifications.userId, userId!));

    if (existingCert.length > 0) {
      return res.status(400).json({ error: 'Certification already issued' });
    }

    // Create certification
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2-year validity

    const cert = await db
      .insert(certifications)
      .values({
        userId: userId!,
        certificationLevel,
        expiryDate,
        certificateUrl: `/certificates/${userId}-${certificationLevel}.pdf`,
      })
      .returning();

    res.json({
      message: 'Certification issued',
      certification: cert[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
