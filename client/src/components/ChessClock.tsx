import { useEffect, useState } from 'react';

interface ChessClockProps {
  initialTime: number; // in seconds
  increment: number; // in seconds
  isActive: boolean;
  onTimeUp: () => void;
  playerColor: 'white' | 'black';
}

export const ChessClock: React.FC<ChessClockProps> = ({
  initialTime,
  increment,
  isActive,
  onTimeUp,
  playerColor
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 30;
  const isVeryLowTime = timeLeft <= 10;

  return (
    <div 
      className={`chess-clock ${isActive ? 'active' : ''} ${isLowTime ? 'low-time' : ''} ${isVeryLowTime ? 'very-low-time' : ''}`}
      style={{
        backgroundColor: isActive ? '#667eea' : '#f0f0f0',
        color: isActive ? 'white' : '#333',
        padding: '10px 18px',
        borderRadius: '8px',
        fontSize: '20px',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        textAlign: 'center',
        minWidth: '95px',
        boxShadow: isActive ? '0 3px 12px rgba(102, 126, 234, 0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        border: isActive ? '2px solid #fff' : '2px solid transparent',
        animation: isVeryLowTime && isActive ? 'pulse 0.5s infinite' : 'none'
      }}
    >
      <div style={{ fontSize: '10px', marginBottom: '3px', opacity: 0.8, fontWeight: 'normal' }}>
        {playerColor === 'white' ? '⬜ White' : '⬛ Black'}
      </div>
      <div>{formatTime(timeLeft)}</div>
      {increment > 0 && (
        <div style={{ fontSize: '10px', marginTop: '3px', opacity: 0.7, fontWeight: 'normal' }}>
          +{increment}s
        </div>
      )}
    </div>
  );
};
