import { pgTable, text, serial, integer, timestamp, boolean, decimal, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Progress table
export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  currentModule: integer('current_module').default(1), // 1, 2, or 3
  currentWeek: integer('current_week').default(1), // 1-4 per module
  overallMasteryScore: decimal('overall_mastery_score', { precision: 5, scale: 2 }).default('0.00'),
  totalHoursCompleted: decimal('total_hours_completed', { precision: 8, scale: 2 }).default('0.00'),
  startDate: timestamp('start_date').defaultNow(),
  expectedCompletionDate: timestamp('expected_completion_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Skill Mastery table (tracks mastery of individual skills)
export const skillMastery = pgTable('skill_mastery', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  skillName: text('skill_name').notNull(), // e.g., "Past Perfect", "De-escalation", "Empathy Statements"
  skillCategory: text('skill_category').notNull(), // "Grammar", "CallCenter", "Cultural"
  masteryScore: decimal('mastery_score', { precision: 5, scale: 2 }).default('0.00'), // 0-100
  practiceCount: integer('practice_count').default(0),
  lastPracticedAt: timestamp('last_practiced_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Quiz Results table
export const quizResults = pgTable('quiz_results', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  quizType: text('quiz_type').notNull(), // "Grammar", "Vocabulary", "Listening", "Speaking", "Cultural"
  score: decimal('score', { precision: 5, scale: 2 }).notNull(), // 0-100
  totalQuestions: integer('total_questions').notNull(),
  correctAnswers: integer('correct_answers').notNull(),
  timeSpentSeconds: integer('time_spent_seconds'),
  completedAt: timestamp('completed_at').defaultNow(),
});

// Speaking Practice Sessions table
export const speakingSessions = pgTable('speaking_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  scenarioType: text('scenario_type').notNull(), // "BasicGreeting", "ComplaintHandling", "TechnicalSupport", etc.
  duration: integer('duration').notNull(), // in seconds
  fluencyScore: decimal('fluency_score', { precision: 5, scale: 2 }),
  pronunciationScore: decimal('pronunciation_score', { precision: 5, scale: 2 }),
  grammarScore: decimal('grammar_score', { precision: 5, scale: 2 }),
  culturalNuanceScore: decimal('cultural_nuance_score', { precision: 5, scale: 2 }),
  overallScore: decimal('overall_score', { precision: 5, scale: 2 }),
  recordingUrl: text('recording_url'), // URL to stored audio file
  aiTranscript: text('ai_transcript'), // AI-generated transcript
  aiFeedback: text('ai_feedback'), // Detailed feedback from AI
  completedAt: timestamp('completed_at').defaultNow(),
});

// Lessons table
export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  module: integer('module').notNull(), // 1, 2, or 3
  week: integer('week').notNull(), // 1-4
  day: integer('day').notNull(), // 1-5 (Mon-Fri)
  lessonTitle: text('lesson_title').notNull(),
  lessonContent: text('lesson_content').notNull(), // Markdown or HTML content
  lessonType: text('lesson_type').notNull(), // "Grammar", "Vocabulary", "Listening", "Speaking", "Cultural"
  duration: integer('duration').notNull(), // in minutes
  createdAt: timestamp('created_at').defaultNow(),
});

// User Lesson Progress table
export const userLessonProgress = pgTable('user_lesson_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  lessonId: integer('lesson_id').notNull().references(() => lessons.id),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at'),
  timeSpentSeconds: integer('time_spent_seconds').default(0),
  score: decimal('score', { precision: 5, scale: 2 }), // if applicable
});

// Scenarios table (for role-play practice)
export const scenarios = pgTable('scenarios', {
  id: serial('id').primaryKey(),
  scenarioName: text('scenario_name').notNull(),
  scenarioDescription: text('scenario_description'),
  difficulty: text('difficulty').notNull(), // "Beginner", "Intermediate", "Advanced"
  customerPersona: jsonb('customer_persona'), // JSON object with customer characteristics
  expectedResponses: jsonb('expected_responses'), // JSON array of acceptable responses
  culturalContext: text('cultural_context'), // Description of cultural nuances
  createdAt: timestamp('created_at').defaultNow(),
});

// User Scenario Practice table
export const userScenarioPractice = pgTable('user_scenario_practice', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  scenarioId: integer('scenario_id').notNull().references(() => scenarios.id),
  attemptNumber: integer('attempt_number').default(1),
  userResponse: text('user_response'),
  aiEvaluation: jsonb('ai_evaluation'), // JSON with scores and feedback
  completedAt: timestamp('completed_at').defaultNow(),
});

// Assessment Results table (for final B2 certification)
export const assessmentResults = pgTable('assessment_results', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  assessmentType: text('assessment_type').notNull(), // "Written", "Listening", "Speaking", "Cultural"
  score: decimal('score', { precision: 5, scale: 2 }).notNull(),
  passingScore: decimal('passing_score', { precision: 5, scale: 2 }).notNull(),
  passed: boolean('passed').notNull(),
  feedback: text('feedback'),
  completedAt: timestamp('completed_at').defaultNow(),
});

// Final Certification table
export const certifications = pgTable('certifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  certificationLevel: text('certification_level').notNull(), // "B2", "B1", etc.
  issuedDate: timestamp('issued_date').defaultNow(),
  expiryDate: timestamp('expiry_date'), // Optional expiry
  certificateUrl: text('certificate_url'), // URL to downloadable certificate
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  skillMastery: many(skillMastery),
  quizResults: many(quizResults),
  speakingSessions: many(speakingSessions),
  lessonProgress: many(userLessonProgress),
  scenarioPractice: many(userScenarioPractice),
  assessmentResults: many(assessmentResults),
  certifications: many(certifications),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));

export const skillMasteryRelations = relations(skillMastery, ({ one }) => ({
  user: one(users, {
    fields: [skillMastery.userId],
    references: [users.id],
  }),
}));

export const quizResultsRelations = relations(quizResults, ({ one }) => ({
  user: one(users, {
    fields: [quizResults.userId],
    references: [users.id],
  }),
}));

export const speakingSessionsRelations = relations(speakingSessions, ({ one }) => ({
  user: one(users, {
    fields: [speakingSessions.userId],
    references: [users.id],
  }),
}));

export const userLessonProgressRelations = relations(userLessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [userLessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userLessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const lessonsRelations = relations(lessons, ({ many }) => ({
  userProgress: many(userLessonProgress),
}));

export const scenariosRelations = relations(scenarios, ({ many }) => ({
  userPractice: many(userScenarioPractice),
}));

export const userScenarioPracticeRelations = relations(userScenarioPractice, ({ one }) => ({
  user: one(users, {
    fields: [userScenarioPractice.userId],
    references: [users.id],
  }),
  scenario: one(scenarios, {
    fields: [userScenarioPractice.scenarioId],
    references: [scenarios.id],
  }),
}));

export const assessmentResultsRelations = relations(assessmentResults, ({ one }) => ({
  user: one(users, {
    fields: [assessmentResults.userId],
    references: [users.id],
  }),
}));

export const certificationsRelations = relations(certifications, ({ one }) => ({
  user: one(users, {
    fields: [certifications.userId],
    references: [users.id],
  }),
}));
