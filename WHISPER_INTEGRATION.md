# Whisper API Integration Guide

## Overview

The Call Center English AI platform now integrates OpenAI's Whisper API for real-time speech-to-text transcription. This enables accurate audio transcription for the Speaking Practice feature.

## Features

### 1. Real-Time Audio Transcription
- Convert user speech to text using Whisper API
- Support for multiple audio formats (mp3, mp4, wav, webm, m4a, etc.)
- Automatic language detection
- High accuracy for English speech

### 2. Audio Processing
- File upload via multipart/form-data
- Automatic file validation
- Size limit enforcement (25MB max)
- Temporary file cleanup after processing

### 3. Integration with AI Analysis
- Transcribed text is automatically analyzed by GPT-4
- Scoring on fluency, pronunciation, grammar, and cultural nuance
- Detailed feedback generation

## Architecture

### Backend Components

**1. Whisper Service (`server/services/whisper.ts`)**
```typescript
- transcribeAudio(filePath) - Transcribe audio file
- transcribeAudioBuffer(buffer) - Transcribe from buffer
- transcribeAudioWithLanguageDetection() - Auto-detect language
- transcribeAudioVerbose() - Get detailed output with timestamps
- validateAudioFile() - Validate file format
- isFileSizeValid() - Check file size
```

**2. Upload Middleware (`server/middleware/upload.ts`)**
```typescript
- upload.single('audio') - Handle single audio file upload
- cleanupFile() - Delete temporary files
- getUploadsDir() - Get uploads directory path
```

**3. AI Routes (`server/routes/ai.ts`)**
```
POST /api/ai/speaking-session/:sessionId/submit
  - Accepts audio file upload
  - Transcribes using Whisper
  - Analyzes with GPT-4
  - Returns transcript and scores
```

### Frontend Components

**Speaking Practice Page (`client/src/pages/SpeakingPracticePage.tsx`)**
- Real-time audio recording with Web Audio API
- Audio quality settings (echo cancellation, noise suppression)
- Progress tracking during recording
- FormData submission with audio file
- Real-time feedback display

## API Endpoints

### Submit Speaking Response with Audio

**Endpoint:** `POST /api/ai/speaking-session/:sessionId/submit`

**Request:**
```bash
curl -X POST http://localhost:5000/api/ai/speaking-session/1/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "audio=@recording.webm" \
  -F "duration=45" \
  -F "scenarioType=Customer Complaint" \
  -F "expectedResponses=[\"I understand your concern\", \"Let me help you\"]"
```

**Request Body (multipart/form-data):**
- `audio` (File) - Audio file in supported format
- `duration` (number) - Recording duration in seconds
- `scenarioType` (string) - Type of scenario
- `expectedResponses` (JSON string) - Expected response examples

**Response:**
```json
{
  "message": "Speaking response submitted",
  "session": {
    "id": 1,
    "userId": 1,
    "scenarioType": "Customer Complaint",
    "duration": 45,
    "fluencyScore": 78.5,
    "pronunciationScore": 82.0,
    "grammarScore": 75.5,
    "culturalNuanceScore": 80.0,
    "overallScore": 79.0,
    "aiTranscript": "I understand your frustration. Let me help you resolve this issue.",
    "aiFeedback": "Good effort! Your pronunciation is clear...",
    "completedAt": "2025-11-17T23:30:00Z"
  },
  "transcript": "I understand your frustration. Let me help you resolve this issue.",
  "scores": {
    "fluencyScore": 78.5,
    "pronunciationScore": 82.0,
    "grammarScore": 75.5,
    "culturalNuanceScore": 80.0,
    "overallScore": 79.0
  },
  "feedback": "Good effort! Your pronunciation is clear...",
  "suggestions": [
    "Try to speak more naturally with better intonation",
    "Pay attention to stress patterns in words",
    "Use more varied vocabulary"
  ]
}
```

## Supported Audio Formats

| Format | MIME Type | Extension |
|--------|-----------|-----------|
| MP3 | audio/mpeg | .mp3 |
| MP4 | audio/mp4 | .mp4 |
| MPEG | audio/mpeg | .mpeg |
| MPGA | audio/mpga | .mpga |
| M4A | audio/x-m4a | .m4a |
| WAV | audio/wav | .wav |
| WebM | audio/webm | .webm |

## Audio Quality Settings

The frontend implements audio quality optimization:

```typescript
{
  audio: {
    echoCancellation: true,      // Remove echo
    noiseSuppression: true,      // Reduce background noise
    autoGainControl: true,       // Auto volume adjustment
  }
}
```

## File Size Limits

