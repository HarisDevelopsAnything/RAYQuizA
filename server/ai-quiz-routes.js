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

// Endpoint to fetch available free models from OpenRouter
router.get('/available-models', async (req, res) => {
  try {
    console.log('Fetching available models from OpenRouter...');
    
    // Fetch models from OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
        'X-Title': 'RAYQuizA',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Received ${data.data?.length || 0} models from OpenRouter`);

    // Filter for completely free models (pricing.prompt = 0 and pricing.completion = 0)
    const freeModels = data.data.filter(model => {
      const pricing = model.pricing;
      const isFree = pricing && 
        parseFloat(pricing.prompt) === 0 && 
        parseFloat(pricing.completion) === 0;
      return isFree;
    }).map(model => ({
      id: model.id,
      name: model.name || model.id,
      description: model.description || '',
      context_length: model.context_length || 0,
    }));

    console.log(`Filtered to ${freeModels.length} free models`);
    console.log('Free models:', freeModels.map(m => m.id).join(', '));

    res.json({
      models: freeModels,
      count: freeModels.length,
    });
  } catch (error) {
    console.error('Error fetching available models:', error);
    res.status(500).json({
      error: 'Failed to fetch available models',
      details: error.message,
    });
  }
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
      model, // Accept model from frontend
    } = req.body;

    // Validate required fields
    if (!title || !numQuestions || !genre) {
      return res.status(400).json({
        error: 'Missing required fields: title, numQuestions, and genre are required',
      });
    }

    // Validate model is provided
    if (!model) {
      return res.status(400).json({
        error: 'Model selection is required',
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

    const selectedModel = model; // Use the model selected by user
    
    // Some models don't support JSON mode, so we'll try with and without
    const requestConfig = {
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates educational quiz questions in JSON format. Always respond with valid JSON only, no additional text or markdown. Do not use code blocks.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
    };

    // Try to add JSON mode if the model supports it
    // Most OpenAI models support this, but free models might not
    const modelsWithJsonSupport = ['openai/gpt-4', 'openai/gpt-3.5', 'gpt-4', 'gpt-3.5'];
    const supportsJsonMode = modelsWithJsonSupport.some(m => selectedModel.includes(m));
    
    if (supportsJsonMode) {
      requestConfig.response_format = { type: 'json_object' };
      console.log('Using JSON mode for this model');
    } else {
      console.log('Model does not support JSON mode, relying on prompt engineering');
    }

    // Call OpenRouter API (supports multiple models)
    console.log('Calling OpenRouter API with model:', selectedModel);
    const completion = await openai.chat.completions.create(requestConfig);

    console.log('===== FULL API RESPONSE =====');
    console.log(JSON.stringify(completion, null, 2));
    console.log('============================');

    const generatedContent = completion.choices[0].message.content;
    
    // Log the raw response for debugging
    console.log('===== AI GENERATED CONTENT =====');
    console.log('Length:', generatedContent?.length || 0);
    console.log('Full content:');
    console.log(generatedContent);
    console.log('================================');
    
    if (!generatedContent || generatedContent.trim().length === 0) {
      throw new Error('AI model returned empty response. Try a different model or check your API key.');
    }
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedContent = generatedContent.trim();
    console.log('Cleaned content before JSON parse:');
    console.log(cleanedContent);
    
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      console.log('Removed ```json blocks');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```\n?/g, '');
      console.log('Removed ``` blocks');
    }
    
    // Extract JSON if there's extra text after it
    // Some models add explanation after the JSON
    try {
      // Try to find the first { and last }
      const firstBrace = cleanedContent.indexOf('{');
      const lastBrace = cleanedContent.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1);
        console.log('Extracted JSON from position', firstBrace, 'to', lastBrace);
      }
    } catch (e) {
      console.log('Could not extract JSON, using original content');
    }
    
    console.log('Final content to parse:');
    console.log(cleanedContent);
    console.log('Attempting to parse JSON...');
    const quizData = JSON.parse(cleanedContent);
    console.log('✅ JSON parsed successfully!');

    // Validate and format the response
    const formattedQuiz = formatQuizResponse(quizData, title);

    res.json(formattedQuiz);
  } catch (error) {
    console.error('Error generating quiz:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to generate quiz';
    let errorDetails = error.message;
    
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      errorDetails = error.response.data?.error?.message || JSON.stringify(error.response.data) || error.message;
    }
    
    // Check for common issues
    if (error.message.includes('JSON')) {
      errorDetails = `Model returned invalid JSON. Try a different model. Error: ${error.message}`;
    } else if (error.message.includes('API key')) {
      errorDetails = 'Invalid API key. Check your OPENROUTER_API_KEY in environment variables.';
    } else if (error.message.includes('model')) {
      errorDetails = `Model issue: ${error.message}. Try a different model.`;
    }
    
    res.status(500).json({
      error: errorMessage,
      details: errorDetails,
      model: req.body.model || 'unknown',
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

CRITICAL INSTRUCTIONS:
1. Respond with ONLY valid JSON - no markdown, no code blocks (no \`\`\`), no explanation text
2. Start your response with { and end with }
3. Do not wrap the JSON in any formatting

Return a JSON object with this EXACT structure:
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
- Do NOT use markdown code blocks (\`\`\`json or \`\`\`)
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
