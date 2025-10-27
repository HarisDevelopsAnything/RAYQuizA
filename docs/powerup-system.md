# Powerup System Documentation

## Overview
The powerup system adds exciting Quizizz-style power-ups to the quiz experience, rewarding fast and accurate players with special abilities they can use during the quiz.

## Powerup Types

### 1. 50-50 (✂️)
- **Color**: Red (#FF6B6B)
- **Effect**: Eliminates 2 incorrect answer options
- **Usage**: Click during a question to remove 2 wrong answers
- **Visual**: Crossed-out options with scissors emoji

### 2. Time Freeze (⏰)
- **Color**: Teal (#4ECDC4)
- **Effect**: Adds 15 extra seconds to the current question
- **Usage**: Click to extend the timer
- **Visual**: Timer extends, notification shown to all players

### 3. Double Points (⭐)
- **Color**: Yellow (#FFD93D)
- **Effect**: Earn 2x points for the current question
- **Usage**: Activate before answering to double your points
- **Visual**: Badge displayed showing active effect

### 4. Shield (🛡️)
- **Color**: Mint (#95E1D3)
- **Effect**: Protects from negative points on the current question
- **Usage**: Activate before answering for protection
- **Visual**: Badge displayed showing active effect

## How to Earn Powerups

Players earn powerups by:
1. **Answering 2 consecutive questions correctly**
2. **Both answers must be within 10% of the time limit** (Lightning Fast ⚡)

When these conditions are met:
- A random powerup is granted
- A celebration animation plays
- The powerup appears in the player's powerup bar

## Powerup Bar

### Location
- **Desktop**: Top-right corner of the screen
- **Mobile**: Bottom center above the quiz controls

### Capacity
- Maximum 3 powerups at once
- When a 4th powerup is earned, the oldest is replaced (FIFO)

### Visual Design
- Glassmorphic container with dark background
- Each powerup slot shows:
  - Icon (emoji)
  - Name
  - Colored gradient background
  - Shimmer animation effect
- Empty slots show lock icons

### Animations
- **Slide In**: New powerups slide in from the right with bounce
- **Activation**: Powerup scales up and spins out when used
- **Hover**: Scale up and lift effect on desktop

## Grant Animation

When a powerup is earned:
1. **Celebration overlay** fills the screen
2. **Large powerup icon** pulses in the center
3. **"POWERUP!" text** with gradient background
4. **30 colorful particles** explode outward
5. **2-second animation** before sliding to powerup bar
6. **Optional audio** plays (powerup-grant.mp3)

## Technical Implementation

### Server-Side (socket-server.js)

#### Tracking Eligibility
```javascript
// Each player has a powerupStats entry
powerupStats: Map<userId, { fastCorrectStreak: number }>

// When player answers correctly within 10% time:
stats.fastCorrectStreak++

// When streak reaches 2:
grantRandomPowerup(lobby, userId)
stats.fastCorrectStreak = 0 // Reset
```

#### Powerup Storage
```javascript
// Each player's powerups
playerPowerups: Map<userId, Powerup[]>

// Active effects for current question
activePowerupEffects: Map<userId, {
  doublePoints?: boolean,
  shield?: boolean
}>
```

#### Applying Effects
- **50-50**: Send eliminated option indices to client
- **Time Freeze**: Extend questionEndsAt by 15 seconds
- **Double Points**: Set flag, multiply score by 2 in finalizeQuestion
- **Shield**: Set flag, ignore negative points in finalizeQuestion

### Client-Side (LiveQuiz.tsx)

#### State Management
```typescript
const [playerPowerups, setPlayerPowerups] = useState<Powerup[]>([]);
const [showPowerupGrant, setShowPowerupGrant] = useState<Powerup | null>(null);
const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
const [activePowerupEffects, setActivePowerupEffects] = useState<{
  doublePoints?: boolean;
  shield?: boolean;
}>({});
```

#### Socket Events
- `powerups-sync`: Initial powerup state when joining
- `powerup-granted`: New powerup earned, show animation
- `powerup-used`: Powerup activated, apply effects
- `powerup-use-rejected`: Invalid usage attempt
- `time-extended`: Another player used Time Freeze

#### Usage Flow
1. Player clicks powerup in PowerupBar
2. `handleUsePowerup` validates phase and submission state
3. Emit `use-powerup` to server with powerupId and type
4. Server validates and applies effect
5. Server emits `powerup-used` back to client
6. Client updates UI (eliminates options, shows badges, etc.)

### Components

#### PowerupBar.tsx
- Displays up to 3 powerup slots
- Handles click events
- Shows tooltips with powerup descriptions
- Manages slot animations

#### PowerupGrantAnimation.tsx
- Full-screen overlay animation
- Particle effects system
- 2-second duration
- Calls onComplete when finished

#### QuizOps.tsx (Updated)
- Accepts `eliminatedOptions` prop
- Disables eliminated option buttons
- Shows scissors emoji on eliminated options
- Applies `.eliminated` CSS class

## Styling

### PowerupBar.css
- Glassmorphic design with backdrop blur
- Smooth slide-in animations
- Shimmer effect on powerup buttons
- Hover effects (scale, lift, glow)
- Responsive breakpoints for mobile
- Celebration particles with random trajectories

### QuizOps.css (Updated)
- `.eliminated` class for crossed-out options
- Gray, semi-transparent background
- Line-through text decoration
- Large scissors emoji overlay
- Disabled cursor

## Game Balance

### Earning Rate
- Requires 2 consecutive fast correct answers
- "Fast" = within 10% of time limit (2.0x time bonus)
- Average: ~1 powerup every 2-3 questions for skilled players
- Random powerup selection ensures variety

### Usage Strategy
- **50-50**: Best for difficult questions
- **Time Freeze**: Use when running out of time
- **Double Points**: Save for high-value questions
- **Shield**: Use on risky questions with negative points

### Fair Play
- Powerups earned individually (no team sharing)
- Cannot use after submitting answer
- Only usable during question phase
- Limited capacity encourages strategic usage

## Mobile Optimization

### Responsive Design
- Powerup bar repositions to bottom-center on mobile
- Smaller powerup icons and text
- Touch-optimized button sizes
- Simplified animations for performance
- Grant animation scales appropriately

### Performance
- CSS animations (GPU-accelerated)
- Minimal JavaScript calculations
- Efficient socket event handling
- No impact on question loading

## Future Enhancements

### Potential Additions
1. **Sound Effects**: Add audio for powerup grant and usage
2. **Streak Display**: Show current fast-answer streak
3. **Powerup Store**: Earn points to buy specific powerups
4. **Rarity System**: Common, rare, legendary powerups
5. **Combo Effects**: Use multiple powerups together
6. **Powerup Trading**: Share powerups with teammates
7. **Statistics**: Track powerup usage in quiz history

### Advanced Features
- **Smart 50-50**: Eliminate specific wrong answers
- **Rewind**: Undo last answer
- **Peek**: See what others answered
- **Multiplier Chain**: Increase multiplier with streak
- **Team Powerups**: Affect all team members

## Testing Checklist

- [ ] Powerups grant after 2 fast correct answers
- [ ] Maximum 3 powerups maintained (FIFO)
- [ ] 50-50 eliminates exactly 2 wrong options
- [ ] Time Freeze adds 15 seconds correctly
- [ ] Double Points multiplies score by 2
- [ ] Shield blocks negative points
- [ ] Grant animation plays smoothly
- [ ] PowerupBar displays correctly on desktop/mobile
- [ ] Cannot use powerups after submitting
- [ ] Cannot use powerups outside question phase
- [ ] Powerups sync when rejoining quiz
- [ ] Effects reset between questions

## Known Limitations

1. **No persistence**: Powerups reset if player disconnects
2. **Single use**: Each powerup can only be used once
3. **Question-scoped**: Effects don't carry to next question
4. **Random grant**: Cannot choose which powerup to receive
5. **Fixed capacity**: Always exactly 3 slots

## API Reference

### Server Socket Events

#### Emitted by Server
```typescript
// Sync powerups when player joins
socket.emit('powerups-sync', { powerups: Powerup[] })

// Grant new powerup
socket.emit('powerup-granted', { 
  powerup: Powerup, 
  allPowerups: Powerup[] 
})

// Powerup successfully used
socket.emit('powerup-used', { 
  powerupId: string, 
  type: PowerupType, 
  effect: any 
})

// Powerup usage rejected
socket.emit('powerup-use-rejected', { reason: string })

// Time extended by another player
io.to(quizCode).emit('time-extended', { 
  userId: string, 
  playerName: string, 
  newEndsAt: number 
})
```

#### Received by Server
```typescript
// Use a powerup
socket.emit('use-powerup', { 
  powerupId: string, 
  powerupType: PowerupType 
})
```

### Data Types

```typescript
type PowerupType = '50-50' | 'time-freeze' | 'double-points' | 'shield';

interface Powerup {
  id: string;
  type: PowerupType;
  name: string;
  description: string;
  icon: string;
  color: string;
  grantedAt: number;
}
```

## Conclusion

The powerup system adds an exciting layer of strategy and reward to the quiz experience, encouraging players to answer quickly and accurately while providing fun abilities that can help them succeed. The visual feedback and animations make earning and using powerups feel satisfying and impactful.
