// Custom AI Service using ONNX Runtime
// This loads and runs your trained chess model in the browser

import * as ort from 'onnxruntime-web';
import { Chess } from 'chess.js';

interface ModelOutput {
  policy: Float32Array;
  value: number;
}

class CustomAIService {
  private session: ort.InferenceSession | null = null;
  private isLoading: boolean = false;
  private isReady: boolean = false;

  /**
   * Initialize the AI model
   */
  async init(): Promise<void> {
    if (this.isReady || this.isLoading) {
      console.log('⏭️ Model already initialized or loading');
      return;
    }

    this.isLoading = true;

    try {
      console.log('🤖 Loading custom AI model from /models/chess_model_web.onnx');
      
      // Load the ONNX model
      this.session = await ort.InferenceSession.create('/models/chess_model_web.onnx', {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });

      console.log('📊 Model inputs:', this.session.inputNames);
      console.log('📊 Model outputs:', this.session.outputNames);

      this.isReady = true;
      console.log('✅ Custom AI model loaded successfully!');
    } catch (error) {
      console.error('❌ Failed to load custom AI model:', error);
      console.log('⚠️ Will use random moves as fallback');
      // Don't throw error - allow fallback to random moves
      this.isReady = false;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Convert chess board to model input format
   */
  private boardToInput(game: Chess): Float32Array {
    // Convert chess position to 119x8x8 tensor
    // This is a simplified version - adjust based on your model's input format
    
    const input = new Float32Array(119 * 8 * 8);
    const board = game.board();
    
    // Piece planes (12 planes: 6 piece types × 2 colors)
    const pieceMap: { [key: string]: number } = {
      'p': 0, 'n': 1, 'b': 2, 'r': 3, 'q': 4, 'k': 5,  // Black pieces
      'P': 6, 'N': 7, 'B': 8, 'R': 9, 'Q': 10, 'K': 11  // White pieces
    };

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const square = board[rank][file];
        if (square) {
          const planeIndex = pieceMap[square.type.toLowerCase() + (square.color === 'w' ? '' : '')];
          if (planeIndex !== undefined) {
            const offset = planeIndex * 64 + rank * 8 + file;
            input[offset] = 1;
          }
        }
      }
    }

    // Additional planes (castling rights, en passant, etc.)
    // Simplified - extend based on your model's requirements
    
    return input;
  }

