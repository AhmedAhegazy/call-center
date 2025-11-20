# OpenAI Integration Guide

This document explains how the Call Center English AI platform integrates with OpenAI APIs for advanced AI features.

## Overview

The platform uses OpenAI's GPT-4 Mini model to provide intelligent feedback and personalized learning experiences.

## Features Powered by OpenAI

### 1. Speaking Session Analysis
**Endpoint:** `POST /api/ai/speaking-session/:sessionId/submit`

Analyzes user's speaking performance and provides detailed feedback on:
- **Fluency** (0-100): How naturally and smoothly they speak
- **Pronunciation** (0-100): Clarity and correctness of pronunciation
- **Grammar** (0-100): Correctness of grammar and sentence structure
- **Cultural Nuance** (0-100): Appropriateness for American business English context

**Example Request:**
```json
{
  "duration": 120,
  "transcript": "Hello, thank you for calling. How can I help you today?",
  "scenarioType": "Basic Customer Greeting",
  "expectedResponses": [
    "Hello, thank you for calling. How can I help you today?",
    "Good morning, what can I assist you with?"
  ]
}
```

**Example Response:**
```json
{
  "scores": {
    "fluencyScore": 78.5,
    "pronunciationScore": 82.0,
    "grammarScore": 75.5,
    "culturalNuanceScore": 80.0,
    "overallScore": 79.0
  },
  "feedback": "Good effort! Your pronunciation is clear, but try to speak more naturally...",
  "suggestions": [
    "Try to speak more naturally with better intonation",
    "Pay attention to stress patterns in words",
    "Use more varied vocabulary"
  ]
}
```

### 2. AI Tutor
**Endpoint:** `POST /api/ai/ask-tutor`

Provides intelligent answers to user questions about English grammar, vocabulary, and call center communication.

**Example Request:**
```json
{
  "question": "What's the difference between 'can' and 'could'?",
  "context": "Call center communication"
}
```

**Example Response:**
```json
{
  "response": {
    "answer": "Both 'can' and 'could' express ability, but they're used differently...",
    "explanation": "Detailed explanation of the grammar rule",
    "examples": [
      "Can you help me with this issue?",
      "Could you please provide your account number?"
    ],
    "relatedTopics": ["Modal verbs", "Politeness in English"]
  }
}
```

### 3. Scenario Evaluation
**Endpoint:** `POST /api/ai/scenario/:scenarioId/attempt`

Evaluates user's response to a call center scenario and provides constructive feedback.

**Example Request:**
```json
{
  "userResponse": "I understand your frustration. Let me help you resolve this issue."
}
```

**Example Response:**
```json
{
  "evaluation": {
    "score": 85,
    "feedback": "Excellent response! You showed empathy and took ownership of the problem.",
    "strengths": [
      "Clear empathy statement",
      "Professional tone",
      "Proactive solution approach"
    ],
    "improvements": [
      "Could offer a specific timeline for resolution"
    ]
  }
}
```

### 4. Adaptive Quiz Generation
**Endpoint:** `POST /api/ai/generate-quiz`

Generates personalized quiz questions based on difficulty level and category.

**Example Request:**
```json
{
  "category": "Grammar",
  "difficulty": "Intermediate",
  "count": 5
}
```

**Example Response:**
```json
{
  "questions": [
    {
      "question": "Which sentence is grammatically correct?",
      "options": [
        "She have gone to the store",
        "She has gone to the store",
        "She has go to the store",
        "She have go to the store"
      ],
      "correctAnswer": 1,
      "explanation": "With 'have/has', we use the past participle form 'gone'."
    }
  ]
}
```

## Setup Instructions

### 1. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in to your account
3. Navigate to API keys section
4. Create a new API key
5. Copy the key

### 2. Configure Environment Variables

Add your OpenAI API key to the `.env` file:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Install Dependencies

The OpenAI client is already installed. Verify with:

```bash
pnpm list openai
```

## API Service Layer

The OpenAI integration is implemented in `server/services/openai.ts` with the following functions:

### `analyzeSpeakingSession(transcript, scenarioType, expectedResponses)`
Analyzes a speaking session and returns detailed feedback.

### `generateTutorResponse(question, context)`
Generates an intelligent tutor response to a user question.

### `generateQuizQuestions(category, difficulty, count)`
Generates adaptive quiz questions.

### `evaluateScenarioResponse(userResponse, scenarioDescription, customerPersona, expectedResponses)`
Evaluates a user's response to a scenario.

### `generateLearningRecommendations(userProgress, weakSkills)`
Generates personalized learning recommendations.

## Cost Considerations

The platform uses the **GPT-4 Mini** model, which is cost-effective:

- **Input tokens:** $0.15 per 1M tokens
- **Output tokens:** $0.60 per 1M tokens

### Estimated Monthly Costs (100 active users)

- Speaking analysis: ~500 requests/month = ~$1-2
- Tutor questions: ~1000 requests/month = ~$2-4
- Scenario evaluation: ~500 requests/month = ~$1-2
- Quiz generation: ~200 requests/month = ~$0.50-1

**Total estimated monthly cost:** ~$5-10 for 100 active users

## Error Handling

The system has fallback mechanisms:

1. If OpenAI API fails, default feedback is provided
2. All OpenAI calls are wrapped in try-catch blocks
3. Errors are logged but don't break the user experience
4. Users can still complete activities with default feedback

## Rate Limiting

To avoid rate limits:

- Implement request queuing for high-traffic scenarios
- Cache common responses (e.g., frequently asked questions)
- Use exponential backoff for retries
- Monitor API usage in OpenAI dashboard

## Advanced Features (Future)

The platform is ready to integrate:

1. **Whisper API** - For speech-to-text transcription
2. **TTS API** - For text-to-speech feedback
3. **Fine-tuning** - Custom models trained on call center data
4. **Embeddings** - For semantic search and recommendations

## Monitoring and Logging

Monitor API usage:

```bash
# Check OpenAI usage
curl https://api.openai.com/v1/usage/requests \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

## Troubleshooting

### "API key not found"
- Verify `OPENAI_API_KEY` is set in `.env`
- Restart the server after changing environment variables

### "Rate limit exceeded"
- Wait a few minutes before retrying
- Implement exponential backoff in production

### "Invalid request format"
- Check the JSON structure matches the expected format
- Verify all required fields are provided

### "Model not found"
- Ensure you're using `gpt-4.1-mini` (not `gpt-4` or `gpt-3.5-turbo`)
- Check your OpenAI account has access to the model

## Best Practices

1. **Cache responses** - Store frequently requested feedback
2. **Batch requests** - Combine multiple analyses when possible
3. **Monitor costs** - Set up usage alerts in OpenAI dashboard
4. **Test thoroughly** - Test with various user inputs before production
5. **Provide fallbacks** - Always have default responses if API fails
6. **Log everything** - Track all API calls for debugging

## Security

- Never commit API keys to version control
- Use environment variables for sensitive data
- Implement rate limiting on the backend
- Validate user input before sending to OpenAI
- Monitor for unusual API usage patterns

## Support

For issues:
1. Check OpenAI status page: https://status.openai.com
2. Review API documentation: https://platform.openai.com/docs
3. Check error messages in server logs
4. Test with curl or Postman before debugging in code

---

**Last Updated:** November 15, 2025
**OpenAI Model:** GPT-4 Mini
**Status:** ✅ Production Ready
