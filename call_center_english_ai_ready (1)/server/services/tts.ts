import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
export type TTSModel = 'tts-1' | 'tts-1-hd';

export interface TTSOptions {
  model?: TTSModel;
  voice?: TTSVoice;
  speed?: number; // 0.25 to 4.0
}

// Create audio output directory if it doesn't exist
const audioDir = path.join(process.cwd(), 'audio_output');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

/**
 * Convert text to speech and save as audio file
 */
export async function textToSpeechFile(
  text: string,
  options: TTSOptions = {}
): Promise<{ filePath: string; fileName: string }> {
  try {
    const { model = 'tts-1', voice = 'nova', speed = 1.0 } = options;

    // Validate input
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    if (text.length > 4096) {
      throw new Error('Text exceeds maximum length of 4096 characters');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `tts_${timestamp}.mp3`;
    const filePath = path.join(audioDir, fileName);

    // Call OpenAI TTS API
    const mp3 = await openai.audio.speech.create({
      model,
      voice,
      input: text,
      speed,
    });

    // Convert response to buffer and save
    const buffer = Buffer.from(await mp3.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    return { filePath, fileName };
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

/**
 * Convert text to speech and return as buffer
 */
export async function textToSpeechBuffer(
  text: string,
  options: TTSOptions = {}
): Promise<Buffer> {
  try {
    const { model = 'tts-1', voice = 'nova', speed = 1.0 } = options;

    // Validate input
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    if (text.length > 4096) {
      throw new Error('Text exceeds maximum length of 4096 characters');
    }

    // Call OpenAI TTS API
    const mp3 = await openai.audio.speech.create({
      model,
      voice,
      input: text,
      speed,
    });

    // Convert response to buffer
    return Buffer.from(await mp3.arrayBuffer());
  } catch (error) {
    console.error('Error generating speech buffer:', error);
    throw error;
  }
}

/**
 * Convert text to speech and return as base64 encoded string
 */
export async function textToSpeechBase64(
  text: string,
  options: TTSOptions = {}
): Promise<string> {
  try {
    const buffer = await textToSpeechBuffer(text, options);
    return buffer.toString('base64');
  } catch (error) {
    console.error('Error generating speech base64:', error);
    throw error;
  }
}

/**
 * Get available voices with descriptions
 */
export function getAvailableVoices(): Record<TTSVoice, string> {
  return {
    alloy: 'Neutral, balanced voice - good for professional content',
    echo: 'Deep, warm voice - suitable for narration',
    fable: 'Friendly, engaging voice - good for interactive content',
    onyx: 'Deep, authoritative voice - suitable for important announcements',
    nova: 'Clear, natural voice - recommended for general use',
    shimmer: 'Bright, energetic voice - good for upbeat content',
  };
}

/**
 * Generate scenario narration (customer greeting)
 */
export async function generateScenarioNarration(
  scenarioName: string,
  customerPersona: any,
  options: TTSOptions = {}
): Promise<{ filePath: string; fileName: string; text: string }> {
  try {
    // Create narration text
    const narrationText = `
      Welcome to the ${scenarioName} scenario.
      You will be speaking with ${customerPersona.name}, 
      a customer with a ${customerPersona.mood} mood and ${customerPersona.accent} accent.
      Please respond professionally and empathetically.
      You may begin when ready.
    `.trim();

    const result = await textToSpeechFile(narrationText, {
      ...options,
      voice: options.voice || 'nova',
      speed: options.speed || 0.9,
    });

    return {
      ...result,
      text: narrationText,
    };
  } catch (error) {
    console.error('Error generating scenario narration:', error);
    throw error;
  }
}

/**
 * Generate feedback audio
 */
export async function generateFeedbackAudio(
  feedback: string,
  options: TTSOptions = {}
): Promise<{ filePath: string; fileName: string }> {
  try {
    return await textToSpeechFile(feedback, {
      ...options,
      voice: options.voice || 'shimmer',
      speed: options.speed || 0.95,
    });
  } catch (error) {
    console.error('Error generating feedback audio:', error);
    throw error;
  }
}

/**
 * Generate lesson introduction audio
 */
export async function generateLessonIntroduction(
  lessonTitle: string,
  lessonDescription: string,
  options: TTSOptions = {}
): Promise<{ filePath: string; fileName: string; text: string }> {
  try {
    const introText = `
      Welcome to the lesson: ${lessonTitle}.
      ${lessonDescription}
      Let's begin learning.
    `.trim();

    const result = await textToSpeechFile(introText, {
      ...options,
      voice: options.voice || 'nova',
      speed: options.speed || 0.9,
    });

    return {
      ...result,
      text: introText,
    };
  } catch (error) {
    console.error('Error generating lesson introduction:', error);
    throw error;
  }
}

/**
 * Generate quiz question audio
 */
export async function generateQuizQuestionAudio(
  question: string,
  options: TTSOptions = {}
): Promise<{ filePath: string; fileName: string }> {
  try {
    return await textToSpeechFile(question, {
      ...options,
      voice: options.voice || 'nova',
      speed: options.speed || 0.85,
    });
  } catch (error) {
    console.error('Error generating quiz question audio:', error);
    throw error;
  }
}

/**
 * Cleanup audio file
 */
export function cleanupAudioFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting audio file:', error);
  }
}

/**
 * Get audio output directory
 */
export function getAudioDir(): string {
  return audioDir;
}

/**
 * Get file size in KB
 */
export function getFileSizeKB(filePath: string): number {
  const stats = fs.statSync(filePath);
  return stats.size / 1024;
}

export default {
  textToSpeechFile,
  textToSpeechBuffer,
  textToSpeechBase64,
  getAvailableVoices,
  generateScenarioNarration,
  generateFeedbackAudio,
  generateLessonIntroduction,
  generateQuizQuestionAudio,
  cleanupAudioFile,
  getAudioDir,
  getFileSizeKB,
};