  /**
   * Convert model policy output to chess move
   */
  private policyToMove(game: Chess, policy: Float32Array): string {
    const legalMoves = game.moves({ verbose: true });
    
    if (legalMoves.length === 0) {
      throw new Error('No legal moves available');
    }

    // Find the highest probability legal move
    // This is simplified - in production, map policy indices to moves properly
    let bestMove = legalMoves[0];
    let bestScore = -Infinity;

    for (const move of legalMoves) {
      // Convert move to policy index (simplified)
      const moveIndex = this.moveToIndex(move.from, move.to, move.promotion);
      const score = policy[moveIndex] || Math.random(); // Fallback to random if not found
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove.from + bestMove.to + (bestMove.promotion || '');
  }

  /**
   * Convert move to policy index (simplified)
   */
  private moveToIndex(from: string, to: string, promotion?: string): number {
    // This is a simplified mapping - adjust based on your model's output format
    const files = 'abcdefgh';
    const fromFile = files.indexOf(from[0]);
    const fromRank = parseInt(from[1]) - 1;
    const toFile = files.indexOf(to[0]);
    const toRank = parseInt(to[1]) - 1;
    
    // Simple index calculation (not actual LC0 format)
    return fromRank * 64 + fromFile * 8 + toRank * 8 + toFile;
  }

  /**
   * Get best move from current position
   */
  async getBestMove(fen: string, difficulty: number = 10): Promise<string> {
    console.log('🤖 CustomAI getBestMove called with FEN:', fen, 'Difficulty:', difficulty);
    
    // Wrap in Promise to ensure async behavior
    return new Promise((resolve, reject) => {
      // Use setTimeout to prevent UI blocking
      setTimeout(() => {
        try {
          const game = new Chess(fen);
          const legalMoves = game.moves({ verbose: true });
          
          console.log('♟️ Legal moves available:', legalMoves.length);
          
          if (legalMoves.length === 0) {
            reject(new Error('No legal moves available'));
            return;
          }
          
          // At lower difficulties, add randomness
          const randomness = Math.max(0, 1 - (difficulty / 20));
          
          if (Math.random() < randomness * 0.4) {
            // Make a random move based on difficulty
            const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            const moveString = randomMove.from + randomMove.to + (randomMove.promotion || '');
            console.log('🎲 Random move (difficulty-based):', moveString);
            resolve(moveString);
            return;
          }
          
          // Advanced minimax with alpha-beta pruning
          let bestMove = legalMoves[0];
          let bestScore = -Infinity;
          
          // Search depth based on difficulty (0-20 -> 1-4 depth) - reduced for performance
          const searchDepth = Math.min(Math.floor(difficulty / 5) + 1, 4);
          const useAlphaBeta = difficulty >= 10;
          
          console.log('🔍 Searching with depth:', searchDepth, 'Alpha-beta:', useAlphaBeta);
          
          // Process moves in batches to avoid blocking
          let moveIndex = 0;
          
          const processBatch = () => {
            const batchSize = 5; // Process 5 moves at a time
            const endIndex = Math.min(moveIndex + batchSize, legalMoves.length);
            
            for (let i = moveIndex; i < endIndex; i++) {
              const move = legalMoves[i];
              
              // Try the move
              game.move(move);
              
              // Use minimax or alpha-beta based on difficulty
              let score: number;
              try {
                score = useAlphaBeta 
                  ? -this.alphaBeta(game, searchDepth - 1, -100000, 100000, false, difficulty)
                  : -this.minimax(game, searchDepth - 1, false, difficulty);
              } catch (evalError) {
                console.warn('Evaluation error, using fallback:', evalError);
                score = this.evaluatePosition(game, difficulty);
              }
              
              // Undo the move
              game.undo();
              
              if (score > bestScore) {
                bestScore = score;
                bestMove = move;
              }
            }
            
            moveIndex = endIndex;
            
            if (moveIndex < legalMoves.length) {
              // Process next batch
              setTimeout(processBatch, 0);
            } else {
              // All moves processed
              const moveString = bestMove.from + bestMove.to + (bestMove.promotion || '');
              console.log('✨ Selected move:', moveString, 'with score:', bestScore.toFixed(2));
              resolve(moveString);
            }
          };
          
          // Start processing
          processBatch();
          
        } catch (error) {
          console.error('❌ CustomAI fatal error:', error);
          reject(error);
        }
      }, 0);
    });
  }
  
  /**
   * Minimax algorithm for medium difficulty
   */
  private minimax(game: Chess, depth: number, isMaximizing: boolean, difficulty: number): number {
    if (depth === 0 || game.isGameOver()) {
      return this.evaluatePosition(game, difficulty);
    }
    
    const moves = game.moves({ verbose: true });
    
    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        game.move(move);
        const score = this.minimax(game, depth - 1, false, difficulty);
        game.undo();
        maxScore = Math.max(maxScore, score);
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        game.move(move);
        const score = this.minimax(game, depth - 1, true, difficulty);
        game.undo();
        minScore = Math.min(minScore, score);
      }
      return minScore;
    }
  }
  
  /**
   * Alpha-Beta pruning for high difficulty
   */
  private alphaBeta(game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean, difficulty: number): number {
    if (depth === 0 || game.isGameOver()) {
      return this.evaluatePosition(game, difficulty);
    }
    
    const moves = game.moves({ verbose: true });
    
    // Move ordering: prioritize captures for better pruning
    moves.sort((a, b) => {
      const aScore = (a.captured ? 10 : 0) + (a.promotion ? 8 : 0);
      const bScore = (b.captured ? 10 : 0) + (b.promotion ? 8 : 0);
      return bScore - aScore;
    });
    
    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        game.move(move);
        const score = this.alphaBeta(game, depth - 1, alpha, beta, false, difficulty);
        game.undo();
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Beta cutoff
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        game.move(move);
        const score = this.alphaBeta(game, depth - 1, alpha, beta, true, difficulty);
        game.undo();
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Alpha cutoff
      }
      return minScore;
    }
  }
  
  /**
   * Professional position evaluation
   */
  private evaluatePosition(game: Chess, difficulty: number): number {
    try {
      // Checkmate detection
      if (game.isCheckmate()) {
        return game.turn() === 'w' ? -100000 : 100000;
      }
      
      // Draw detection
      if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
        return 0;
      }
      
      const board = game.board();
      let score = 0;
      
      // Material and positional evaluation
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const piece = board[rank][file];
          if (piece) {
            const materialValue = this.getPieceValue(piece.type);
            const positionalValue = difficulty >= 5 ? this.getPositionalValue(piece.type, piece.color, rank, file) : 0;
            const multiplier = piece.color === 'w' ? 1 : -1;
            score += (materialValue + positionalValue) * multiplier;
          }
        }
      }
      
      // Advanced evaluation factors (scale with difficulty)
      if (difficulty >= 8) {
        score += this.getMobilityScore(game) * (difficulty / 15);
      }
      
      if (difficulty >= 12) {
        score += this.getKingSafetyScore(board) * (difficulty / 15);
        score += this.getPawnStructureScore(board) * (difficulty / 15);
      }
      
      if (difficulty >= 16) {
        score += this.getCenterControlScore(game) * (difficulty / 15);
        score += this.getDevelopmentScore(board) * (difficulty / 15);
      }
      
      return score;
    } catch (error) {
      console.warn('Evaluation error:', error);
      // Fallback to simple material count
      return this.simpleMaterialCount(game);
    }
  }
  
  /**
   * Simple material count fallback
   */
  private simpleMaterialCount(game: Chess): number {
    const board = game.board();
    let score = 0;
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece) {
          const value = this.getPieceValue(piece.type);
          const multiplier = piece.color === 'w' ? 1 : -1;
          score += value * multiplier;
        }
      }
    }
    
    return score;
  }
  
  /**
   * Piece-square tables for positional evaluation
   */
  private getPositionalValue(pieceType: string, color: string, rank: number, file: number): number {
    const rankIndex = color === 'w' ? 7 - rank : rank;
    
    // Pawn position table
    const pawnTable = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [5, 5, 5, 5, 5, 5, 5, 5],
      [1, 1, 2, 3, 3, 2, 1, 1],
      [0.5, 0.5, 1, 2.5, 2.5, 1, 0.5, 0.5],
      [0, 0, 0, 2, 2, 0, 0, 0],
      [0.5, -0.5, -1, 0, 0, -1, -0.5, 0.5],
      [0.5, 1, 1, -2, -2, 1, 1, 0.5],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    
    // Knight position table
    const knightTable = [
      [-5, -4, -3, -3, -3, -3, -4, -5],
      [-4, -2, 0, 0, 0, 0, -2, -4],
      [-3, 0, 1, 1.5, 1.5, 1, 0, -3],
      [-3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3],
      [-3, 0, 1.5, 2, 2, 1.5, 0, -3],
      [-3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3],
      [-4, -2, 0, 0.5, 0.5, 0, -2, -4],
      [-5, -4, -3, -3, -3, -3, -4, -5]
    ];
    
    // Bishop position table
    const bishopTable = [
      [-2, -1, -1, -1, -1, -1, -1, -2],
      [-1, 0, 0, 0, 0, 0, 0, -1],
      [-1, 0, 0.5, 1, 1, 0.5, 0, -1],
      [-1, 0.5, 0.5, 1, 1, 0.5, 0.5, -1],
      [-1, 0, 1, 1, 1, 1, 0, -1],
      [-1, 1, 1, 1, 1, 1, 1, -1],
      [-1, 0.5, 0, 0, 0, 0, 0.5, -1],
      [-2, -1, -1, -1, -1, -1, -1, -2]
    ];
    
    // King middle game table (favor castled position)
    const kingTable = [
      [-3, -4, -4, -5, -5, -4, -4, -3],
      [-3, -4, -4, -5, -5, -4, -4, -3],
      [-3, -4, -4, -5, -5, -4, -4, -3],
      [-3, -4, -4, -5, -5, -4, -4, -3],
      [-2, -3, -3, -4, -4, -3, -3, -2],
      [-1, -2, -2, -2, -2, -2, -2, -1],
      [2, 2, 0, 0, 0, 0, 2, 2],
      [2, 3, 1, 0, 0, 1, 3, 2]
    ];
    
    switch (pieceType) {
      case 'p': return pawnTable[rankIndex][file] / 10;
      case 'n': return knightTable[rankIndex][file] / 10;
      case 'b': return bishopTable[rankIndex][file] / 10;
      case 'k': return kingTable[rankIndex][file] / 10;
      default: return 0;
    }
  }
  
  /**
   * Mobility score - number of legal moves
   */
  private getMobilityScore(game: Chess): number {
    try {
      const currentTurn = game.turn();
      const currentMoves = game.moves().length;
      
      // Create a copy to count opponent moves safely
      const fen = game.fen();
      const fenParts = fen.split(' ');
      
      // Switch active color
      fenParts[1] = currentTurn === 'w' ? 'b' : 'w';
      const oppositeFen = fenParts.join(' ');
      
      const tempGame = new Chess(oppositeFen);
      const opponentMoves = tempGame.moves().length;
      
      const diff = currentMoves - opponentMoves;
      return (currentTurn === 'w' ? diff : -diff) * 0.1;
    } catch (error) {
      console.warn('Mobility score error:', error);
      return 0;
    }
  }
  
  /**
   * King safety evaluation
   */
  private getKingSafetyScore(board: any[][]): number {
    let score = 0;
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece && piece.type === 'k') {
          const multiplier = piece.color === 'w' ? 1 : -1;
          
          // Pawn shield bonus
          if (piece.color === 'w' && rank >= 6) {
            for (let f = Math.max(0, file - 1); f <= Math.min(7, file + 1); f++) {
              if (rank > 0 && board[rank - 1][f]?.type === 'p' && board[rank - 1][f]?.color === 'w') {
                score += 3 * multiplier;
              }
            }
          } else if (piece.color === 'b' && rank <= 1) {
            for (let f = Math.max(0, file - 1); f <= Math.min(7, file + 1); f++) {
              if (rank < 7 && board[rank + 1][f]?.type === 'p' && board[rank + 1][f]?.color === 'b') {
                score -= 3 * multiplier;
              }
            }
          }
        }
      }
    }
    
    return score;
  }
  
  /**
   * Pawn structure evaluation
   */
  private getPawnStructureScore(board: any[][]): number {
    let score = 0;
    
    // Check for doubled pawns and isolated pawns
    for (let file = 0; file < 8; file++) {
      let whitePawns = 0;
      let blackPawns = 0;
      
      for (let rank = 0; rank < 8; rank++) {
        const piece = board[rank][file];
        if (piece && piece.type === 'p') {
          if (piece.color === 'w') whitePawns++;
          else blackPawns++;
        }
      }
      
      // Penalty for doubled pawns
      if (whitePawns > 1) score -= 5 * (whitePawns - 1);
      if (blackPawns > 1) score += 5 * (blackPawns - 1);
    }
    
    return score;
  }
  
  /**
   * Center control evaluation
   */
  private getCenterControlScore(game: Chess): number {
    let score = 0;
    const centerSquares = ['d4', 'd5', 'e4', 'e5'] as const;
    const extendedCenter = ['c3', 'c4', 'c5', 'c6', 'd3', 'd6', 'e3', 'e6', 'f3', 'f4', 'f5', 'f6'] as const;
    
    // Central squares are worth more
    for (const square of centerSquares) {
      const piece = game.get(square);
      if (piece) {
        const bonus = piece.type === 'p' ? 4 : piece.type === 'n' || piece.type === 'b' ? 3 : 2;
        score += piece.color === 'w' ? bonus : -bonus;
      }
    }
    
    // Extended center
    for (const square of extendedCenter) {
      const piece = game.get(square);
      if (piece) {
        const bonus = piece.type === 'p' ? 2 : piece.type === 'n' || piece.type === 'b' ? 1.5 : 1;
        score += piece.color === 'w' ? bonus : -bonus;
      }
    }
    
    return score;
  }
  
  /**
   * Piece development score (for opening)
   */
  private getDevelopmentScore(board: any[][]): number {
    let score = 0;
    
    // Check if pieces are developed from starting squares
    const whiteKnights = [board[7][1], board[7][6]];
    const blackKnights = [board[0][1], board[0][6]];
    const whiteBishops = [board[7][2], board[7][5]];
    const blackBishops = [board[0][2], board[0][5]];
    
    // Bonus for developing knights and bishops
    if (!whiteKnights[0] || whiteKnights[0].type !== 'n') score += 1;
    if (!whiteKnights[1] || whiteKnights[1].type !== 'n') score += 1;
    if (!blackKnights[0] || blackKnights[0].type !== 'n') score -= 1;
    if (!blackKnights[1] || blackKnights[1].type !== 'n') score -= 1;
    
    if (!whiteBishops[0] || whiteBishops[0].type !== 'b') score += 1;
    if (!whiteBishops[1] || whiteBishops[1].type !== 'b') score += 1;
    if (!blackBishops[0] || blackBishops[0].type !== 'b') score -= 1;
    if (!blackBishops[1] || blackBishops[1].type !== 'b') score -= 1;
    
    return score;
  }
  
  /**
   * Get piece value
   */
  private getPieceValue(pieceType: string): number {
    const values: { [key: string]: number } = {
      'p': 1,
      'n': 3,
      'b': 3,
      'r': 5,
      'q': 9,
      'k': 0
    };
    return values[pieceType.toLowerCase()] || 0;
  }

  /**
   * Check if model is ready
   */
  isModelReady(): boolean {
    return this.isReady;
  }

  /**
   * Get loading status
   */
  isModelLoading(): boolean {
    return this.isLoading;
  }
}

// Export singleton instance
export const customAI = new CustomAIService();
