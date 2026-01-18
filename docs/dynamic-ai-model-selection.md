# Dynamic AI Model Selection

## Overview
The AI quiz generation feature now dynamically fetches and lists available free models from OpenRouter, allowing users to select their preferred model at generation time. This eliminates the need to manually update environment variables when OpenRouter changes model names or pricing.

## How It Works

### Backend Changes

#### 1. New Endpoint: `GET /api/available-models`
- Fetches all available models from OpenRouter API
- Filters to show only completely free models (where both `pricing.prompt` and `pricing.completion` are 0)
- Returns model information including:
  - `id`: The model identifier
  - `name`: Human-readable model name
  - `description`: Model description
  - `context_length`: Maximum context length

#### 2. Updated Endpoint: `POST /api/generate-quiz`
- Now accepts a `model` parameter in the request body
- Uses the user-selected model instead of `AI_MODEL` environment variable
- Returns more helpful error messages when a model fails

### Frontend Changes

#### AIQuizGenerator Component
- **Model Fetching**: Automatically fetches available models when opened
- **Model Selection UI**: Dropdown showing all free models with descriptions
- **Loading States**: Shows spinner while fetching models
- **Error Handling**: Displays errors and retry button if model fetching fails
- **Auto-selection**: Automatically selects the first available model
- **Validation**: Ensures a model is selected before generation

## Benefits

1. **Automatic Updates**: No manual intervention needed when OpenRouter changes models
2. **Always Free**: Only shows models that are completely free to use
3. **User Choice**: Users can try different models to see which generates better quizzes
4. **Future-Proof**: Works regardless of OpenRouter's model catalog changes
5. **Better UX**: Clear feedback about available models and their details

## API Requirements

The OpenRouter API key (`OPENROUTER_API_KEY`) must still be set in environment variables for both:
- Fetching available models
- Generating quizzes

## Migration Notes

- The `AI_MODEL` environment variable is no longer used
- Existing deployments will automatically use dynamic model selection
- No database changes required
- Backward compatible (old code still works if models are available)

## Testing

To test the feature:
1. Open the AI Quiz Generator
2. Verify the model dropdown appears with available free models
3. Select a model
4. Generate a quiz to confirm it works

## Future Enhancements

Potential improvements:
- Cache models list for a short period to reduce API calls
- Show model capabilities (context length, strengths)
- Allow filtering/sorting models
- Remember user's preferred model in local storage
