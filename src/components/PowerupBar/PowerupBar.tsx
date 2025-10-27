import { useState } from 'react';
import type { Powerup } from '@/types/powerups';
import { MAX_POWERUPS } from '@/types/powerups';
import './PowerupBar.css';
import { Box, HStack } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';

interface PowerupBarProps {
  powerups: Powerup[];
  onUsePowerup: (powerupId: string) => void;
  disabled?: boolean;
}

const PowerupBar = ({ powerups, onUsePowerup, disabled = false }: PowerupBarProps) => {
  const [selectedPowerupId, setSelectedPowerupId] = useState<string | null>(null);

  const handlePowerupClick = (powerup: Powerup) => {
    if (disabled) return;
    setSelectedPowerupId(powerup.id);
    onUsePowerup(powerup.id);
    
    // Clear selection after animation
    setTimeout(() => {
      setSelectedPowerupId(null);
    }, 500);
  };

  // Create placeholder slots for empty positions
  const slots = Array.from({ length: MAX_POWERUPS }, (_, index) => {
    const powerup = powerups[index];
    return { index, powerup };
  });

  return (
    <Box className="powerup-bar-container">
      <HStack gap={3} className="powerup-bar">
        {slots.map(({ index, powerup }) => (
          <div
            key={powerup?.id || `slot-${index}`}
            className={`powerup-slot ${powerup ? 'filled' : 'empty'} ${
              powerup && selectedPowerupId === powerup.id ? 'activating' : ''
            }`}
          >
            {powerup ? (
              <Tooltip
                content={
                  <Box textAlign="center">
                    <Box fontWeight="bold">{powerup.name}</Box>
                    <Box fontSize="sm">{powerup.description}</Box>
                  </Box>
                }
              >
                <button
                  className="powerup-button"
                  onClick={() => handlePowerupClick(powerup)}
                  disabled={disabled}
                  style={{
                    background: `linear-gradient(135deg, ${powerup.color}dd, ${powerup.color}99)`,
                    borderColor: powerup.color,
                  }}
                >
                  <span className="powerup-icon">{powerup.icon}</span>
                  <span className="powerup-name">{powerup.name}</span>
                </button>
              </Tooltip>
            ) : (
              <div className="powerup-empty-slot">
                <span className="empty-icon">🔒</span>
              </div>
            )}
          </div>
        ))}
      </HStack>
    </Box>
  );
};

export default PowerupBar;
