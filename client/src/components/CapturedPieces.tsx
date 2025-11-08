import React from 'react';

interface CapturedPiecesProps {
  captured: string[]; // Array of captured piece types (e.g., ['p', 'n', 'b'])
  color: 'white' | 'black';
}

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ captured, color }) => {
  const pieceSymbols: { [key: string]: string } = {
    'p': '♙',
    'n': '♘',
    'b': '♗',
    'r': '♖',
    'q': '♕',
    'k': '♔'
  };

  const pieceValues: { [key: string]: number } = {
    'p': 1,
    'n': 3,
    'b': 3,
    'r': 5,
    'q': 9,
    'k': 0
  };

  // Calculate material advantage
  const materialValue = captured.reduce((sum, piece) => sum + (pieceValues[piece] || 0), 0);

  // Sort pieces by value (highest first)
  const sortedPieces = [...captured].sort((a, b) => (pieceValues[b] || 0) - (pieceValues[a] || 0));

  return (
    <div 
      style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        padding: '5px 10px',
        marginBottom: '5px',
        minHeight: '32px',
        border: '1px solid #e9ecef'
      }}
    >
      <div style={{ 
        fontSize: '10px', 
        fontWeight: 'bold', 
        marginBottom: '3px',
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{color === 'white' ? '⬜ Captured' : '⬛ Captured'}</span>
        {materialValue > 0 && (
          <span style={{ 
            color: '#28a745', 
            fontSize: '10px',
            backgroundColor: '#d4edda',
            padding: '1px 4px',
            borderRadius: '3px'
          }}>
            +{materialValue}
          </span>
        )}
      </div>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '2px',
        minHeight: '20px'
      }}>
        {sortedPieces.length > 0 ? (
          sortedPieces.map((piece, index) => (
            <span 
              key={index}
              style={{
                fontSize: '16px',
                color: color === 'white' ? '#000' : '#fff',
                textShadow: color === 'white' ? 'none' : '0 0 2px #000',
                filter: color === 'black' ? 'invert(1)' : 'none',
                lineHeight: '1'
              }}
            >
              {pieceSymbols[piece]}
            </span>
          ))
        ) : (
          <span style={{ fontSize: '10px', color: '#999', fontStyle: 'italic' }}>
            No pieces captured
          </span>
        )}
      </div>
    </div>
  );
};
