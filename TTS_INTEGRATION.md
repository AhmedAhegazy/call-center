# Text-to-Speech (TTS) Integration Guide

## Overview

The Call Center English AI platform now integrates OpenAI's Text-to-Speech (TTS) API to provide natural-sounding audio narration, feedback, and interactive learning experiences.

## Features

### 1. Scenario Narration
- Automatic narration of scenario setup and instructions
- Natural voice with appropriate pacing
- Auto-play option for immersive experience

### 2. AI Feedback Audio
- Convert AI feedback text to natural speech
- Encouraging and supportive tone
- Adjustable speaking speed

### 3. Lesson Introductions
- Audio introduction for each lesson
- Clear pronunciation and pacing
- Engaging voice for learning

### 4. Quiz Question Audio
- Read quiz questions aloud
- Support for accessibility
- Clear enunciation for better understanding

### 5. Custom Speech Generation
- Convert any text to speech
- Multiple voice options
- Adjustable speed (0.25x to 4.0x)

## Architecture

### Backend Components

**1. TTS Service (`server/services/tts.ts`)**
```typescript
- textToSpeechFile(text, options) - Generate and save audio file
- textToSpeechBuffer(text, options) - Generate audio as buffer
- textToSpeechBase64(text, options) - Generate audio as base64
- generateScenarioNarration() - Create scenario narration
- generateFeedbackAudio() - Create feedback audio
- generateLessonIntroduction() - Create lesson intro
- generateQuizQuestionAudio() - Create quiz audio
- getAvailableVoices() - List available voices
```

**2. TTS Routes (`server/routes/tts.ts`)**
```
POST   /api/tts/generate              - Generate speech from text
GET    /api/tts/scenario/:scenarioId  - Get scenario narration
GET    /api/tts/lesson/:lessonId      - Get lesson introduction
POST   /api/tts/feedback              - Generate feedback audio
POST   /api/tts/quiz-question         - Generate quiz audio
GET    /api/tts/voices                - Get available voices
GET    /api/tts/health                - Service health check
```

**3. Frontend Service (`client/src/services/tts.ts`)**
- API client for all TTS endpoints
- Error handling and retry logic
- Token management

**4. Audio Player Component (`client/src/components/AudioPlayer.tsx`)**
- Reusable audio player with controls
- Progress tracking
- Play/pause functionality
- Time display

### Frontend Integration

**Updated Speaking Practice Page**
- Scenario narration plays when session starts
- Feedback audio plays after response evaluation
- Audio player component for all audio content

## Available Voices

| Voice | Description | Best For |
|-------|-------------|----------|
| **alloy** | Neutral, balanced | Professional content |
| **echo** | Deep, warm | Narration, stories |
| **fable** | Friendly, engaging | Interactive content |
| **onyx** | Deep, authoritative | Important announcements |
| **nova** | Clear, natural | General use (recommended) |
| **shimmer** | Bright, energetic | Upbeat content, feedback |

## API Endpoints

### 1. Generate Speech from Text

**Endpoint:** `POST /api/tts/generate`

**Request:**
```bash
curl -X POST http://localhost:5000/api/tts/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, welcome to the training platform",
    "voice": "nova",
    "speed": 1.0,
    "model": "tts-1"
  }'
```

**Request Body:**
- `text` (string, required) - Text to convert to speech (max 4096 chars)
- `voice` (string, optional) - Voice to use (default: "nova")
- `speed` (number, optional) - Speaking speed 0.25-4.0 (default: 1.0)
- `model` (string, optional) - Model to use: "tts-1" or "tts-1-hd" (default: "tts-1")

**Response:**
```json
{
  "message": "Speech generated successfully",
  "audio": "data:audio/mpeg;base64,//NExAAR...",
  "text": "Hello, welcome to the training platform",
  "voice": "nova",
  "speed": 1.0,
  "model": "tts-1"
}
```

### 2. Generate Scenario Narration

