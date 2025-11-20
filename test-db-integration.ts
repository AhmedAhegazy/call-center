import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './db/schema';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function testDatabaseIntegration() {
  try {
    console.log('🧪 Starting Database Integration Tests...\n');

    // Test 1: Create a test user
    console.log('Test 1: Creating a test user...');
    const { eq } = await import('drizzle-orm');
    const uniqueEmail = `testuser-${Date.now()}@example.com`;
    const hashedPassword = await bcryptjs.hash('testpassword123', 10);
    const newUser = await db
      .insert(schema.users)
      .values({
        email: uniqueEmail,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
      })
      .returning();
    console.log(`✓ User created with ID: ${newUser[0].id}\n`);

    // Test 2: Retrieve the user
    console.log('Test 2: Retrieving the user...');
    const users = await db
      .select()
      .from(schema.users)
      .where((t) => t.id === newUser[0].id);
    console.log(`✓ User retrieved: ${users[0].firstName} ${users[0].lastName}\n`);

    // Test 3: Initialize user progress
    console.log('Test 3: Initializing user progress...');
    const expectedCompletionDate = new Date();
    expectedCompletionDate.setDate(expectedCompletionDate.getDate() + 90);
    const progress = await db
      .insert(schema.userProgress)
      .values({
        userId: newUser[0].id,
        currentModule: 1,
        currentWeek: 1,
        overallMasteryScore: 0,
        totalHoursCompleted: 0,
        expectedCompletionDate,
      })
      .returning();
    console.log(`✓ Progress initialized for user\n`);

    // Test 4: Add skill mastery records
    console.log('Test 4: Adding skill mastery records...');
    const skills = ['Present Simple', 'Basic Vocabulary', 'Listening Comprehension'];
    for (const skill of skills) {
      await db
        .insert(schema.skillMastery)
        .values({
          userId: newUser[0].id,
          skillName: skill,
          skillCategory: 'Grammar',
          masteryScore: Math.random() * 100,
          practiceCount: Math.floor(Math.random() * 10) + 1,
        });
    }
    console.log(`✓ Added ${skills.length} skill mastery records\n`);

    // Test 5: Record a quiz result
    console.log('Test 5: Recording a quiz result...');
    const quizResult = await db
      .insert(schema.quizResults)
      .values({
        userId: newUser[0].id,
        quizType: 'Grammar',
        score: 85.5,
        totalQuestions: 20,
        correctAnswers: 17,
        timeSpentSeconds: 600,
      })
      .returning();
    console.log(`✓ Quiz result recorded with score: ${quizResult[0].score}\n`);

    // Test 6: Record a speaking session
    console.log('Test 6: Recording a speaking session...');
    const speakingSession = await db
      .insert(schema.speakingSessions)
      .values({
        userId: newUser[0].id,
        scenarioType: 'Basic Customer Greeting',
        duration: 300,
        fluencyScore: 78.5,
        pronunciationScore: 82.0,
        grammarScore: 75.5,
        culturalNuanceScore: 80.0,
        overallScore: 79.0,
        aiTranscript: 'Hello, thank you for calling. How can I help you today?',
        aiFeedback: 'Good pronunciation and fluency. Work on cultural nuance.',
      })
      .returning();
    console.log(`✓ Speaking session recorded with overall score: ${speakingSession[0].overallScore}\n`);

    // Test 7: Retrieve lessons
    console.log('Test 7: Retrieving lessons...');
    const lessons = await db
      .select()
      .from(schema.lessons)
      .where((t) => t.module === 1 && t.week === 1);
    console.log(`✓ Retrieved ${lessons.length} lessons for Module 1, Week 1\n`);

    // Test 8: Mark a lesson as complete
    console.log('Test 8: Marking a lesson as complete...');
    if (lessons.length > 0) {
      const lessonProgress = await db
        .insert(schema.userLessonProgress)
        .values({
          userId: newUser[0].id,
          lessonId: lessons[0].id,
          completed: true,
          timeSpentSeconds: 1800,
          score: 90,
        })
        .returning();
      console.log(`✓ Lesson marked as complete\n`);
    }

    // Test 9: Retrieve scenarios
    console.log('Test 9: Retrieving scenarios...');
    const scenarios = await db
      .select()
      .from(schema.scenarios)
      .where((t) => t.difficulty === 'Beginner');
    console.log(`✓ Retrieved ${scenarios.length} beginner scenarios\n`);

    // Test 10: Record scenario practice
    console.log('Test 10: Recording scenario practice...');
    if (scenarios.length > 0) {
      const scenarioPractice = await db
        .insert(schema.userScenarioPractice)
        .values({
          userId: newUser[0].id,
          scenarioId: scenarios[0].id,
          attemptNumber: 1,
          userResponse: 'Hello, thank you for calling. How can I help you?',
          aiEvaluation: {
            score: 85,
            feedback: 'Good greeting, but could be more personalized.',
          },
        })
        .returning();
      console.log(`✓ Scenario practice recorded\n`);
    }

    // Test 11: Record assessment result
    console.log('Test 11: Recording assessment result...');
    const assessmentResult = await db
      .insert(schema.assessmentResults)
      .values({
        userId: newUser[0].id,
        assessmentType: 'Speaking',
        score: 88.5,
        passingScore: 80,
        passed: true,
        feedback: 'Excellent performance. Ready for certification.',
      })
      .returning();
    console.log(`✓ Assessment result recorded: ${assessmentResult[0].passed ? 'PASSED' : 'FAILED'}\n`);

    // Test 12: Issue certification
    console.log('Test 12: Issuing certification...');
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);
    const certification = await db
      .insert(schema.certifications)
      .values({
        userId: newUser[0].id,
        certificationLevel: 'B2',
        expiryDate,
        certificateUrl: `/certificates/${newUser[0].id}-B2.pdf`,
      })
      .returning();
    console.log(`✓ Certification issued: ${certification[0].certificationLevel}\n`);

    // Test 13: Verify all user data
    console.log('Test 13: Verifying all user data...');
    const userData = {
      user: users[0],
      progress: progress[0],
      quizzes: await db
        .select()
        .from(schema.quizResults)
        .where((t) => t.userId === newUser[0].id),
      speakingSessions: await db
        .select()
        .from(schema.speakingSessions)
        .where((t) => t.userId === newUser[0].id),
      assessments: await db
        .select()
        .from(schema.assessmentResults)
        .where((t) => t.userId === newUser[0].id),
      certifications: await db
        .select()
        .from(schema.certifications)
        .where((t) => t.userId === newUser[0].id),
    };

    console.log('✓ User Data Summary:');
    console.log(`  - Email: ${userData.user.email}`);
    console.log(`  - Current Module: ${userData.progress.currentModule}`);
    console.log(`  - Quiz Results: ${userData.quizzes.length}`);
    console.log(`  - Speaking Sessions: ${userData.speakingSessions.length}`);
    console.log(`  - Assessments: ${userData.assessments.length}`);
    console.log(`  - Certifications: ${userData.certifications.length}\n`);

    console.log('✅ All database integration tests passed!\n');

    // Cleanup: Delete test user and related data
    console.log('Cleaning up test data...');
    // Delete in reverse order of foreign key dependencies
    await db
      .delete(schema.certifications)
      .where(eq(schema.certifications.userId, newUser[0].id));
    await db
      .delete(schema.assessmentResults)
      .where(eq(schema.assessmentResults.userId, newUser[0].id));
    await db
      .delete(schema.userScenarioPractice)
      .where(eq(schema.userScenarioPractice.userId, newUser[0].id));
    await db
      .delete(schema.speakingSessions)
      .where(eq(schema.speakingSessions.userId, newUser[0].id));
    await db
      .delete(schema.quizResults)
      .where(eq(schema.quizResults.userId, newUser[0].id));
    await db
      .delete(schema.userLessonProgress)
      .where(eq(schema.userLessonProgress.userId, newUser[0].id));
    await db
      .delete(schema.skillMastery)
      .where(eq(schema.skillMastery.userId, newUser[0].id));
    await db
      .delete(schema.userProgress)
      .where(eq(schema.userProgress.userId, newUser[0].id));
    await db
      .delete(schema.users)
      .where(eq(schema.users.id, newUser[0].id));
    console.log('✓ Test user and all related data deleted\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testDatabaseIntegration();
