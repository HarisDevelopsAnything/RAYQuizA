import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenRouter client (OpenAI-compatible)
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
    'X-Title': 'RAYQuizA',
  },
});

router.post('/generate-quiz', async (req, res) => {
  try {
    const {
      title,
      numQuestions,
      genre,
      targetAge,
      difficulty,
      additionalInstructions,
    } = req.body;

    // Validate required fields
    if (!title || !numQuestions || !genre) {
      return res.status(400).json({
        error: 'Missing required fields: title, numQuestions, and genre are required',
      });
    }

    // Build the prompt for OpenRouter
    const prompt = buildQuizPrompt({
      title,
      numQuestions,
      genre,
      targetAge,
      difficulty,
      additionalInstructions,
    });

    const selectedModel = process.env.AI_MODEL || 'openai/gpt-4o-mini';
    
    // Some models don't support JSON mode, so we'll try with and without
    const requestConfig = {
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates educational quiz questions in JSON format. Always respond with valid JSON only, no additional text or markdown.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
    };

    // Try to add JSON mode if the model supports it
    // Most OpenAI and some other models support this
    if (selectedModel.includes('openai/') || selectedModel.includes('gpt')) {
      requestConfig.response_format = { type: 'json_object' };
    }

    // Call OpenRouter API (supports multiple models)
    const completion = await openai.chat.completions.create(requestConfig);

    const generatedContent = completion.choices[0].message.content;
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedContent = generatedContent.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```\n?/g, '');
    }
    
    const quizData = JSON.parse(cleanedContent);

    // Validate and format the response
    const formattedQuiz = formatQuizResponse(quizData, title);

    res.json(formattedQuiz);
  } catch (error) {
    console.error('Error generating quiz:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to generate quiz';
    let errorDetails = error.message;
    
    if (error.response) {
      errorDetails = error.response.data?.error?.message || error.response.data || error.message;
    }
    
    res.status(500).json({
      error: errorMessage,
      details: errorDetails,
      model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
    });
  }
});

function buildQuizPrompt(params) {
  const {
    title,
    numQuestions,
    genre,
    targetAge,
    difficulty,
    additionalInstructions,
  } = params;

  let prompt = `Generate a quiz with the following specifications:
- Title: ${title}
- Number of Questions: ${numQuestions}
- Genre/Topic: ${genre}
- Difficulty: ${difficulty || 'medium'}`;

  if (targetAge) {
    prompt += `\n- Target Age Group: ${targetAge}`;
  }

  if (additionalInstructions) {
    prompt += `\n- Additional Instructions: ${additionalInstructions}`;
  }

  prompt += `

CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanation.

Return a JSON object with the following EXACT structure:
{
  "description": "A brief description of the quiz (2-3 sentences)",
  "categories": ["array", "of", "relevant", "categories"],
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctOption": 0,
      "points": 1,
      "negativePoints": 0,
      "timeLimit": 30
    }
  ]
}

IMPORTANT RULES:
- Respond with ONLY the JSON object, nothing else
- Each question MUST have exactly 4 options
- correctOption is the index (0-3) of the correct answer
- Make questions engaging and educational
- Ensure questions match the difficulty level
- Points should be 1-3 based on difficulty
- Time limit should be 20-60 seconds based on question complexity
- Include 2-4 relevant categories
- All questions should be single choice (one correct answer)`;

  return prompt;
}

function formatQuizResponse(quizData, title) {
  return {
    title: title,
    description: quizData.description || 'AI-generated quiz',
    categories: quizData.categories || ['General'],
    questions: quizData.questions.map((q) => ({
      question: q.question,
      type: 'text',
      answerType: 'single',
      options: q.options,
      correctOption: q.correctOption,
      imageUrl: '',
      points: q.points || 1,
      negativePoints: q.negativePoints || 0,
      timeLimit: q.timeLimit || 30,
    })),
  };
}

export default router;
