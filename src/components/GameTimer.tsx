import React from 'react';

interface GameTimerProps {
  gameTime: number;
}

const GameTimer: React.FC<GameTimerProps> = ({ gameTime }) => {
  // Format the game time into minutes and seconds
  const formatGameTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="font-mono font-semibold text-sm">
      {formatGameTime(gameTime)}
    </div>
  );
};

export default GameTimer; 