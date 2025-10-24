# OpenRouter Configuration Reference

## Quick Setup
```bash
# 1. Get your API key from https://openrouter.ai/keys
# 2. Add to .env:
OPENROUTER_API_KEY=sk-or-v1-your-key-here
AI_MODEL=openai/gpt-4o-mini
```

## Available Models

### Budget-Friendly (Recommended for testing)
```env
AI_MODEL=openai/gpt-4o-mini              # $0.15/$0.60 per 1M tokens
AI_MODEL=google/gemini-flash-1.5         # $0.075/$0.30 per 1M tokens
AI_MODEL=meta-llama/llama-3.1-8b-instruct # $0.05/$0.08 per 1M tokens
```

### Premium Quality
```env
AI_MODEL=openai/gpt-4o                    # $2.50/$10 per 1M tokens
AI_MODEL=anthropic/claude-3.5-sonnet      # $3/$15 per 1M tokens
AI_MODEL=google/gemini-pro-1.5            # $1.25/$5 per 1M tokens
```

### Best for Creative Content
```env
AI_MODEL=anthropic/claude-3.5-sonnet      # Excellent reasoning
AI_MODEL=openai/gpt-4o                    # Most capable
```

### Best for Cost
```env
AI_MODEL=openai/gpt-4o-mini              # Best balance
AI_MODEL=meta-llama/llama-3.1-8b-instruct # Cheapest
```

## Estimated Costs per Quiz

| Model | 5 Questions | 10 Questions | 20 Questions |
|-------|-------------|--------------|--------------|
| GPT-4o-mini | $0.001 | $0.002 | $0.004 |
| Gemini Flash | $0.0005 | $0.001 | $0.002 |
| Claude 3.5 | $0.005 | $0.010 | $0.020 |
| GPT-4o | $0.004 | $0.008 | $0.016 |
| Llama 3.1 8B | $0.0003 | $0.0006 | $0.0012 |

## Testing Different Models

You can test different models without changing `.env`:

1. Set a default in `.env`:
   ```env
   AI_MODEL=openai/gpt-4o-mini
   ```

2. Override in your code (server/ai-quiz-routes.js):
   ```javascript
   model: 'anthropic/claude-3.5-sonnet', // Override here
   ```

## Model Recommendations

**For Production:**
- `openai/gpt-4o-mini` - Best balance of cost/quality
- Fallback to `google/gemini-flash-1.5` if budget is tight

**For Premium Features:**
- `anthropic/claude-3.5-sonnet` - Best reasoning and creativity
- `openai/gpt-4o` - Most capable overall

**For High Volume:**
- `google/gemini-flash-1.5` - Very cheap, decent quality
- `meta-llama/llama-3.1-8b-instruct` - Cheapest option

## Monitoring Usage

Check your usage at:
- **Dashboard**: https://openrouter.ai/
- **Activity**: https://openrouter.ai/activity
- **Costs**: Real-time cost tracking per request

## Rate Limits

OpenRouter handles rate limits automatically:
- Automatic retries on rate limits
- Fallback to alternative models (optional)
- Per-model rate limits vary

## Support Resources

- **Models List**: https://openrouter.ai/models
- **Pricing**: https://openrouter.ai/models (sortable by price)
- **Docs**: https://openrouter.ai/docs
- **Discord**: https://discord.gg/openrouter
- **Status**: https://openrouter.ai/status

## Tips

1. **Start with gpt-4o-mini** - Good quality, low cost
2. **Monitor costs** - Check activity page regularly
3. **Set spending limits** - In OpenRouter dashboard
4. **Test models** - Different models excel at different tasks
5. **Use fallbacks** - OpenRouter can auto-switch if model is down

## Environment Variables Summary

```env
# Required
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Optional (with defaults)
AI_MODEL=openai/gpt-4o-mini          # Default model
APP_URL=http://localhost:5173         # Your app URL
```

---

**Pro Tip**: OpenRouter often has promotional credits for new users. Check their dashboard!