**Endpoint:** `GET /api/tts/scenario/:scenarioId`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/tts/scenario/1?voice=nova&speed=0.9" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Query Parameters:**
- `voice` (optional) - Voice to use (default: "nova")
- `speed` (optional) - Speaking speed (default: 0.9)

**Response:**
```json
{
  "message": "Scenario narration generated",
  "scenarioId": 1,
  "scenarioName": "Customer Complaint",
  "audio": "data:audio/mpeg;base64,//NExAAR...",
  "narrationText": "Welcome to the Customer Complaint scenario...",
  "voice": "nova",
  "speed": 0.9
}
```

### 3. Generate Lesson Introduction

**Endpoint:** `GET /api/tts/lesson/:lessonId`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/tts/lesson/1?voice=nova&speed=0.9" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Lesson introduction generated",
  "lessonId": 1,
  "lessonTitle": "Basic Greetings",
  "audio": "data:audio/mpeg;base64,//NExAAR...",
  "introductionText": "Welcome to the lesson: Basic Greetings...",
  "voice": "nova",
  "speed": 0.9
}
```

### 4. Generate Feedback Audio

**Endpoint:** `POST /api/tts/feedback`

**Request:**
```bash
curl -X POST http://localhost:5000/api/tts/feedback \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "feedback": "Great job! Your pronunciation was clear.",
    "voice": "shimmer",
    "speed": 0.95
  }'
```

**Response:**
```json
{
  "message": "Feedback audio generated",
  "audio": "data:audio/mpeg;base64,//NExAAR...",
  "feedback": "Great job! Your pronunciation was clear.",
  "voice": "shimmer",
  "speed": 0.95
}
```

### 5. Generate Quiz Question Audio

**Endpoint:** `POST /api/tts/quiz-question`

**Request:**
```bash
curl -X POST http://localhost:5000/api/tts/quiz-question \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the correct form of the present tense?",
    "voice": "nova",
    "speed": 0.85
  }'
```

**Response:**
```json
{
  "message": "Quiz question audio generated",
  "audio": "data:audio/mpeg;base64,//NExAAR...",
  "question": "What is the correct form of the present tense?",
  "voice": "nova",
  "speed": 0.85
}
```

### 6. Get Available Voices

**Endpoint:** `GET /api/tts/voices`

**Request:**
```bash
curl -X GET http://localhost:5000/api/tts/voices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Available voices",
  "voices": {
    "alloy": "Neutral, balanced voice - good for professional content",
    "echo": "Deep, warm voice - suitable for narration",
    "fable": "Friendly, engaging voice - good for interactive content",
    "onyx": "Deep, authoritative voice - suitable for important announcements",
    "nova": "Clear, natural voice - recommended for general use",
    "shimmer": "Bright, energetic voice - good for upbeat content"
  },
  "models": ["tts-1", "tts-1-hd"],
  "speedRange": {
    "min": 0.25,
    "max": 4.0,
    "default": 1.0
  }
}
```

## Frontend Usage

### Using the TTS Service

```typescript
import { ttsService } from '../services/tts';

// Generate speech from text
const response = await ttsService.generateSpeech(
  'Hello, welcome to the platform',
  'nova',
  1.0
);

// Use the audio
const audioUrl = response.data.audio;
```

### Using the Audio Player Component

```typescript
import AudioPlayer from '../components/AudioPlayer';

<AudioPlayer
  audioUrl={audioUrl}
  title="Scenario Narration"
  autoPlay={false}
  onPlay={() => console.log('Playing')}
  onPause={() => console.log('Paused')}
  onEnded={() => console.log('Finished')}
