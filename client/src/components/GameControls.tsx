interface GameControlsProps {
  onNewGame: () => void;
  onUndo?: () => void;
  onResign?: () => void;
  gameStatus: string;
  canUndo?: boolean;
  showMultiplayerControls?: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onUndo,
  onResign,
  gameStatus,
  canUndo = true,
  showMultiplayerControls = false,
}) => {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 242, 245, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '15px',
        border: '2px solid rgba(102, 126, 234, 0.2)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '15px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '1.3rem',
        fontWeight: '700',
      }}>
        📊 Game Status
      </h3>
      <p
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '15px',
          color: gameStatus.includes('wins') || gameStatus.includes('Checkmate') ? '#4caf50' : '#333',
          padding: '12px',
          background: 'rgba(102, 126, 234, 0.05)',
          borderRadius: '8px',
          borderLeft: '4px solid #667eea',
        }}
      >
        {gameStatus}
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={onNewGame}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
          }}
        >
          🔄 New Game
        </button>

        {onUndo && canUndo && !showMultiplayerControls && (
          <button
            onClick={onUndo}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 152, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 152, 0, 0.3)';
            }}
          >
            ↩️ Undo
          </button>
        )}

        {onResign && showMultiplayerControls && (
          <button
            onClick={onResign}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(244, 67, 54, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.3)';
            }}
          >
            🏳️ Resign
          </button>
        )}
      </div>
    </div>
  );
};
