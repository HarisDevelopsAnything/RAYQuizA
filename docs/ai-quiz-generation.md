# AI Quiz Generation Feature

## Overview

The AI Quiz Generation feature allows users to automatically create quizzes using AI models through OpenRouter. OpenRouter provides access to multiple AI models (GPT-4, Claude, Gemini, Llama, etc.) through a single OpenAI-compatible API. Users can specify quiz parameters like title, topic, difficulty, and the AI will generate complete questions with multiple-choice options.

## Features

- **Easy Setup**: Simple button click to generate quizzes
- **Multiple AI Models**: Choose from GPT-4, Claude, Gemini, Llama, and more
- **Customizable Parameters**:
  - Quiz title
  - Number of questions (1-20)
  - Genre/Topic
  - Target age group
  - Difficulty level (Easy/Medium/Hard)
  - Additional instructions
- **Smart Generation**: Uses advanced AI models for high-quality quiz questions
- **Editable Output**: Generated questions can be tweaked before submission
- **Seamless Integration**: Auto-fills the quiz creation form
- **Cost Effective**: OpenRouter offers competitive pricing across models

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install the `openai` package (v4.73.0) which is compatible with OpenRouter.

### 2. Get OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/keys)
2. Sign up or log in
3. Click "Create Key"
4. Copy the API key (it starts with `sk-or-v1-...`)

### 3. Configure Environment Variables

Add your OpenRouter API key to the `.env` file:

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
AI_MODEL=openai/gpt-4o-mini
```

**Popular Model Options:**

- `openai/gpt-4o-mini` - Fast, cheap, good quality (recommended for testing)
- `openai/gpt-4o` - Best quality, more expensive
- `anthropic/claude-3.5-sonnet` - Excellent reasoning and creativity
- `google/gemini-pro` - Good balance of speed and quality
- `meta-llama/llama-3.1-70b-instruct` - Open source, great performance

⚠️ **Important**: Never commit your actual API key to version control!

### 4. Start the Development Servers

**Terminal 1 - Backend Server:**

```bash
node server/index.js
```

**Terminal 2 - Frontend Dev Server:**

```bash
npm run dev
```

## Usage Guide

### For Users

1. Navigate to "Create Quiz" page
2. Click the **"Generate with AI"** button (with sparkle icon ✨)
3. Fill in the quiz parameters:
   - **Quiz Title**: Name of your quiz
   - **Number of Questions**: How many questions (1-20)
   - **Genre/Topic**: Subject matter (e.g., "World History", "Science")
   - **Target Age** (optional): Age group like "10-12", "Adults"
   - **Difficulty**: Easy, Medium, or Hard
   - **Additional Instructions** (optional): Specific requirements
4. Click **"Generate Quiz"**
5. Wait for AI to generate questions (usually 5-15 seconds)
6. Review and edit the generated questions as needed
7. Click "Create Quiz" to save

### Example Use Cases

- **Teachers**: Generate educational quizzes for students
- **Trainers**: Create assessment quizzes for courses
- **Fun**: Generate trivia quizzes for game nights
- **Learning**: Create practice tests for exam prep

## Technical Details

### Backend API Endpoint

**POST** `/api/generate-quiz`

**Request Body:**

```json
{
  "title": "World History Quiz",
  "numQuestions": 5,
  "genre": "History",
  "targetAge": "Adults",
  "difficulty": "medium",
  "additionalInstructions": "Focus on 20th century"
}
```

**Response:**

```json
{
  "title": "World History Quiz",
  "description": "A quiz about world history",
  "categories": ["History", "20th Century"],
  "questions": [
    {
      "question": "Who was the first president of the United States?",
      "type": "text",
      "answerType": "single",
      "options": [
        "George Washington",
        "Thomas Jefferson",
        "John Adams",
        "Benjamin Franklin"
      ],
      "correctOption": 0,
      "imageUrl": "",
      "points": 1,
      "negativePoints": 0,
      "timeLimit": 30
    }
  ]
}
```

### Files Modified/Created

- **Frontend**:
  - `/src/components/AIQuizGenerator/AIQuizGenerator.tsx` - AI generation modal
  - `/src/pages/Home/CreateQuiz/CreateQuiz.tsx` - Updated with AI button
  - `/vite.config.ts` - Added API proxy
- **Backend**:
  - `/server/ai-quiz-routes.js` - API routes for quiz generation
  - `/server/index.js` - Integrated AI routes
- **Configuration**:
  - `/package.json` - Added OpenAI dependency
  - `/.env` - Added OPENAI_API_KEY
  - `/.env.example` - Template for environment variables

### AI Model Details

- **Provider**: OpenRouter (supports multiple AI providers)
- **Default Model**: GPT-4o-mini
- **Temperature**: 0.8 (for creative variety)
- **Response Format**: JSON mode for structured output
- **Cost**: Varies by model:

  - GPT-4o-mini: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
  - Claude 3.5 Sonnet: ~$3 per 1M input tokens, ~$15 per 1M output tokens
  - Gemini Pro: ~$0.50 per 1M input tokens, ~$1.50 per 1M output tokens

  Typical quiz generation: ~$0.001-0.01 per quiz

**Why OpenRouter?**

- Access to 100+ models through one API
- Automatic fallbacks if a model is down
- Competitive pricing
- No need for multiple API keys
- Easy model switching

## Troubleshooting

### "Failed to generate quiz"

- **Check API Key**: Ensure `OPENROUTER_API_KEY` is set correctly in `.env`
- **Check Credits**: Verify your OpenRouter account has credits
- **Check Server**: Make sure backend server is running on port 5000
- **Check Logs**: Look at server console for detailed error messages
- **Try Different Model**: Some models may be temporarily unavailable

### Model Selection

You can change the AI model by updating `AI_MODEL` in `.env`:

```env
AI_MODEL=anthropic/claude-3.5-sonnet
```

Or leave it unset to use the default (GPT-4o-mini).

### Quiz generates but doesn't fill form

- Clear browser cache
- Check browser console for JavaScript errors
- Verify the response format matches expected structure

### Server won't start

- Check if port 5000 is already in use
- Ensure all dependencies are installed (`npm install`)
- Verify `.env` file exists and is properly formatted

### Proxy errors in development

- Make sure backend is running before starting frontend
- Check `vite.config.ts` proxy configuration
- Verify backend is on `http://localhost:5000`

