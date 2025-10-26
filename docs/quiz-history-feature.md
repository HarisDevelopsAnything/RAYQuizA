# Quiz History Feature Documentation

## Overview
The Quiz History feature stores and displays the results of every conducted quiz, including participant names and scores. This feature allows users to review past quiz performances.

## Features

### For Authenticated Users
- **View Created Quizzes**: See results of all quizzes they created
- **View Participated Quizzes**: See results of all quizzes they participated in
- **Detailed Results**: View complete scoreboard with rankings and scores for each quiz

### For Guest Users
- Guest users can participate in quizzes
- Only the quiz creator (host) can see the results of quizzes with guest participants
- Guests are identified by their session-based IDs (e.g., `guest-xyz123`)

## Database Schema

### QuizHistory Collection
```javascript
{
  _id: ObjectId,
  quizCode: String,           // The unique quiz code
  quizTitle: String,          // Title of the quiz
  quizId: ObjectId | null,    // Reference to the original quiz
  creatorEmail: String,       // Email of quiz creator (from quiz.createdByEmail)
  hostEmail: String,          // Email of the host who conducted the quiz
  participants: [
    {
      userId: String,         // User ID or guest ID
      name: String,           // Display name
      email: String | null,   // User email (null for guests)
      score: Number           // Final score
    }
  ],
  completedAt: Date,          // When the quiz was completed
  totalParticipants: Number   // Count of participants
}
```

**Key Points:**
- Uses **email** as the primary identifier for authenticated users
- Guests have `email: null`
- `creatorEmail` comes from the quiz document's `createdByEmail` field
- `hostEmail` is the email of whoever actually hosted/started the quiz session

## API Endpoints

### Get Created Quiz History
```
GET /api/quiz-history/created/:userEmail
```
Returns all quizzes created by the user with the specified email.

**Example:** `GET /api/quiz-history/created/user@example.com`

### Get Participated Quiz History
```
GET /api/quiz-history/participated/:userEmail
```
Returns all quizzes where the user (identified by email) participated.

**Example:** `GET /api/quiz-history/participated/user@example.com`

### Get Specific Quiz History
```
GET /api/quiz-history/:historyId
```
Returns detailed information about a specific quiz history entry.

## Frontend Components

### QuizHistory Page (`src/pages/QuizHistory/QuizHistory.tsx`)
- Two tabs: "Quizzes I Created" and "Quizzes I Participated In"
- Displays quiz cards with:
  - Quiz title and code
  - Completion date and time
  - Full scoreboard with rankings
  - User's personal score highlighted
  - Gold/Silver/Bronze badges for top 3 participants

### Sidebar Integration
- Added "Quiz History" button in the home sidebar
- Navigates to `/quiz-history` route

## Data Flow

1. **Quiz Completion**: When a quiz ends, the `endQuiz` function in `socket-server.js` automatically saves the results to the `QuizHistory` collection
2. **Data Retrieval**: The QuizHistory page fetches data from the API endpoints based on the logged-in user's ID
3. **Display**: Results are displayed in an organized, visually appealing format with rankings and scores

## User Experience

### Authenticated Users
1. Click "Quiz History" in the sidebar
2. View two tabs:
   - **Quizzes I Created**: All quizzes you hosted
   - **Quizzes I Participated In**: All quizzes you joined
3. Each quiz shows:
   - Full participant list ranked by score
   - Your own score highlighted
   - Date/time of completion
   - Quiz code for reference

### Guest Users
- Can participate in quizzes normally
- Results are stored with their guest ID
- Only the quiz creator can view the complete results
- Guests don't have access to the Quiz History page (no authentication)

## Privacy & Security
- Users can only view:
  - Quizzes they created (all participants visible)
  - Quizzes they participated in (all participants visible)
- Guest users are tracked by session-based IDs
- No sensitive user information is exposed

## Styling
- Accent color integration for user preferences
- Responsive card-based layout
- Visual ranking indicators (badges for top 3)
- Smooth hover effects and transitions
- Scrollable participant lists for quizzes with many participants

## Future Enhancements
- Export quiz results to CSV/PDF
- Detailed analytics (average score, completion rate)
- Filter by date range
- Search functionality
- Delete quiz history entries
- Share quiz results with participants
