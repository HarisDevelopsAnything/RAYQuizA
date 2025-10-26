# Quiz Presenter Mode Documentation

## Overview
Quiz Presenter Mode is a special presentation feature designed for live events, classrooms, and conferences where quizzes need to be displayed on projectors or large screens. This is a single-player, non-competitive mode where the presenter can click through answers to reveal correct/incorrect options without time pressure.

## Purpose
- **Events**: Display quiz questions on projectors for live audiences
- **Classrooms**: Teachers can use it for interactive lessons
- **Demonstrations**: Show quiz content without requiring multiplayer setup
- **Practice**: Review quiz questions and answers without hosting a live game

## Key Features

### 1. **Interactive Answer Revelation**
- Click on any answer option to check if it's correct
- **Wrong answers**: Turn red with shake animation
- **Correct answers**: Turn green with pulse animation
- Can click multiple wrong answers before finding the correct one
- Once correct answer is found, other options are disabled

### 2. **No Time Pressure**
- No countdown timers
- No score tracking
- Focus is on learning and presentation
- Presenter controls the pace completely

### 3. **Large, Projector-Friendly UI**
- Extra large fonts (3xl headings, 2xl options)
- High contrast colors for visibility from distance
- Clean, minimal design
- Optimized for 1920px+ displays
- Responsive design for various screen sizes

### 4. **Navigation Controls**
- **Previous Button**: Go back to previous questions
- **Next Button**: Advance to next question (only enabled after correct answer)
- **Exit Button**: Return to home page
- **Finish Button**: Appears on last question

### 5. **Visual Feedback**
- Question counter badge (e.g., "Question 3 of 10")
- Points display for each question
- "Multiple Answers" badge when applicable
- Success message when correct answer is clicked
- Smooth animations for state changes

## User Flow

### Starting Presenter Mode
1. User navigates to "My Quizzes" page
2. Each quiz card shows a "Present" button (purple, with TV icon)
3. Click "Present" to enter presenter mode
4. See quiz title, description, and question count
5. Click "Start Presentation" to begin

### During Presentation
1. **Question Display**:
   - Large heading shows the question text
   - Image displayed if question type is "image"
   - Badge indicates if multiple answers are required
   - Points value shown in header

2. **Answer Options**:
   - 2-column grid layout (1 column on mobile)
   - Each option has a letter badge (A, B, C, D)
   - Options start with outline style (neutral)

3. **Clicking Answers**:
   - Click wrong answer → turns red, shakes
   - Can click other options
   - Click correct answer → turns green, pulses
   - Success message appears: "✓ Correct! Click Next to continue"
   - Next button becomes enabled

4. **Navigation**:
   - Click "Previous" to review earlier questions (resets answer state)
   - Click "Next" to advance to next question
   - Last question shows "Finish" button
   - Click "Exit" anytime to return home

### Ending Presentation
- Click "Finish" on last question → returns to home page
- Click "Exit" anytime → returns to home page
- All navigation preserves quiz state in database

## Technical Implementation

### Route
```
/quiz/presenter/:quizId
```

### Components

#### QuizPresenter Component
**Location**: `src/pages/QuizPresenter/QuizPresenter.tsx`

**State Management**:
- `quiz`: Quiz data fetched from API
- `currentQuestionIndex`: Current question number (0-indexed)
- `selectedOptions`: Array of clicked option indices
- `correctAnswered`: Boolean flag when correct answer found
- `started`: Boolean flag for start screen vs. quiz screen

**Key Functions**:
- `fetchQuiz()`: Fetches quiz data by ID from backend
- `handleOptionClick(index)`: Processes answer clicks, checks correctness
- `handleNextQuestion()`: Advances to next question or finishes
- `handlePreviousQuestion()`: Goes back to previous question
- `getOptionState(index)`: Returns "default", "wrong", or "correct"

**API Endpoint Used**:
```
GET https://rayquiza-backend.onrender.com/api/quizzes/:quizId
```

### Styling

#### CSS File
**Location**: `src/pages/QuizPresenter/QuizPresenter.css`

**Key Styles**:
- `.presenter-page`: Full viewport height, responsive padding
- `.presenter-question-box`: Highlighted question container with border
- `.presenter-option`: Answer button with hover effects
- `.presenter-option-wrong`: Red styling with shake animation
- `.presenter-option-correct`: Green styling with pulse animation
- `.presenter-success-message`: Animated success message

**Animations**:
1. **Shake**: Wrong answers shake left-right (0.5s)
2. **Pulse-Green**: Correct answers pulse with glow (0.6s)
3. **SlideUp**: Success message slides up (0.4s)

### QuizCard Integration

#### Updated Props
```typescript
interface Props {
  name: string;
  desc: string;
  duration: string;
  onClickTakeQuiz?: () => void;
  onClickViewDetails?: () => void;
  onClickPresent?: () => void;  // NEW
  onClickDelete?: () => void;
}
```

#### Button Layout
Two-row layout:
- **Row 1**: Host Quiz (solid) | View Details (subtle)
- **Row 2**: Present (purple outline) | Delete (red outline)

Second row only appears if `onClickPresent` or `onClickDelete` provided.

### Routing

#### App.tsx Addition
```tsx
import QuizPresenter from "./pages/QuizPresenter/QuizPresenter";

<Route path="/quiz/presenter/:quizId" element={<QuizPresenter />}></Route>
```

## UI/UX Design Decisions

