import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranscriptionResult {
  text: string;
  language: string;
  duration: number;
  confidence?: number;
}

/**
 * Transcribe audio file using Whisper API
 * Supports: mp3, mp4, mpeg, mpga, m4a, wav, webm
 */
export async function transcribeAudio(audioFilePath: string): Promise<TranscriptionResult> {
  try {
    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    // Read the audio file
    const audioBuffer = fs.readFileSync(audioFilePath);
    const fileName = path.basename(audioFilePath);

    // Create a Blob-like object for the API
    const file = new File([audioBuffer], fileName, { type: 'audio/wav' });

    // Call Whisper API
    const transcript = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en', // English
      response_format: 'json',
      temperature: 0, // More accurate transcription
    });

    return {
      text: transcript.text,
      language: 'en',
      duration: 0, // Whisper doesn't return duration
      confidence: 0.95, // Whisper doesn't return confidence, using default
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

/**
 * Transcribe audio from buffer (for streaming)
 */
export async function transcribeAudioBuffer(
  audioBuffer: Buffer,
  fileName: string = 'audio.wav'
): Promise<TranscriptionResult> {
  try {
    // Create a Blob-like object for the API
    const file = new File([audioBuffer], fileName, { type: 'audio/wav' });

    // Call Whisper API
    const transcript = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
      response_format: 'json',
      temperature: 0,
    });

    return {
      text: transcript.text,
      language: 'en',
      duration: 0,
      confidence: 0.95,
    };
  } catch (error) {
    console.error('Error transcribing audio buffer:', error);
    throw error;
  }
}

/**
 * Transcribe audio with language detection
 */
export async function transcribeAudioWithLanguageDetection(
  audioFilePath: string
): Promise<TranscriptionResult> {
  try {
    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    // Read the audio file
    const audioBuffer = fs.readFileSync(audioFilePath);
    const fileName = path.basename(audioFilePath);

    // Create a Blob-like object for the API
    const file = new File([audioBuffer], fileName, { type: 'audio/wav' });

    // Call Whisper API without language parameter for auto-detection
    const transcript = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'json',
      temperature: 0,
    });

    return {
      text: transcript.text,
      language: 'en', // Whisper detects language but doesn't return it in JSON format
      duration: 0,
      confidence: 0.95,
    };
  } catch (error) {
    console.error('Error transcribing audio with language detection:', error);
    throw error;
  }
}

/**
 * Transcribe audio and get verbose JSON (includes timestamps)
 */
export async function transcribeAudioVerbose(
  audioFilePath: string
): Promise<any> {
  try {
    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    // Read the audio file
    const audioBuffer = fs.readFileSync(audioFilePath);
    const fileName = path.basename(audioFilePath);

    // Create a Blob-like object for the API
    const file = new File([audioBuffer], fileName, { type: 'audio/wav' });

    // Call Whisper API with verbose JSON format
    const transcript = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
      response_format: 'verbose_json',
      temperature: 0,
    });

    return transcript;
  } catch (error) {
    console.error('Error transcribing audio with verbose output:', error);
    throw error;
  }
}

/**
 * Validate audio file format
 */
export function validateAudioFile(filePath: string): boolean {
  const supportedFormats = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];
  const fileExtension = path.extname(filePath).toLowerCase();
  return supportedFormats.includes(fileExtension);
}

/**
 * Get file size in MB
 */
export function getFileSizeMB(filePath: string): number {
  const stats = fs.statSync(filePath);
  return stats.size / (1024 * 1024);
}

/**
 * Check if file size is within Whisper API limits (25MB)
 */
export function isFileSizeValid(filePath: string): boolean {
  const maxSizeMB = 25;
  return getFileSizeMB(filePath) <= maxSizeMB;
}

export default {
  transcribeAudio,
  transcribeAudioBuffer,
  transcribeAudioWithLanguageDetection,
  transcribeAudioVerbose,
  validateAudioFile,
  getFileSizeMB,
  isFileSizeValid,
};
