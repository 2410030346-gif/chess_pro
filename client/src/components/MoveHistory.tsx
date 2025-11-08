import { useEffect, useRef } from 'react';

interface MoveHistoryProps {
  moves: string[];
  currentMoveIndex?: number;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, currentMoveIndex }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest move
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Scroll to bottom of the container smoothly
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [moves.length]);

  // Group moves into pairs (white, black)
  const movePairs: Array<[string, string?]> = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push([moves[i], moves[i + 1]]);
  }

  return (
    <div
      ref={scrollContainerRef}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        borderRadius: '12px',
        maxHeight: '300px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '15px', 
        color: '#ffffff',
        fontSize: '18px',
        fontWeight: '600',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
      }}>
        📜 Move History
      </h3>
      {movePairs.length === 0 ? (
        <p style={{ 
          color: '#e0e0e0', 
          fontSize: '14px',
          fontStyle: 'italic' 
        }}>
          No moves yet
        </p>
      ) : (
        <div>
          {movePairs.map((pair, index) => (
            <div 
              key={index}
              style={{ 
                marginBottom: '8px',
                padding: '8px 10px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ 
                fontWeight: 'bold', 
                marginRight: '12px',
                color: '#ffd700',
                fontSize: '14px'
              }}>
                {index + 1}.
              </span>
              <span
                style={{
                  marginRight: '15px',
                  backgroundColor: currentMoveIndex === index * 2 ? '#ffeb3b' : 'rgba(255, 255, 255, 0.9)',
                  color: currentMoveIndex === index * 2 ? '#000' : '#333',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: '500',
                  fontSize: '14px',
                  display: 'inline-block',
                  minWidth: '50px',
                  textAlign: 'center'
                }}
              >
                {pair[0]}
              </span>
              {pair[1] && (
                <span
                  style={{
                    backgroundColor: currentMoveIndex === index * 2 + 1 ? '#ffeb3b' : 'rgba(255, 255, 255, 0.9)',
                    color: currentMoveIndex === index * 2 + 1 ? '#000' : '#333',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: '500',
                    fontSize: '14px',
                    display: 'inline-block',
                    minWidth: '50px',
                    textAlign: 'center'
                  }}
                >
                  {pair[1]}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
