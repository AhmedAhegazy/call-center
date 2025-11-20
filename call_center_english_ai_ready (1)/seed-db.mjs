import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './db/schema.js';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Seed lessons for Module 1, Week 1
    const lessonsData = [
      {
        module: 1,
        week: 1,
        day: 1,
        lessonTitle: 'Introduction to English Basics',
        lessonContent: 'Learn the fundamentals of English grammar and pronunciation.',
        lessonType: 'Grammar',
        duration: 60,
      },
      {
        module: 1,
        week: 1,
        day: 1,
        lessonTitle: 'Basic Vocabulary for Call Centers',
        lessonContent: 'Essential vocabulary used in call center environments.',
        lessonType: 'Vocabulary',
        duration: 45,
      },
      {
        module: 1,
        week: 1,
        day: 2,
        lessonTitle: 'Listening Comprehension - Part 1',
        lessonContent: 'Practice listening to native English speakers.',
        lessonType: 'Listening',
        duration: 50,
      },
      {
        module: 1,
        week: 1,
        day: 2,
        lessonTitle: 'Speaking Practice - Greetings',
        lessonContent: 'Learn professional greetings and introductions.',
        lessonType: 'Speaking',
        duration: 40,
      },
      {
        module: 1,
        week: 1,
        day: 3,
        lessonTitle: 'Cultural Communication - American English',
        lessonContent: 'Understand American communication styles and expectations.',
        lessonType: 'Cultural',
        duration: 55,
      },
    ];

    console.log('Inserting lessons...');
    for (const lesson of lessonsData) {
      await db.insert(schema.lessons).values(lesson);
    }

    // Seed scenarios
    const scenariosData = [
      {
        scenarioName: 'Basic Customer Greeting',
        scenarioDescription: 'Practice greeting a customer and taking their information.',
        difficulty: 'Beginner',
        customerPersona: JSON.stringify({
          name: 'John Smith',
          mood: 'neutral',
          accent: 'American',
          patience: 'high',
        }),
        expectedResponses: JSON.stringify([
          'Hello, thank you for calling. How can I help you today?',
          'Good morning, what can I assist you with?',
        ]),
        culturalContext: 'American customers expect friendly, professional greetings.',
      },
      {
        scenarioName: 'Handling a Simple Request',
        scenarioDescription: 'Help a customer with a straightforward request.',
        difficulty: 'Beginner',
        customerPersona: JSON.stringify({
          name: 'Sarah Johnson',
          mood: 'neutral',
          accent: 'American',
          patience: 'high',
        }),
        expectedResponses: JSON.stringify([
          'I can help you with that. Let me check the system.',
          'Of course, I\'ll be happy to assist you.',
        ]),
        culturalContext: 'Be helpful and proactive in offering solutions.',
      },
      {
        scenarioName: 'Dealing with a Frustrated Customer',
        scenarioDescription: 'Practice de-escalation techniques with an upset customer.',
        difficulty: 'Intermediate',
        customerPersona: JSON.stringify({
          name: 'Mike Brown',
          mood: 'frustrated',
          accent: 'American',
          patience: 'low',
        }),
        expectedResponses: JSON.stringify([
          'I understand your frustration. Let me help resolve this for you.',
          'I apologize for the inconvenience. What can I do to make this right?',
        ]),
        culturalContext: 'Empathy and active listening are crucial for upset customers.',
      },
      {
        scenarioName: 'Technical Troubleshooting',
        scenarioDescription: 'Guide a customer through a technical issue.',
        difficulty: 'Advanced',
        customerPersona: JSON.stringify({
          name: 'Emily Davis',
          mood: 'confused',
          accent: 'British',
          patience: 'medium',
        }),
        expectedResponses: JSON.stringify([
          'Let\'s troubleshoot this step by step. First, can you tell me what error you\'re seeing?',
          'I\'ll walk you through the solution. Please follow these steps...',
        ]),
        culturalContext: 'British customers may be more formal. Use clear, step-by-step instructions.',
      },
    ];

    console.log('Inserting scenarios...');
    for (const scenario of scenariosData) {
      await db.insert(schema.scenarios).values(scenario);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
