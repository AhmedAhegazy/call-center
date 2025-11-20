import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './db/schema';
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
      {
        module: 1,
        week: 1,
        day: 3,
        lessonTitle: 'Present Simple Tense',
        lessonContent: 'Master the present simple tense for everyday conversations.',
        lessonType: 'Grammar',
        duration: 50,
      },
      {
        module: 1,
        week: 1,
        day: 4,
        lessonTitle: 'Customer Service Phrases',
        lessonContent: 'Learn essential phrases for customer service interactions.',
        lessonType: 'Vocabulary',
        duration: 45,
      },
      {
        module: 1,
        week: 1,
        day: 4,
        lessonTitle: 'Listening Comprehension - Part 2',
        lessonContent: 'Advanced listening practice with various accents.',
        lessonType: 'Listening',
        duration: 55,
      },
      {
        module: 1,
        week: 1,
        day: 5,
        lessonTitle: 'Weekly Review and Quiz',
        lessonContent: 'Review all lessons from the week and take a comprehensive quiz.',
        lessonType: 'Grammar',
        duration: 90,
      },
    ];

    console.log('Inserting lessons...');
    for (const lesson of lessonsData) {
      await db.insert(schema.lessons).values(lesson);
    }
    console.log(`✓ Inserted ${lessonsData.length} lessons`);

    // Seed scenarios
    const scenariosData = [
      {
        scenarioName: 'Basic Customer Greeting',
        scenarioDescription: 'Practice greeting a customer and taking their information.',
        difficulty: 'Beginner',
        customerPersona: {
          name: 'John Smith',
          mood: 'neutral',
          accent: 'American',
          patience: 'high',
        },
        expectedResponses: [
          'Hello, thank you for calling. How can I help you today?',
          'Good morning, what can I assist you with?',
          'Hi there, welcome. What brings you in today?',
        ],
        culturalContext: 'American customers expect friendly, professional greetings. Use a warm tone and be ready to help immediately.',
      },
      {
        scenarioName: 'Handling a Simple Request',
        scenarioDescription: 'Help a customer with a straightforward request.',
        difficulty: 'Beginner',
        customerPersona: {
          name: 'Sarah Johnson',
          mood: 'neutral',
          accent: 'American',
          patience: 'high',
        },
        expectedResponses: [
          'I can help you with that. Let me check the system.',
          'Of course, I\'ll be happy to assist you.',
          'Absolutely, I\'ll take care of that for you right away.',
        ],
        culturalContext: 'Be helpful and proactive in offering solutions. American customers appreciate efficiency and politeness.',
      },
      {
        scenarioName: 'Dealing with a Frustrated Customer',
        scenarioDescription: 'Practice de-escalation techniques with an upset customer.',
        difficulty: 'Intermediate',
        customerPersona: {
          name: 'Mike Brown',
          mood: 'frustrated',
          accent: 'American',
          patience: 'low',
        },
        expectedResponses: [
          'I understand your frustration. Let me help resolve this for you.',
          'I apologize for the inconvenience. What can I do to make this right?',
          'I hear you, and I want to make sure we fix this. Let\'s work through this together.',
        ],
        culturalContext: 'Empathy and active listening are crucial for upset customers. Acknowledge their feelings and take ownership of the problem.',
      },
      {
        scenarioName: 'Technical Troubleshooting',
        scenarioDescription: 'Guide a customer through a technical issue.',
        difficulty: 'Advanced',
        customerPersona: {
          name: 'Emily Davis',
          mood: 'confused',
          accent: 'British',
          patience: 'medium',
        },
        expectedResponses: [
          'Let\'s troubleshoot this step by step. First, can you tell me what error you\'re seeing?',
          'I\'ll walk you through the solution. Please follow these steps carefully.',
          'No problem, I\'ll help you get this sorted. Let\'s start with the basics.',
        ],
        culturalContext: 'British customers may be more formal and reserved. Use clear, step-by-step instructions and be patient.',
      },
      {
        scenarioName: 'Upselling a Product',
        scenarioDescription: 'Suggest additional products or services to a customer.',
        difficulty: 'Intermediate',
        customerPersona: {
          name: 'Robert Wilson',
          mood: 'neutral',
          accent: 'American',
          patience: 'medium',
        },
        expectedResponses: [
          'Based on your needs, I think you might also benefit from our premium package.',
          'Many of our customers in your situation find our additional service very helpful.',
          'Would you be interested in hearing about our upgraded plan?',
        ],
        culturalContext: 'American customers respond well to value propositions. Be honest and helpful, not pushy.',
      },
      {
        scenarioName: 'Handling a Complaint',
        scenarioDescription: 'Address a customer\'s complaint professionally.',
        difficulty: 'Intermediate',
        customerPersona: {
          name: 'Jennifer Lee',
          mood: 'angry',
          accent: 'American',
          patience: 'low',
        },
        expectedResponses: [
          'I sincerely apologize for the poor experience. Let me make this right for you.',
          'I understand why you\'re upset, and I take full responsibility. Here\'s what I\'ll do...',
          'Thank you for bringing this to my attention. We take complaints seriously.',
        ],
        culturalContext: 'Take complaints seriously and offer concrete solutions. American customers appreciate accountability and quick action.',
      },
      {
        scenarioName: 'Closing a Call Professionally',
        scenarioDescription: 'End a call with a customer in a professional manner.',
        difficulty: 'Beginner',
        customerPersona: {
          name: 'David Martinez',
          mood: 'satisfied',
          accent: 'American',
          patience: 'high',
        },
        expectedResponses: [
          'Thank you for calling. Is there anything else I can help you with today?',
          'I\'m glad I could help. Have a great day!',
          'Thank you for choosing us. We appreciate your business.',
        ],
        culturalContext: 'End on a positive note. Summarize what was done and offer future assistance.',
      },
      {
        scenarioName: 'Handling a Billing Issue',
        scenarioDescription: 'Address a customer\'s billing or payment concern.',
        difficulty: 'Advanced',
        customerPersona: {
          name: 'Lisa Anderson',
          mood: 'concerned',
          accent: 'American',
          patience: 'medium',
        },
        expectedResponses: [
          'I understand your concern about the billing. Let me review your account.',
          'I\'ll investigate this for you right away. Can you provide your account number?',
          'Thank you for bringing this to our attention. We\'ll make sure this is resolved.',
        ],
        culturalContext: 'Billing issues are sensitive. Be thorough, transparent, and offer solutions quickly.',
      },
    ];

    console.log('Inserting scenarios...');
    for (const scenario of scenariosData) {
      await db.insert(schema.scenarios).values({
        scenarioName: scenario.scenarioName,
        scenarioDescription: scenario.scenarioDescription,
        difficulty: scenario.difficulty,
        customerPersona: scenario.customerPersona,
        expectedResponses: scenario.expectedResponses,
        culturalContext: scenario.culturalContext,
      });
    }
    console.log(`✓ Inserted ${scenariosData.length} scenarios`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`\nSummary:`);
    console.log(`- Lessons: ${lessonsData.length}`);
    console.log(`- Scenarios: ${scenariosData.length}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
