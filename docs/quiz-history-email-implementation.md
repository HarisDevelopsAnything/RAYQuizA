# Quiz History Feature - Email-Based Implementation

## Summary of Changes

This implementation uses **email addresses** as the primary identifier for tracking quiz history, which is more reliable and user-friendly than database IDs.

## Files Modified

### Backend Files

1. **`server/socket-server.js`**
   - Modified `join-lobby` handler to capture participant emails
   - Updated `endQuiz` function to save quiz history with emails
   - Stores `creatorEmail` and `hostEmail` instead of user IDs
   - Participants array includes email field (null for guests)

2. **`server/index.js`**
   - Updated API routes to use email as parameter
   - `GET /api/quiz-history/created/:userEmail` - Fetch quizzes by creator email
   - `GET /api/quiz-history/participated/:userEmail` - Fetch quizzes by participant email
   - Added URL decoding for email parameters
   - Added console logging for debugging

### Frontend Files

1. **`src/pages/QuizHistory/QuizHistory.tsx`**
   - Updated to fetch history using user email instead of ID
   - Uses hardcoded backend URL: `https://rayquiza-backend.onrender.com`
   - Updated TypeScript interfaces to include email field
   - Modified rendering to identify current user by email
   - Shows "(Guest)" label for participants without emails
   - Added error handling and logging

2. **`src/pages/QuizPage/LiveQuiz.tsx`**
   - Added `getPlayerEmail()` function to extract email from localStorage
   - Added `playerEmailRef` to store user email
   - Modified socket emit to include email in player object
   - Email is sent as `undefined` for guest users

3. **`src/pages/Home/Sidebar/Sidebar.tsx`**
   - Added "Quiz History" button to sidebar navigation
   - Button navigates to `/quiz-history` route

4. **`src/App.tsx`**
   - Added route for Quiz History page: `/quiz-history`

### New Files

1. **`src/pages/QuizHistory/QuizHistory.tsx`** - Quiz history page component
2. **`src/pages/QuizHistory/QuizHistory.css`** - Styling for quiz history
3. **`docs/quiz-history-feature.md`** - Feature documentation

## How It Works

### Data Flow

1. **User Joins Quiz:**
   - Frontend reads user data from localStorage
   - Extracts email if user is authenticated
   - Sends email along with player info via socket

2. **Quiz Session:**
   - Backend stores participant data including emails
   - Scoreboard entries include email field
   - Host email is tracked separately

3. **Quiz Completion:**
   - `endQuiz` function triggers
   - Quiz history document created with:
     - Creator email (from quiz.createdByEmail)
     - Host email (from current host participant)
     - All participants with names, emails, and scores
   - Saved to MongoDB QuizHistory collection

4. **Viewing History:**
   - User opens Quiz History page
   - Frontend reads user email from localStorage
   - Makes API calls to fetch created/participated quizzes
   - Displays results with rankings and scores

## Why Email Instead of ID?

### Advantages:
- ✅ **Uniquely Identifiable**: Email is guaranteed unique per user
- ✅ **Consistent Across Auth Methods**: Same email for Google & email/password login
- ✅ **Human Readable**: Easy to debug and query in database
- ✅ **Privacy Safe**: Users control their own email
- ✅ **No ID Confusion**: Avoids issues with _id, googleId, userId variations

### Guest Handling:
- Guests have `email: null` in the database
- They can participate but can't view history (no login)
- Only quiz creators see full results including guests
- Identified by guest IDs like `guest-abc123`

## API Endpoints

### Created Quizzes
```
GET https://rayquiza-backend.onrender.com/api/quiz-history/created/{email}
```

Example: `/api/quiz-history/created/user@example.com`

### Participated Quizzes
```
GET https://rayquiza-backend.onrender.com/api/quiz-history/participated/{email}
```

Example: `/api/quiz-history/participated/user@example.com`

## Database Query Examples

### Find all quizzes created by a user:
```javascript
db.QuizHistory.find({ 
  creatorEmail: "user@example.com" 
})
```

### Find all quizzes a user participated in:
```javascript
db.QuizHistory.find({ 
  "participants.email": "user@example.com" 
})
```

### Sample Document:
```json
{
  "_id": ObjectId("..."),
  "quizCode": "ABC123",
  "quizTitle": "Science Quiz",
  "quizId": ObjectId("..."),
  "creatorEmail": "teacher@school.com",
  "hostEmail": "teacher@school.com",
  "participants": [
    {
      "userId": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "score": 85
    },
    {
      "userId": "guest-xyz789",
      "name": "Guest Player",
      "email": null,
      "score": 60
    }
  ],
  "completedAt": ISODate("2025-10-26T..."),
  "totalParticipants": 2
}
```

## Testing Checklist

- [ ] Create a quiz as authenticated user
- [ ] Complete the quiz with multiple participants (some authenticated, some guests)
- [ ] Check MongoDB QuizHistory collection for new entry
- [ ] Verify creator email is stored correctly
- [ ] Verify participant emails are stored (null for guests)
- [ ] Open Quiz History page
- [ ] Check "Quizzes I Created" tab shows the quiz
- [ ] Check "Quizzes I Participated In" tab shows the quiz
- [ ] Verify scores and rankings are correct
- [ ] Verify "You" label appears on your entry
- [ ] Verify "(Guest)" label appears on guest entries

## Troubleshooting

### Network Error
- Check backend is running: `https://rayquiza-backend.onrender.com/health`
- Check CORS settings in server/index.js
- Check browser console for detailed error messages

### No History Showing
- Open browser console and check for errors
- Verify user email in localStorage: `localStorage.getItem('user')`
- Check backend logs for quiz history save operations
- Query MongoDB directly to verify data exists

### Email Not Saved
- Verify user object has email field in localStorage
- Check socket connection in browser Network tab
- Verify backend logs show email being received
- Check MongoDB document structure

## Future Improvements

- Add pagination for large history lists
- Export results to CSV/PDF
- Detailed analytics and charts
- Filter by date range
- Search functionality
- Share quiz results
- Delete old history entries
