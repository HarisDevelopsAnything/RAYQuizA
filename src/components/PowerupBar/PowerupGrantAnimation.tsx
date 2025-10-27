import { useEffect, useState } from 'react';
import { Portal } from '@chakra-ui/react';
import type { Powerup } from '@/types/powerups';
import './PowerupBar.css';

interface PowerupGrantAnimationProps {
  powerup: Powerup;
  onComplete: () => void;
}

const PowerupGrantAnimation = ({ powerup, onComplete }: PowerupGrantAnimationProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; tx: number; ty: number; color: string }>>([]);

  useEffect(() => {
    // Create celebration particles
    const particleArray = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      tx: (Math.random() - 0.5) * 400,
      ty: (Math.random() - 0.5) * 400,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    }));
    setParticles(particleArray);

    // Complete animation after duration
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Portal>
      <div className="powerup-grant-overlay">
        <div className="powerup-grant-animation">
          <div 
            className="powerup-grant-content"
            style={{
              background: `linear-gradient(135deg, ${powerup.color}dd, ${powerup.color}99)`,
            }}
          >
            <div className="powerup-grant-icon">{powerup.icon}</div>
            <div className="powerup-grant-text">POWERUP!</div>
            <div className="powerup-grant-subtext">{powerup.name}</div>
            <div className="powerup-grant-subtext" style={{ fontSize: '14px', marginTop: '4px' }}>
              {powerup.description}
            </div>
          </div>
        </div>
        
        {/* Celebration particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="celebration-particle"
            style={{
              left: '50%',
              top: '50%',
              backgroundColor: particle.color,
              '--tx': `${particle.tx}px`,
              '--ty': `${particle.ty}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </Portal>
  );
};

export default PowerupGrantAnimation;
