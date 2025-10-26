# Quiz Features: Auto-Skip & Time-Based Bonus Points

## Overview

Two powerful features have been added to enhance the quiz experience:

1. **Auto-Skip Timer**: When all participants have answered, the timer automatically advances to the next question
2. **Time-Based Bonus Points**: Players earn bonus points based on how quickly they answer correctly

---

## Feature 1: Auto-Skip Timer

### How It Works

When a quiz is in progress and a question is active:
- The system tracks how many participants have submitted answers
- When **ALL participants** have answered, the timer is automatically skipped
- A 1-second grace period is added so everyone sees their answer was submitted
- The question then immediately advances to the review phase

### Benefits
- ⚡ Faster quiz pace when everyone is ready
- 📱 Better experience for quick participants
- 🎯 No more waiting for the full timer when everyone has answered
- 🎮 More engaging and dynamic gameplay

### Implementation Details

**Backend (`server/socket-server.js`):**
```javascript
// In the submit-answer handler
const totalParticipants = lobby.participants.size;
const totalAnswered = lobby.answers.size;

if (totalAnswered === totalParticipants && totalParticipants > 0) {
  clearTimers(lobby);
  // 1-second delay for user feedback
  lobby.advanceTimer = setTimeout(() => {
    finalizeQuestion(io, normalizedCode, lobby);
  }, 1000);
}
```

### Edge Cases Handled
- ✅ Works with any number of participants (2+)
- ✅ Only triggers when 100% of participants have answered
- ✅ Prevents race conditions with proper timer management
- ✅ Maintains existing host "Next Question" functionality

---

## Feature 2: Time-Based Bonus Points

### Scoring System

Players who answer **correctly** earn bonus points based on their speed:

| Time Used | Multiplier | Icon | Description |
|-----------|-----------|------|-------------|
| **≤ 10%** of time limit | **2.0x** | ⚡ | Lightning Fast! |
| **≤ 25%** of time limit | **1.75x** | 🔥 | Super Quick! |
| **≤ 50%** of time limit | **1.5x** | ⭐ | Nice Speed! |
| **> 50%** of time limit | **1.0x** | ✓ | Good Job! |

### Example Calculations

**Question: 30 seconds, 10 points**

- Answer in **3 seconds** (10% of 30s): `10 × 2.0 = 20 points` ⚡
- Answer in **7 seconds** (23% of 30s): `10 × 1.75 = 17.5 points` 🔥
- Answer in **14 seconds** (47% of 30s): `10 × 1.5 = 15 points` ⭐
- Answer in **20 seconds** (67% of 30s): `10 × 1.0 = 10 points` ✓

### Implementation Details

**Backend Calculation (`server/socket-server.js`):**

```javascript
const calculateTimeBonus = (timeLimit, timeTaken) => {
  const percentage = (timeTaken / timeLimit) * 100;
  
  if (percentage <= 10) return 2.0;      // Within 10%
  if (percentage <= 25) return 1.75;     // Within 25%
  if (percentage <= 50) return 1.5;      // Within 50%
  return 1.0;                            // Else
};

// In finalizeQuestion
const timeTaken = (answerRecord.submittedAt - questionStartTime) / 1000;
const timeBonus = calculateTimeBonus(timeLimit, timeTaken);
const gained = points * timeBonus;
```

**Frontend Display (`src/pages/QuizPage/LiveQuiz.tsx`):**

The review panel shows:
- Total points earned with bonus
- Speed bonus multiplier
- Visual indicators (⚡🔥⭐) next to player names
- Detailed breakdown in the summary

### Benefits
- 🏆 Rewards quick thinkers
- 🎯 Adds strategic depth to gameplay
- 📊 More varied scoring outcomes
- 🎮 Encourages engagement and focus

### Important Notes

1. **Only for Correct Answers**: Time bonus only applies when the answer is correct
2. **Negative Points**: Time bonus does NOT apply to negative points (wrong answers)
3. **Decimal Precision**: Scores are shown with 2 decimal places for accuracy
4. **Tracked Server-Side**: Times are recorded when answers are submitted to prevent cheating

---

## Visual Indicators

### In Review Panel

After each question, players see:

```
Nice! You earned 17.50 points (1.75x speed bonus!).
🔥 Speed Bonus: Super Quick! (within 25%)
```

### In Summary List

```
Player Name 🔥     +17.50
Another Player     +10.00
```

