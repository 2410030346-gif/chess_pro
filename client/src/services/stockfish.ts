/**
 * StockfishService manages the Stockfish engine running in a Web Worker
 */
export class StockfishService {
  private worker: Worker | null = null;
  private messageHandlers: Map<string, (message: string) => void> = new Map();
  private isReady = false;

  /**
   * Initialize the Stockfish worker
   * Note: You need to download stockfish.js and place it in the public folder
   * Get it from: https://github.com/nmrugg/stockfish.js/
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create worker from stockfish.js in public folder
        this.worker = new Worker('/stockfish.js');
        
        this.worker.onmessage = (event) => {
          const message = event.data;
          console.log('Stockfish:', message);

          // Check if engine is ready
          if (message === 'uciok') {
            this.isReady = true;
            resolve();
          }

          // Call registered message handlers
          this.messageHandlers.forEach((handler) => handler(message));
        };

        this.worker.onerror = (error) => {
          console.error('Stockfish worker error:', error);
          reject(error);
        };

        // Initialize UCI protocol
        this.sendCommand('uci');
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send a command to Stockfish
   */
  sendCommand(command: string): void {
    if (!this.worker) {
      console.error('Stockfish worker not initialized');
      return;
    }
    console.log('To Stockfish:', command);
    this.worker.postMessage(command);
  }

  /**
   * Get the best move for a given position
   */
  async getBestMove(
    fen: string,
    options: { depth?: number; movetime?: number; skillLevel?: number } = {}
  ): Promise<string> {
    const { depth = 10, movetime = 1000, skillLevel } = options;

    return new Promise((resolve, reject) => {
      // Set timeout to prevent hanging
      const timeout = setTimeout(() => {
        this.messageHandlers.delete('bestmove');
        reject(new Error('Stockfish timeout - no response received'));
      }, (movetime || depth * 1000) + 5000); // Add 5 seconds buffer

      // Set skill level if provided (0-20, lower is weaker)
      if (skillLevel !== undefined) {
        this.sendCommand(`setoption name Skill Level value ${skillLevel}`);
      }

      // Register handler for bestmove response
      const handleBestMove = (message: string) => {
        if (message.startsWith('bestmove')) {
          const match = message.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
          if (match) {
            clearTimeout(timeout);
            this.messageHandlers.delete('bestmove');
            resolve(match[1]);
          }
        }
      };

      this.messageHandlers.set('bestmove', handleBestMove);

      // Set position and request move
      this.sendCommand(`position fen ${fen}`);
      
      if (movetime) {
        this.sendCommand(`go movetime ${movetime}`);
      } else {
        this.sendCommand(`go depth ${depth}`);
      }
    });
  }

  /**
   * Stop current calculation
   */
  stop(): void {
    this.sendCommand('stop');
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isReady = false;
    }
  }

  /**
   * Check if engine is ready
   */
  ready(): boolean {
    return this.isReady;
  }
}

// Singleton instance
let stockfishInstance: StockfishService | null = null;

export const getStockfishService = (): StockfishService => {
  if (!stockfishInstance) {
    stockfishInstance = new StockfishService();
  }
  return stockfishInstance;
};
