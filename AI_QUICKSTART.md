# 🚀 Quick Start: AI Quiz Generation with OpenRouter

## Installation

1. **Install the OpenAI package:**

   ```bash
   npm install
   ```

2. **Set up your OpenRouter API key:**

   - Get an API key from [OpenRouter](https://openrouter.ai/keys)
   - Add it to your `.env` file:
     ```env
     OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
     AI_MODEL=openai/gpt-4o-mini
     ```

3. **Start your servers:**

   **Terminal 1 (Backend):**

   ```bash
   node server/index.js
   ```

   **Terminal 2 (Frontend):**

   ```bash
   npm run dev
   ```

## How to Use

1. Go to the "Create Quiz" page
2. Click **"Generate with AI"** button (✨)
3. Fill in the form:
   - Quiz title: "World History Quiz"
   - Number of questions: 5
   - Genre: "History"
   - Target age: "Adults" (optional)
   - Difficulty: Medium
   - Additional instructions: "Focus on 20th century" (optional)
4. Click **"Generate Quiz"**
5. Wait a few seconds for AI to generate
6. Edit questions if needed
7. Click **"Create Quiz"** to save

## Why OpenRouter?

- ✅ **100+ AI models** - GPT-4, Claude, Gemini, Llama, and more
- ✅ **One API key** for all models
- ✅ **Cheaper** than using OpenAI directly
- ✅ **Automatic fallbacks** if a model is down
- ✅ **Easy switching** between models

### Popular Models:

- `openai/gpt-4o-mini` - Fast & cheap (recommended)
- `anthropic/claude-3.5-sonnet` - Best for creative content
- `google/gemini-pro` - Good balance
- `meta-llama/llama-3.1-70b-instruct` - Open source

Change models in `.env`:

```env
AI_MODEL=anthropic/claude-3.5-sonnet
```

## That's it! 🎉

The AI will generate complete quiz questions with:

- Question text
- 4 multiple-choice options
- Correct answer marked
- Points, time limits, and more

You can tweak anything before saving!

---

**Need help?** Check the full documentation in `/docs/ai-quiz-generation.md`
