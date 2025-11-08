import { useState, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square, Chess } from 'chess.js';

interface BoardProps {
  position: string;
  onPieceDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
  boardOrientation?: 'white' | 'black';
  isPlayerTurn: boolean;
  showPromotionDialog?: boolean;
  onPromotionPieceSelect?: (piece: 'q' | 'r' | 'b' | 'n') => void;
  isCheck?: boolean;
  currentTurn?: 'w' | 'b';
  customLightSquareStyle?: React.CSSProperties;
  customDarkSquareStyle?: React.CSSProperties;
  lastMove?: { from: Square; to: Square } | null;
}

export const Board: React.FC<BoardProps> = ({
  position,
  onPieceDrop,
  boardOrientation = 'white',
  isPlayerTurn,
  showPromotionDialog = false,
  onPromotionPieceSelect,
  isCheck = false,
  currentTurn = 'w',
  customLightSquareStyle,
  customDarkSquareStyle,
  lastMove = null,
}) => {
  const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, { backgroundColor: string }>>({});
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);

  // Find the king square when in check
  const kingSquare = useMemo(() => {
    if (!isCheck) return null;
    
    // Parse the FEN to find the king's position
    const pieces = position.split(' ')[0];
    const king = currentTurn === 'w' ? 'K' : 'k';
    
    let row = 0;
    let col = 0;
    
    for (const char of pieces) {
      if (char === '/') {
        row++;
        col = 0;
      } else if (/\d/.test(char)) {
        col += parseInt(char);
      } else {
        if (char === king) {
          const file = String.fromCharCode(97 + col); // 'a' + col
          const rank = String(8 - row);
          return `${file}${rank}` as Square;
        }
        col++;
      }
    }
    return null;
  }, [isCheck, position, currentTurn]);

  // Combine custom square styles with check highlight and legal move indicators
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = { ...rightClickedSquares };
    
    // Highlight last move
    if (lastMove) {
      styles[lastMove.from] = {
        ...styles[lastMove.from],
        backgroundColor: 'rgba(255, 255, 100, 0.5)'
      };
      styles[lastMove.to] = {
        ...styles[lastMove.to],
        backgroundColor: 'rgba(255, 255, 100, 0.5)'
      };
    }
    
    if (kingSquare && isCheck) {
      styles[kingSquare] = {
        backgroundColor: 'rgba(255, 0, 0, 0.8)'
      };
    }
    
    // Add highlight for selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(255, 255, 0, 0.5)'
      };
    }
    
    // Add dots for legal moves
    legalMoves.forEach(square => {
      // Create a temporary game to check if target square has a piece (capture move)
      const tempGame = new Chess(position);
      const targetPiece = tempGame.get(square);
      
      const hasExistingStyle = styles[square]?.backgroundColor;
      
      if (targetPiece) {
        // Capture move - show ring around the edge
        styles[square] = {
          ...styles[square],
          boxShadow: 'inset 0 0 0 4px rgba(255, 255, 255, 0.7)',
        };
      } else {
        // Regular move - show white dot in center
        styles[square] = {
          ...styles[square],
          backgroundImage: hasExistingStyle 
            ? `radial-gradient(circle, rgba(255, 255, 255, 0.9) 20%, transparent 25%), linear-gradient(${hasExistingStyle}, ${hasExistingStyle})`
            : 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 20%, transparent 25%)',
        };
      }
    });
    
    return styles;
  }, [rightClickedSquares, kingSquare, isCheck, legalMoves, selectedSquare, position, lastMove]);

  const handleSquareClick = (square: Square) => {
    if (!isPlayerTurn) return;
    
    // Create a temporary chess instance to check the square
    const tempGame = new Chess(position);
    const piece = tempGame.get(square);
    
    // If a piece is already selected and we click a legal move square, make the move
    if (selectedSquare && legalMoves.includes(square)) {
      const moveSuccess = onPieceDrop(selectedSquare, square);
      if (moveSuccess) {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
      return;
    }
    
    // Only show moves if there's a piece on the clicked square
    if (!piece) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }
    
    const moves = tempGame.moves({ square, verbose: true });
    
    if (moves.length > 0) {
      setSelectedSquare(square);
      setLegalMoves(moves.map(move => move.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handlePieceDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
    // Clear selection and legal moves after drop
    setSelectedSquare(null);
    setLegalMoves([]);
    
    // Only allow moves if it's the player's turn
    if (!isPlayerTurn) {
      return false;
    }

    return onPieceDrop(sourceSquare, targetSquare);
  };

  const onSquareRightClick = (square: Square) => {
    const color = rightClickedSquares[square]?.backgroundColor === 'rgba(255, 0, 0, 0.4)' 
      ? 'rgba(0, 255, 0, 0.4)' 
      : 'rgba(255, 0, 0, 0.4)';
    
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]: { backgroundColor: color },
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
      {isCheck && (
        <div style={{
          marginBottom: '10px',
          backgroundColor: '#6c757d',
          color: 'white',
          padding: '8px 20px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '18px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          animation: 'pulse 1s infinite',
          border: '2px solid #fff',
          textAlign: 'center'
        }}>
          ⚠️ CHECK! ⚠️
        </div>
      )}
      <Chessboard
        position={position}
        onPieceDrop={handlePieceDrop}
        boardOrientation={boardOrientation}
        customSquareStyles={customSquareStyles}
        onSquareRightClick={onSquareRightClick}
        onSquareClick={handleSquareClick}
        arePiecesDraggable={isPlayerTurn}
        customLightSquareStyle={
          customLightSquareStyle as unknown as Record<string, string> || 
          { backgroundColor: '#e8e8e8' }
        }
        customDarkSquareStyle={
          customDarkSquareStyle as unknown as Record<string, string> || 
          { backgroundColor: '#6c757d' }
        }
      />
      
      {showPromotionDialog && onPromotionPieceSelect && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Promote to:</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            {(['q', 'r', 'b', 'n'] as const).map((piece) => (
              <button
                key={piece}
                onClick={() => onPromotionPieceSelect(piece)}
                style={{
                  padding: '10px 20px',
                  fontSize: '24px',
                  cursor: 'pointer',
                  border: '2px solid #333',
                  borderRadius: '4px',
                  backgroundColor: '#f0f0f0',
                }}
              >
                {piece === 'q' ? '♕' : piece === 'r' ? '♖' : piece === 'b' ? '♗' : '♘'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
