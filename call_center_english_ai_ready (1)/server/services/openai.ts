import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SpeakingFeedback {
  fluencyScore: number;
  pronunciationScore: number;
  grammarScore: number;
  culturalNuanceScore: number;
  overallScore: number;
  transcript: string;
  feedback: string;
  suggestions: string[];
}

export interface TutorResponse {
  answer: string;
  explanation: string;
  examples: string[];
  relatedTopics: string[];
}

/**
 * Analyze speaking session and provide comprehensive feedback
 */
export async function analyzeSpeakingSession(
  transcript: string,
  scenarioType: string,
  expectedResponses: string[]
): Promise<SpeakingFeedback> {
  try {
    const prompt = `You are an English language expert evaluating a call center agent's speaking performance.

Scenario: ${scenarioType}
Expected Response Examples: ${expectedResponses.join('; ')}
User's Actual Response: "${transcript}"

Please evaluate the user's response on the following criteria (0-100 scale):
1. Fluency: How naturally and smoothly they speak
2. Pronunciation: Clarity and correctness of pronunciation
3. Grammar: Correctness of grammar and sentence structure
4. Cultural Nuance: Appropriateness for the cultural context (American business English)

Provide your response in this exact JSON format:
{
  "fluencyScore": <number>,
  "pronunciationScore": <number>,
  "grammarScore": <number>,
  "culturalNuanceScore": <number>,
  "feedback": "<detailed feedback about their performance>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      fluencyScore: Math.min(100, Math.max(0, parsed.fluencyScore)),
      pronunciationScore: Math.min(100, Math.max(0, parsed.pronunciationScore)),
      grammarScore: Math.min(100, Math.max(0, parsed.grammarScore)),
      culturalNuanceScore: Math.min(100, Math.max(0, parsed.culturalNuanceScore)),
      overallScore:
        (parsed.fluencyScore +
          parsed.pronunciationScore +
          parsed.grammarScore +
          parsed.culturalNuanceScore) /
        4,
      transcript,
      feedback: parsed.feedback,
      suggestions: parsed.suggestions || [],
    };
  } catch (error) {
    console.error('Error analyzing speaking session:', error);
    throw error;
  }
}

/**
 * Generate intelligent tutor response to user questions
 */
export async function generateTutorResponse(question: string, context?: string): Promise<TutorResponse> {
  try {
    const systemPrompt = `You are an expert English language tutor specializing in business English and call center communication. 
Your role is to help Egyptian learners improve their English for call center work.
Provide clear, practical explanations with examples relevant to call center scenarios.
${context ? `Context: ${context}` : ''}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse structured response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          answer: parsed.answer || content,
          explanation: parsed.explanation || '',
          examples: parsed.examples || [],
          relatedTopics: parsed.relatedTopics || [],
        };
      } catch (e) {
        // If JSON parsing fails, return content as is
      }
    }

    return {
      answer: content,
      explanation: '',
      examples: [],
      relatedTopics: [],
    };
  } catch (error) {
    console.error('Error generating tutor response:', error);
    throw error;
  }
}

/**
 * Generate adaptive quiz questions based on skill level
 */
export async function generateQuizQuestions(
  category: string,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  count: number = 5
): Promise<any[]> {
  try {
    const prompt = `Generate ${count} multiple choice quiz questions for English learners at ${difficulty} level.
Category: ${category}
Context: Call center communication and business English

For each question, provide:
- question: The quiz question
- options: Array of 4 answer options
- correctAnswer: Index of correct answer (0-3)
- explanation: Why this is correct

Format as JSON array of objects.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON array from response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw error;
  }
}

/**
 * Evaluate user's response to a scenario
 */
export async function evaluateScenarioResponse(
  userResponse: string,
  scenarioDescription: string,
  customerPersona: any,
  expectedResponses: string[]
): Promise<{
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}> {
  try {
    const prompt = `You are evaluating a call center agent's response to a customer scenario.

Scenario: ${scenarioDescription}
Customer Profile: ${JSON.stringify(customerPersona)}
Expected Response Examples: ${expectedResponses.join('; ')}
User's Response: "${userResponse}"

Evaluate the response and provide:
1. A score from 0-100
2. Specific feedback
3. What they did well (strengths)
4. What could be improved

Respond in this JSON format:
{
  "score": <number>,
  "feedback": "<overall feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      score: Math.min(100, Math.max(0, parsed.score)),
      feedback: parsed.feedback,
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
    };
  } catch (error) {
    console.error('Error evaluating scenario response:', error);
    throw error;
  }
}

/**
 * Generate personalized learning recommendations
 */
export async function generateLearningRecommendations(
  userProgress: any,
  weakSkills: string[]
): Promise<{
  recommendations: string[];
  focusAreas: string[];
  estimatedTimeToB2: number;
}> {
  try {
    const prompt = `Based on a learner's progress in an English course for call center agents:

Current Progress:
- Module: ${userProgress.currentModule}/3
- Week: ${userProgress.currentWeek}/4
- Mastery Score: ${userProgress.overallMasteryScore}%
- Hours Completed: ${userProgress.totalHoursCompleted}

Weak Skills: ${weakSkills.join(', ')}

Provide personalized recommendations:
1. Specific areas to focus on
2. Recommended practice activities
3. Estimated weeks to reach B2 level

Respond in JSON format:
{
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"],
  "focusAreas": ["<area 1>", "<area 2>"],
  "estimatedTimeToB2": <number of weeks>
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
}

export default openai;