/>
```

## Performance Considerations

### Processing Time
- **Typical:** 1-3 seconds for 30 seconds of audio
- **Factors:** Text length, voice quality, API load
- **Timeout:** 10 seconds per request

### Cost Analysis
- **TTS API:** $0.015 per 1,000 characters
- **Example:** 1000 users × 5000 chars/month = $75/month
- **Optimization:** Cache common responses

### Audio Quality
- **tts-1:** Faster, lower latency (recommended for real-time)
- **tts-1-hd:** Higher quality, slightly slower

## Error Handling

### Common Errors

**1. Text Too Long**
```json
{
  "error": "Text exceeds maximum length of 4096 characters"
}
```

**2. Invalid Voice**
```json
{
  "error": "Invalid voice. Available voices: alloy, echo, fable, onyx, nova, shimmer"
}
```

**3. API Rate Limit**
```json
{
  "error": "Failed to generate speech",
  "details": "Rate limit exceeded"
}
```

**4. Invalid Speed**
```json
{
  "error": "Speed must be between 0.25 and 4.0"
}
```

## Security

### Data Protection
- Audio files generated on-the-fly (not stored)
- Base64 encoding for safe transmission
- HTTPS encryption in production

### Access Control
- JWT authentication required
- User-specific token validation
- Rate limiting per user

### Privacy
- No audio file persistence
- No user audio data storage
- Compliance with data protection regulations

## Optimization Tips

1. **Cache Common Responses**
   - Store frequently used audio (e.g., scenario intros)
   - Reduce API calls and costs

2. **Use Appropriate Models**
   - Use `tts-1` for real-time feedback
   - Use `tts-1-hd` for pre-recorded content

3. **Adjust Speaking Speed**
   - Slower (0.85-0.95) for clarity
   - Normal (1.0) for natural pace
   - Faster (1.1-1.3) for quick review

4. **Batch Processing**
   - Generate multiple audio files in parallel
   - Reduce total processing time

## Advanced Features

### Custom Voice Profiles
```typescript
// Create scenario-specific voice settings
const scenarioVoices = {
  'Customer Complaint': { voice: 'echo', speed: 0.9 },
  'Technical Support': { voice: 'nova', speed: 0.95 },
  'Sales Call': { voice: 'shimmer', speed: 1.0 },
};
```

### Dynamic Text Generation
```typescript
// Generate personalized narration
const narration = `Welcome, ${userName}. Today we'll practice ${scenarioName}.`;
const audio = await ttsService.generateSpeech(narration);
```

### Audio Streaming
```typescript
// Stream audio for real-time playback
const stream = await fetch('/api/tts/generate', {
  method: 'POST',
  body: JSON.stringify({ text: 'Your text' }),
});
```

## Troubleshooting

### Issue: "Failed to generate speech"
**Solution:**
- Check OpenAI API key is valid
- Verify text is not empty
- Ensure text is under 4096 characters
- Check API rate limits

### Issue: "Audio not playing"
**Solution:**
- Verify browser supports audio playback
- Check browser console for errors
- Ensure audio URL is valid
- Try different browser

### Issue: "Poor audio quality"
**Solution:**
- Use `tts-1-hd` model instead of `tts-1`
- Adjust speaking speed (try 0.9-1.0)
- Try different voice (e.g., 'nova' or 'shimmer')

### Issue: "High API costs"
**Solution:**
- Cache frequently used audio
- Use `tts-1` instead of `tts-1-hd`
- Reduce text length where possible
- Batch process requests

## Monitoring

### Metrics to Track
- API response time
- Error rate
- Audio generation success rate
- User engagement with audio features

### Logging
```typescript
console.log('TTS Request:', {
  textLength: text.length,
  voice: voice,
  timestamp: new Date().toISOString(),
});
```

## Future Enhancements

1. **Audio Caching** - Store generated audio for reuse
2. **Voice Cloning** - Create custom voice profiles
3. **Real-time Streaming** - Stream audio as it's generated
4. **Multilingual Support** - Support for multiple languages
5. **Emotion Detection** - Vary voice based on content emotion

## Support

For issues or questions:
1. Check OpenAI status: https://status.openai.com
2. Review API docs: https://platform.openai.com/docs/guides/text-to-speech
3. Check error logs in server console
4. Test with sample text first

---

**Last Updated:** November 17, 2025  
**TTS Model:** tts-1 and tts-1-hd  
**Status:** ✅ Production Ready