Speed icons appear next to names for quick visual feedback:
- ⚡ = 2.0x multiplier
- 🔥 = 1.75x multiplier  
- ⭐ = 1.5x multiplier
- (no icon) = 1.0x multiplier

---

## Database Storage

Quiz history now includes time bonus information:

```json
{
  "participants": [
    {
      "userId": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "score": 87.50
    }
  ]
}
```

The summary sent during `question-ended` event includes:

```javascript
{
  userId: "user123",
  name: "John Doe",
  selected: [1, 2],
  isCorrect: true,
  gained: 17.50,
  timeBonus: 1.75  // Only present for correct answers
}
```

---

## Configuration

### Time Bonus Thresholds

To modify the time bonus thresholds, edit `server/socket-server.js`:

```javascript
const calculateTimeBonus = (timeLimit, timeTaken) => {
  const percentage = (timeTaken / timeLimit) * 100;
  
  if (percentage <= 10) return 2.0;    // Change these values
  if (percentage <= 25) return 1.75;   // to adjust thresholds
  if (percentage <= 50) return 1.5;    // and multipliers
  return 1.0;
};
```

### Auto-Skip Delay

To change the grace period before auto-advancing:

```javascript
// In the submit-answer handler
lobby.advanceTimer = setTimeout(() => {
  finalizeQuestion(io, normalizedCode, lobby);
}, 1000); // Change 1000 to desired milliseconds
```

---

## Testing Checklist

### Auto-Skip Timer
- [ ] Create quiz with 2+ participants
- [ ] Start quiz
- [ ] Have all participants answer quickly
- [ ] Verify timer skips automatically after last answer
- [ ] Check 1-second grace period is observed
- [ ] Test with different participant counts (2, 3, 5, 10+)

### Time Bonus
- [ ] Answer within 10% of time - verify 2.0x multiplier
- [ ] Answer within 25% of time - verify 1.75x multiplier
- [ ] Answer within 50% of time - verify 1.5x multiplier
- [ ] Answer after 50% of time - verify 1.0x multiplier
- [ ] Verify wrong answers don't get time bonus
- [ ] Check decimal points display correctly
- [ ] Verify icons appear correctly in summary
- [ ] Test with different time limits (5s, 15s, 30s, 60s)

### Edge Cases
- [ ] Single participant (auto-skip should work)
- [ ] Participant disconnects mid-question
- [ ] Host manually skips before everyone answers
- [ ] Very quick answers (< 1 second)
- [ ] Answers at exactly the time thresholds

---

## Known Limitations

1. **Minimum Participants**: Auto-skip requires at least 1 participant
2. **Guest Tracking**: Time bonuses work for guests but aren't persisted long-term
3. **Network Latency**: Server timestamps are used, but network delays may affect perceived speed
4. **Decimal Display**: Scores may show trailing decimals (e.g., 10.00 instead of 10)

---

## Future Enhancements

- [ ] Add time bonus statistics to quiz history
- [ ] Show average response time per question
- [ ] Add "fastest answer" achievements
- [ ] Configurable time bonus thresholds per quiz
- [ ] Time bonus leaderboard
- [ ] Streak bonuses for consecutive quick answers
- [ ] Visual countdown showing bonus zones

---

## Technical Details

### Files Modified

**Backend:**
- `server/socket-server.js`
  - Added `calculateTimeBonus()` function
  - Modified `startQuestion()` to track `questionStartTime`
  - Updated `finalizeQuestion()` to calculate time-based scores
  - Enhanced `submit-answer` handler for auto-skip detection

**Frontend:**
- `src/pages/QuizPage/LiveQuiz.tsx`
  - Updated `QuestionSummary` interface to include `timeBonus`
  - Modified answer feedback state to include `timeBonus`
  - Enhanced review panel to display bonus information
  - Added visual indicators (emojis) for speed levels

### Performance Considerations

- ✅ Minimal overhead (simple arithmetic calculations)
- ✅ No additional database queries
- ✅ Server-side timing prevents client-side manipulation
- ✅ Auto-skip reduces average quiz duration
- ✅ Timer cleanup prevents memory leaks

---

## Support

If you encounter issues:

1. Check server console for auto-skip messages
2. Verify all participants are connected
3. Check network latency doesn't exceed grace period
4. Review browser console for frontend errors
5. Test with different time limits and participant counts

---

**These features make quizzes more dynamic, rewarding, and engaging! 🎉**