### Color Coding
- **Purple**: Presenter mode branding (buttons, badges)
- **Red**: Wrong answers and delete actions
- **Green**: Correct answers and success states
- **Accent Color**: Primary action buttons (Host, Start)

### Typography
- **Question**: 3xl heading (very large)
- **Options**: 2xl text (large and readable)
- **Badges**: lg size for visibility
- **Body text**: xl for descriptions

### Accessibility
- High contrast colors
- Large click targets (full-width buttons)
- Clear visual feedback for all actions
- Keyboard navigation support (native button behavior)
- Disabled state for unavailable actions

### Responsive Design
- 2-column grid on desktop (md+)
- 1-column grid on mobile
- Adjusted padding for different screen sizes
- Optimized for projectors (1920px+)

## Differences from Live Quiz Mode

| Feature | Live Quiz Mode | Presenter Mode |
|---------|---------------|----------------|
| **Players** | Multiplayer | Single player |
| **Timer** | Yes, countdown | No timer |
| **Scoring** | Yes, with leaderboard | No scoring |
| **Host** | Host + participants | Just presenter |
| **Answer Locking** | One attempt | Multiple attempts |
| **Pace** | Timer-controlled | Manual control |
| **Purpose** | Competition | Education/Demo |
| **Socket.io** | Required | Not used |
| **Navigation** | Auto-advance | Manual next/previous |

## Use Cases

### 1. **Classroom Teaching**
Teacher projects quiz on board, students shout out answers, teacher clicks to reveal correct answer.

### 2. **Conference/Event Presentation**
Speaker presents quiz questions to audience, takes guesses verbally, clicks through answers for dramatic reveal.

### 3. **Training Sessions**
Trainer uses presenter mode to go through quiz questions step-by-step, explaining each answer.

### 4. **Quiz Review**
Creator reviews their own quiz to check questions and answers before making it live.

### 5. **Demo/Showcase**
Show potential users how quiz questions work without needing multiple players.

## Future Enhancements

### Potential Features
1. **Fullscreen Mode**: F11 or dedicated fullscreen button
2. **Slide Show Mode**: Auto-advance timer option
3. **Audience Response**: QR code for audience to vote (read-only)
4. **Answer Explanations**: Show explanation after correct answer
5. **Notes/Hints**: Presenter notes visible only to presenter
6. **Remote Control**: Control from mobile device
7. **Recording**: Record presentation for later playback
8. **Annotations**: Draw on screen during presentation
9. **Custom Transitions**: Different animation styles
10. **Print Mode**: Generate PDF handout of quiz

## Testing Checklist

- [ ] Present button appears on quiz cards
- [ ] Clicking Present navigates to presenter mode
- [ ] Start screen displays quiz information correctly
- [ ] Questions display with proper formatting
- [ ] Images show correctly for image-type questions
- [ ] Wrong answer clicks turn red and shake
- [ ] Correct answer clicks turn green and pulse
- [ ] Multiple wrong answers can be clicked
- [ ] Correct answer disables other options
- [ ] Next button only enables after correct answer
- [ ] Previous button works correctly
- [ ] Navigation resets answer states
- [ ] Last question shows "Finish" button
- [ ] Finish button returns to home
- [ ] Exit button works from any screen
- [ ] Multiple answer questions marked correctly
- [ ] Responsive layout works on mobile
- [ ] Large fonts readable on projector
- [ ] Animations smooth and not distracting
- [ ] Badge displays update correctly

## Related Files

**Frontend**:
- `src/pages/QuizPresenter/QuizPresenter.tsx` - Main component
- `src/pages/QuizPresenter/QuizPresenter.css` - Styling and animations
- `src/components/home/QuizCard/QuizCard.tsx` - Present button
- `src/pages/Home/Quizzes.tsx` - Navigation to presenter mode
- `src/App.tsx` - Route configuration

**Backend**:
- Uses existing `GET /api/quizzes/:quizId` endpoint
- No new backend changes required

**Dependencies**:
- `react-router-dom` - Navigation and routing
- `@chakra-ui/react` - UI components
- `react-icons/io5` - Icons (IoTvOutline, IoArrowBack, etc.)
- `@/contexts/UserPreferencesContext` - Accent color

## API Usage Example

```typescript
// Fetch quiz for presenter mode
const response = await fetch(
  'https://rayquiza-backend.onrender.com/api/quizzes/507f1f77bcf86cd799439011'
);
const quiz = await response.json();

// Quiz structure:
{
  _id: "507f1f77bcf86cd799439011",
  title: "General Knowledge",
  description: "Test your knowledge",
  code: "ABC123",
  questions: [
    {
      question: "What is the capital of France?",
      type: "text",
      answerType: "single",
      options: ["London", "Paris", "Berlin", "Madrid"],
      correctOption: 1,
      points: 10,
      negativePoints: 0,
      timeLimit: 30
    }
    // ... more questions
  ]
}
```

## Known Limitations

1. **No Offline Mode**: Requires internet connection to fetch quiz
2. **No Auto-Save**: Presentation progress not saved (starts fresh each time)
3. **No Annotations**: Can't draw or highlight on screen
4. **No Answer Explanations**: Would need to add to quiz structure
5. **Limited Multimedia**: Only supports images, no video/audio yet

## Security Considerations

- Uses existing quiz API (read-only)
- No authentication required (quiz is public by ID)
- No data modification possible
- No personal information exposed
- Safe for public demonstrations

---

**Version**: 1.0  
**Last Updated**: October 26, 2025  
**Feature Status**: ✅ Complete and Production Ready