- **Maximum file size:** 25MB (Whisper API limit)
- **Recommended:** < 10MB for faster processing
- **Minimum:** > 100KB for meaningful transcription

## Error Handling

### Common Errors

**1. Invalid Audio Format**
```json
{
  "error": "Invalid audio format. Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, webm"
}
```

**2. File Too Large**
```json
{
  "error": "Audio file is too large. Maximum size: 25MB"
}
```

**3. Microphone Access Denied**
```json
{
  "error": "Failed to access microphone. Please check permissions."
}
```

**4. Transcription Failed**
```json
{
  "error": "Error processing audio file",
  "details": "API rate limit exceeded"
}
```

## Performance Considerations

### Processing Time
- **Typical:** 5-15 seconds for 30-60 second audio
- **Factors:** Audio length, file size, API load
- **Timeout:** 30 seconds per request

### Cost Analysis
- **Whisper API:** $0.02 per minute of audio
- **Example:** 1000 users × 5 minutes/month = $100/month
- **Optimization:** Cache common responses

### Optimization Tips
1. **Compress audio** before sending (use WebM format)
2. **Limit recording length** to 2-3 minutes
3. **Batch process** multiple recordings
4. **Cache results** for identical audio

## Security

### Data Protection
- Audio files stored temporarily in `/uploads` directory
- Automatic cleanup after processing
- No persistent storage of audio files
- HTTPS encryption in production

### Access Control
- JWT authentication required
- User can only access their own sessions
- Rate limiting on API endpoints
- Input validation on all parameters

### Privacy
- Audio files deleted immediately after transcription
- No audio retention in logs
- User consent required for recording
- Compliance with data protection regulations

## Setup Instructions

### 1. Install Dependencies
```bash
pnpm add multer @types/multer
```

### 2. Configure Environment
```env
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Create Uploads Directory
```bash
mkdir -p /home/ubuntu/call_center_english_ai/uploads
```

### 4. Update Routes
The AI routes are already configured to handle audio uploads.

## Testing

### Test with cURL
```bash
# Record audio first (use your device)
# Then submit:
curl -X POST http://localhost:5000/api/ai/speaking-session/1/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@test_audio.wav" \
  -F "duration=30" \
  -F "scenarioType=Greeting" \
  -F "expectedResponses=[\"Hello\"]"
```

### Test with Frontend
1. Navigate to Speaking Practice page
2. Select a scenario
3. Click "Start Recording"
4. Speak clearly for 30-60 seconds
5. Click "Stop Recording"
6. Wait for processing (5-15 seconds)
7. View transcript and feedback

## Troubleshooting

### Issue: "API key not found"
**Solution:** Verify `OPENAI_API_KEY` is set in `.env`

### Issue: "Rate limit exceeded"
**Solution:** 
- Wait a few minutes before retrying
- Implement exponential backoff
- Consider batching requests

### Issue: "Poor transcription quality"
**Solution:**
- Speak clearly and slowly
- Reduce background noise
- Use a better microphone
- Ensure good audio levels

### Issue: "Microphone not working"
**Solution:**
- Check browser permissions
- Try a different browser
- Restart the application
- Check system microphone settings

## Advanced Features

### Language Detection
```typescript
// Auto-detect language (remove language parameter)
const transcript = await openai.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
  response_format: 'json',
});
```

### Verbose Output with Timestamps
```typescript
// Get detailed output with word-level timestamps
const transcript = await transcribeAudioVerbose(audioPath);
// Returns: { text, segments, language }
```

### Multiple Language Support
```typescript
// Specify language for better accuracy
const transcript = await openai.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
  language: 'en', // or 'ar' for Arabic, etc.
});
```

## Future Enhancements

1. **Real-time Transcription** - Stream audio chunks for live feedback
2. **Speaker Identification** - Distinguish between user and scenario speaker
3. **Emotion Detection** - Analyze tone and emotion in speech
4. **Accent Analysis** - Provide specific accent feedback
5. **Pronunciation Scoring** - Compare with native speaker reference

## Monitoring

### Metrics to Track
- Average transcription time
- API error rate
- Audio quality metrics
- User satisfaction scores

### Logging
```typescript
console.log('Transcription completed:', {
  duration: audioLength,
  accuracy: confidenceScore,
  processingTime: endTime - startTime,
});
```

## Support

For issues or questions:
1. Check OpenAI status: https://status.openai.com
2. Review API docs: https://platform.openai.com/docs/guides/speech-to-text
3. Check error logs in server console
4. Test with sample audio files

---

**Last Updated:** November 17, 2025  
**Whisper Model:** whisper-1  
**Status:** ✅ Production Ready
