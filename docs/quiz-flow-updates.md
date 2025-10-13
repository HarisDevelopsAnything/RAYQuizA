# Quiz Flow Updates - Summary

## Changes Made

### 1. Quiz Card Component (`src/components/home/QuizCard/QuizCard.tsx`)

- Changed button text from "Take quiz" to "**Host Quiz**"
- This button is shown on the user's own quiz list

### 2. My Quizzes Page (`src/pages/Home/Quizzes.tsx`)

- When clicking "Host Quiz" on a quiz card, navigates to `/quiz/live/${code}` with `isHost: true`
- Users can now host their own quizzes directly from the quiz list

### 3. Join Code Page (`src/pages/JoinCode/JoinCode.tsx`)

- **Removed** the player/host toggle
- Now **only allows joining as a player** (`isHost: false`)
- Simplified UI with just code input and join button
- For logged-in users, uses their account name automatically

### 4. New Guest Join Page (`src/pages/GuestJoin/GuestJoin.tsx`)

- Created a new guest join flow for non-logged-in users
- Collects:
  - Quiz code (6-digit code)
  - Guest name (shown as "Guest-{name}")
- Stores guest info temporarily in localStorage
- Navigates to live quiz as a player

### 5. Landing Page (`src/pages/Landing/Landing.tsx`)

- Updated "Let's get quizzing!" button to navigate to `/guest-join` instead of `/home`
- Now provides a streamlined guest experience

### 6. Live Quiz Component (`src/pages/QuizPage/LiveQuiz.tsx`)

- Updated to handle guest players properly
- `createPlayerId()` and `createPlayerName()` functions now check for guest info first
- Supports location state with guest information
- Falls back to localStorage for guest sessions

### 7. App Routes (`src/App.tsx`)

- Added new route: `/guest-join` → `<GuestJoin />`

## User Flows

### Flow 1: Logged-in User Hosting Their Quiz

1. User goes to "My Quizzes" page
2. Clicks "Host Quiz" on their quiz card
3. Joins as host with their account name
4. Can control quiz flow (start, advance questions)

### Flow 2: Logged-in User Joining as Player

1. User navigates to `/join` (Join Code page)
2. Enters 6-digit quiz code
3. Joins as player with their account name
4. Can answer questions but cannot control flow

### Flow 3: Guest User Joining

1. Visitor lands on landing page
2. Clicks "Let's get quizzing!"
3. Directed to Guest Join page (`/guest-join`)
4. Enters quiz code and their name
5. Name displayed as "Guest-{name}"
6. Joins as player (cannot host)

## Technical Details

### Guest Player Data Storage

- `guestId`: Unique identifier stored in localStorage
- `guestName`: Display name prefixed with "Guest-"
- Data passed through location state to LiveQuiz component
- Guest info is temporary (localStorage can be cleared)

### Host/Player Distinction

- Hosts can start quiz and advance questions manually
- Players can only submit answers
- First person to join becomes host if `isHost: true` is set
- Host controls are shown/hidden based on socket ID matching
