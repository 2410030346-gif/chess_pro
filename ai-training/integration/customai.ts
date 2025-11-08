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
      return;
    }

    this.isLoading = true;

    try {
      console.log('🤖 Loading custom AI model...');
      
      // Load the ONNX model
      this.session = await ort.InferenceSession.create('/models/chess_model_web.onnx', {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });

      this.isReady = true;
      console.log('✅ Custom AI model loaded successfully!');
    } catch (error) {
      console.error('❌ Failed to load custom AI model:', error);
      throw new Error('Failed to initialize custom AI');
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
  async getBestMove(fen: string): Promise<string> {
    if (!this.isReady) {
      await this.init();
    }

    if (!this.session) {
      throw new Error('Model not initialized');
    }

    try {
      const game = new Chess(fen);
      
      // Convert board to input tensor
      const inputData = this.boardToInput(game);
      const inputTensor = new ort.Tensor('float32', inputData, [1, 119, 8, 8]);

      // Run inference
      const feeds = { input: inputTensor };
      const results = await this.session.run(feeds);

      // Extract outputs
      const policy = results.policy.data as Float32Array;
      const value = results.value.data as Float32Array;

      console.log('🎯 Position evaluation:', value[0].toFixed(3));

      // Convert policy to move
      const bestMove = this.policyToMove(game, policy);

      return bestMove;
    } catch (error) {
      console.error('❌ Error getting best move:', error);
      
      // Fallback to random legal move
      const game = new Chess(fen);
      const moves = game.moves({ verbose: true });
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return randomMove.from + randomMove.to + (randomMove.promotion || '');
    }
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