## Cost Considerations

- Each quiz generation typically costs $0.001-0.01 USD (depending on model)
- GPT-4o-mini is the most cost-effective option
- Set up spending limits in OpenRouter dashboard
- Monitor your API usage regularly at https://openrouter.ai/activity
- OpenRouter shows real-time costs per request

## Security Notes

- Never expose your API key in client-side code
- All API calls go through your backend server
- API key is stored securely in `.env` file
- Consider implementing user authentication for production
- Add rate limiting to prevent abuse
- OpenRouter provides built-in rate limiting and abuse detection

## Future Enhancements

- [ ] Support for image-based questions
- [ ] Multiple AI model selection in UI
- [ ] Question difficulty validation
- [ ] Bulk quiz generation
- [ ] Quiz template library
- [ ] Cost tracking and usage analytics
- [ ] Caching for similar quiz requests
- [ ] Model comparison feature

## Support

For issues or questions:

1. Check this documentation
2. Review server logs for errors
3. Check OpenRouter status: https://openrouter.ai/status
4. OpenRouter documentation: https://openrouter.ai/docs
5. OpenRouter Discord: https://discord.gg/openrouter

## Useful Links

- **OpenRouter Dashboard**: https://openrouter.ai/
- **API Keys**: https://openrouter.ai/keys
- **Model Pricing**: https://openrouter.ai/models
- **Usage Analytics**: https://openrouter.ai/activity
- **Documentation**: https://openrouter.ai/docs

---

**Note**: This feature requires an active OpenRouter API key and internet connection to function.
