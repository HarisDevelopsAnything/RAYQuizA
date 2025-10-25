# 🔧 Troubleshooting AI Quiz Generation

## Your Current Setup

- API Key: ✅ Set
- Model: `openrouter/andromeda-alpha`

## Issue: `openrouter/andromeda-alpha` May Not Be Ideal

The model you selected might have issues with structured JSON output. Here are **tested and recommended models**:

## ✅ Recommended Models (Tested & Working)

### Best for Testing (Cheap & Reliable)

```env
AI_MODEL=openai/gpt-4o-mini
```

- Cost: ~$0.001 per quiz
- Speed: Fast
- Quality: Excellent
- JSON support: ✅ Native

### Alternative Budget Options

```env
AI_MODEL=google/gemini-flash-1.5-8b
```

- Cost: ~$0.0003 per quiz
- Speed: Very fast
- Quality: Good

```env
AI_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

- Cost: FREE! 🎉
- Speed: Fast
- Quality: Good
- Limit: Rate limited

### Premium Options (Better Quality)

```env
AI_MODEL=anthropic/claude-3.5-sonnet
```

- Cost: ~$0.005 per quiz
- Speed: Medium
- Quality: Excellent
- Best for creative quizzes

```env
AI_MODEL=openai/gpt-4o
```

- Cost: ~$0.004 per quiz
- Speed: Medium
- Quality: Best overall

## 🚀 Quick Fix Steps

### 1. Update Your Model

Edit `.env` and change:

```env
AI_MODEL=openai/gpt-4o-mini
```

### 2. Restart Your Backend Server

```bash
# Stop the current server (Ctrl+C in the terminal)
# Then restart:
node server/index.js
```

### 3. Try Generating a Quiz Again

## Common Errors & Solutions

### ❌ "Failed to generate quiz"

**Possible causes:**

1. Backend server not running
2. Invalid API key
3. Model doesn't exist or is unavailable
4. No credits in OpenRouter account

**Solutions:**

- Check if backend is running: `node server/index.js`
- Verify API key at: https://openrouter.ai/keys
- Try a different model (use `openai/gpt-4o-mini`)
- Check credits at: https://openrouter.ai/credits

### ❌ "JSON parsing error"

**Cause:** Model returned non-JSON response

**Solution:** Use a model with better JSON support:

```env
AI_MODEL=openai/gpt-4o-mini
```

### ❌ "Model not found"

**Cause:** Typo in model name or model doesn't exist

**Solution:** Check available models at: https://openrouter.ai/models

### ❌ "Rate limited"

**Cause:** Too many requests

**Solutions:**

- Wait a few seconds and try again
- Use a different model
- Upgrade OpenRouter plan

### ❌ "Insufficient credits"

**Cause:** OpenRouter account has no credits

**Solution:** Add credits at: https://openrouter.ai/credits

## 🔍 Check Server Status

### Is your backend running?

```bash
# In a new terminal:
node server/index.js
```

You should see:

```
Server running on port 5000
```

### Check for errors

Look at the backend terminal for detailed error messages.

## 🧪 Test Your Setup

### 1. Test API Key

Visit: https://openrouter.ai/activity

- You should see your requests if the API key is working

### 2. Test Backend Connection

Open browser console (F12) and check Network tab when generating

### 3. Test with Simplest Model

Use the free model to test:

```env
AI_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

## 📊 Model Comparison

| Model               | Cost/Quiz | Speed  | JSON Support | Recommended |
| ------------------- | --------- | ------ | ------------ | ----------- |
| gpt-4o-mini         | $0.001    | ⚡⚡⚡ | ✅ Native    | ⭐⭐⭐⭐⭐  |
| gemini-flash        | $0.0003   | ⚡⚡⚡ | ✅ Good      | ⭐⭐⭐⭐    |
| llama-3.1-8b (free) | FREE      | ⚡⚡   | ⚠️ Ok        | ⭐⭐⭐      |
| claude-3.5          | $0.005    | ⚡⚡   | ✅ Excellent | ⭐⭐⭐⭐⭐  |
| gpt-4o              | $0.004    | ⚡⚡   | ✅ Native    | ⭐⭐⭐⭐⭐  |
| andromeda-alpha     | $?        | ⚡     | ❌ Issues    | ⭐          |

## 💡 Pro Tips

1. **Start simple**: Use `openai/gpt-4o-mini` first
2. **Check logs**: Always look at server console for errors
3. **Monitor usage**: Check https://openrouter.ai/activity
4. **Try free models**: Test with free models before paid ones
5. **Read errors**: Error messages now include helpful details

## 🆘 Still Having Issues?

1. **Check backend is running**: Should be on port 5000
2. **Check .env file**: Ensure no extra spaces or quotes
3. **Check API key**: Copy-paste fresh from OpenRouter
4. **Try different model**: Use `openai/gpt-4o-mini`
5. **Check browser console**: Look for network errors
6. **Check server console**: Look for detailed error logs

## 📞 Get Help

- **OpenRouter Status**: https://openrouter.ai/status
- **OpenRouter Discord**: https://discord.gg/openrouter
- **Model List**: https://openrouter.ai/models
- **Your Usage**: https://openrouter.ai/activity

---

**Quick Fix Command:**

```bash
# In .env, change to:
AI_MODEL=openai/gpt-4o-mini

# Restart server:
node server/index.js
```
