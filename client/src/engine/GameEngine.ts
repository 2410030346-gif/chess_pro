import { Chess, Square, Move } from 'chess.js';

/**
 * GameEngine wraps chess.js and provides a clean API for game logic
 */
export class GameEngine {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  /**
   * Start a new game
   */
  newGame(): void {
    this.chess = new Chess();
  }

  /**
   * Load a position from FEN
   */
  loadFEN(fen: string): boolean {
    try {
      this.chess = new Chess(fen);
      return true;
    } catch (error) {
      console.error('Invalid FEN:', error);
      return false;
    }
  }

  /**
   * Make a move (supports both SAN and object notation)
   */
  makeMove(move: string | { from: Square; to: Square; promotion?: string }): Move | null {
    try {
      return this.chess.move(move);
    } catch (error) {
      console.error('Invalid move:', error);
      return null;
    }
  }

  /**
   * Undo the last move
   */
  undo(): Move | null {
    return this.chess.undo();
  }

  /**
   * Get the current FEN string
   */
  getFEN(): string {
    return this.chess.fen();
  }

  /**
   * Get the PGN (game notation)
   */
  getPGN(): string {
    return this.chess.pgn();
  }

  /**
   * Get all legal moves for a square (or all legal moves if no square provided)
   */
  getLegalMoves(square?: Square): Move[] {
    if (square) {
      return this.chess.moves({ square, verbose: true });
    }
    return this.chess.moves({ verbose: true });
  }

  /**
   * Check if the game is over
   */
  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  /**
   * Check if the current position is checkmate
   */
  isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  /**
   * Check if the current position is stalemate
   */
  isStalemate(): boolean {
    return this.chess.isStalemate();
  }

  /**
   * Check if the current position is a draw
   */
  isDraw(): boolean {
    return this.chess.isDraw();
  }

  /**
   * Check if the current side is in check
   */
  inCheck(): boolean {
    return this.chess.inCheck();
  }

  /**
   * Get the current turn ('w' or 'b')
   */
  turn(): 'w' | 'b' {
    return this.chess.turn();
  }

  /**
   * Get move history
   */
  history(): string[] {
    return this.chess.history();
  }

  /**
   * Get game status message
   */
  getGameStatus(): string {
    if (this.isCheckmate()) {
      return `Checkmate! ${this.turn() === 'w' ? 'Black' : 'White'} wins!`;
    }
    if (this.isStalemate()) {
      return 'Stalemate! The game is a draw.';
    }
    if (this.isDraw()) {
      return 'Draw!';
    }
    if (this.inCheck()) {
      return `${this.turn() === 'w' ? 'White' : 'Black'} is in check!`;
    }
    return `${this.turn() === 'w' ? 'White' : 'Black'} to move`;
  }

  /**
   * Validate if a move is legal
   */
  isMoveLegal(from: Square, to: Square, promotion?: string): boolean {
    const moves = this.getLegalMoves(from);
    return moves.some(move => 
      move.to === to && (!promotion || move.promotion === promotion)
    );
  }

  /**
   * Get the underlying Chess instance (for advanced usage)
   */
  getChessInstance(): Chess {
    return this.chess;
  }
}
