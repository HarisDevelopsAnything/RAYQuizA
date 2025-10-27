// Powerup system types and definitions

export type PowerupType = '50-50' | 'time-freeze' | 'double-points' | 'shield';

export interface Powerup {
  id: string;
  type: PowerupType;
  name: string;
  description: string;
  icon: string;
  color: string;
  grantedAt: number;
}

export interface PowerupDefinition {
  type: PowerupType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const POWERUP_DEFINITIONS: Record<PowerupType, PowerupDefinition> = {
  '50-50': {
    type: '50-50',
    name: '50-50',
    description: 'Eliminate 2 incorrect answers',
    icon: '✂️',
    color: '#FF6B6B',
  },
  'time-freeze': {
    type: 'time-freeze',
    name: 'Time Freeze',
    description: 'Get 15 extra seconds',
    icon: '⏰',
    color: '#4ECDC4',
  },
  'double-points': {
    type: 'double-points',
    name: 'Double Points',
    description: 'Earn 2x points for this question',
    icon: '⭐',
    color: '#FFD93D',
  },
  'shield': {
    type: 'shield',
    name: 'Shield',
    description: 'Protect from negative points',
    icon: '🛡️',
    color: '#95E1D3',
  },
};

export const MAX_POWERUPS = 3;
export const POWERUP_GRANT_THRESHOLD = 2; // Consecutive correct fast answers needed
