# 🚀 Render Deployment Guide

## Your code has been pushed to GitHub!

Render will automatically deploy the updated backend. Now you need to add the environment variables.

## 📝 Add Environment Variables on Render

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your backend service (rayquiza-backend)
3. Go to **Environment** tab on the left
4. Click **Add Environment Variable**
5. Add the following variables:

### Required Variables

| Key                     | Value                    | Notes                   |
| ----------------------- | ------------------------ | ----------------------- |
| `OPENROUTER_API_KEY`    | `sk-or-v1-your-key-here` | Your OpenRouter API key |
| `AI_MODEL`              | `openai/gpt-4o-mini`     | Recommended model       |
| `ATLAS_URI`             | (existing)               | Your MongoDB connection |
| `DB_NAME`               | `RAYQuizA`               | Database name           |
| `VITE_GOOGLE_CLIENT_ID` | (existing)               | Google OAuth            |

### Optional Variables

| Key            | Value                         | Notes                      |
| -------------- | ----------------------------- | -------------------------- |
| `APP_URL`      | `https://your-app.vercel.app` | Your frontend URL          |
| `PORT`         | `5000`                        | Usually auto-set by Render |
| `CORS_ORIGINS` | `https://your-app.vercel.app` | Your frontend URL          |

## 📋 Step-by-Step

### 1. Add OPENROUTER_API_KEY

```
Key: OPENROUTER_API_KEY
Value: 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
```

### 2. Add AI_MODEL

```
Key: AI_MODEL
Value: openai/gpt-4o-mini
```

### 3. Add APP_URL (Optional)

```
Key: APP_URL
Value: https://your-frontend-url.vercel.app
```

## 🔄 Redeploy

After adding environment variables:

1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait for deployment to complete (~2-3 minutes)
3. Check logs for any errors

## ✅ Verify Deployment

Once deployed, test the API:

```bash
curl -X POST https://rayquiza-backend.onrender.com/api/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Quiz",
    "numQuestions": 2,
    "genre": "Science",
    "difficulty": "easy"
  }'
```

You should get a JSON response with quiz questions.

## 🔍 Check Logs

If something goes wrong:

1. Go to **Logs** tab in Render
2. Look for error messages
3. Check that environment variables are set correctly

## 🎯 Common Issues

### "OPENROUTER_API_KEY is not defined"

- Make sure you added the environment variable
- Click **Manual Deploy** after adding

### "Model not found"

- Use `openai/gpt-4o-mini` (not `openrouter/andromeda-alpha`)
- Check model name spelling

### "Failed to generate quiz"

- Check OpenRouter credits: https://openrouter.ai/credits
- Verify API key is valid: https://openrouter.ai/keys

## 📱 Test from Frontend

Once backend is deployed:

1. Make sure frontend is using correct backend URL
2. Go to Create Quiz page
3. Click "Generate with AI"
4. Fill form and generate!

## 💾 Remember

- ✅ Code is pushed to GitHub
- ⏳ Render will auto-deploy (or click Manual Deploy)
- 🔑 Add OPENROUTER_API_KEY in Render dashboard
- 🤖 Set AI_MODEL to `openai/gpt-4o-mini`
- 📊 Monitor at https://openrouter.ai/activity

## 🆘 Need Help?

- **Render Logs**: Check for deployment errors
- **OpenRouter Activity**: https://openrouter.ai/activity
- **Test Backend**: Use curl command above
- **Check Status**: https://openrouter.ai/status

---

**Next Step**: Add environment variables in Render dashboard and redeploy!
