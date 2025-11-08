// Player Statistics & Game History Service

export interface GameResult {
  id: string;
  mode: 'local' | 'ai' | 'customai' | 'online';
  result: 'win' | 'loss' | 'draw';
  opponent: string;
  moves: number;
  duration: number; // in seconds
  date: Date;
  pgn?: string;
  fen?: string;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageMoves: number;
  averageDuration: number;
  longestGame: number;
  shortestWin: number;
  currentStreak: number;
  bestStreak: number;
  gamesVsAI: number;
  gamesVsCustomAI: number;
  gamesLocal: number;
  gamesOnline: number;
  lastPlayed?: Date;
}

class StatisticsService {
  private readonly STORAGE_KEY = 'chessStatistics';
  private readonly HISTORY_KEY = 'chessGameHistory';
  
  /**
   * Get player statistics
   */
  getStats(): PlayerStats {
    const statsStr = localStorage.getItem(this.STORAGE_KEY);
    if (statsStr) {
      const stats = JSON.parse(statsStr);
      if (stats.lastPlayed) {
        stats.lastPlayed = new Date(stats.lastPlayed);
      }
      return stats;
    }
    
    return this.getDefaultStats();
  }
  
  /**
   * Get default stats object
   */
  private getDefaultStats(): PlayerStats {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      averageMoves: 0,
      averageDuration: 0,
      longestGame: 0,
      shortestWin: Infinity,
      currentStreak: 0,
      bestStreak: 0,
      gamesVsAI: 0,
      gamesVsCustomAI: 0,
      gamesLocal: 0,
      gamesOnline: 0
    };
  }
  
  /**
   * Record a game result
   */
  recordGame(result: GameResult) {
    // Update stats
    const stats = this.getStats();
    stats.totalGames++;
    stats.lastPlayed = new Date();
    
    // Update result counts
    if (result.result === 'win') {
      stats.wins++;
      stats.currentStreak++;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
      if (result.moves < stats.shortestWin || stats.shortestWin === Infinity) {
        stats.shortestWin = result.moves;
      }
    } else if (result.result === 'loss') {
      stats.losses++;
      stats.currentStreak = 0;
    } else {
      stats.draws++;
    }
    
    // Update mode counts
    switch (result.mode) {
      case 'ai':
        stats.gamesVsAI++;
        break;
      case 'customai':
        stats.gamesVsCustomAI++;
        break;
      case 'local':
        stats.gamesLocal++;
        break;
      case 'online':
        stats.gamesOnline++;
        break;
    }
    
    // Update averages
    stats.winRate = (stats.wins / stats.totalGames) * 100;
    
    const history = this.getHistory();
    const totalMoves = history.reduce((sum, game) => sum + game.moves, 0) + result.moves;
    stats.averageMoves = Math.round(totalMoves / (history.length + 1));
    
    const totalDuration = history.reduce((sum, game) => sum + game.duration, 0) + result.duration;
    stats.averageDuration = Math.round(totalDuration / (history.length + 1));
    
    if (result.moves > stats.longestGame) {
      stats.longestGame = result.moves;
    }
    
    // Save stats
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    
    // Add to history
    this.addToHistory(result);
  }
  
  /**
   * Get game history
   */
  getHistory(): GameResult[] {
    const historyStr = localStorage.getItem(this.HISTORY_KEY);
    if (historyStr) {
      const history = JSON.parse(historyStr);
      return history.map((game: any) => ({
        ...game,
        date: new Date(game.date)
      }));
    }
    return [];
  }
  
  /**
   * Add game to history
   */
  private addToHistory(result: GameResult) {
    const history = this.getHistory();
    history.unshift(result); // Add to beginning
    
    // Keep only last 100 games
    if (history.length > 100) {
      history.pop();
    }
    
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
  }
  
  /**
   * Clear all statistics
   */
  clearStats() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.HISTORY_KEY);
  }
  
  /**
   * Get win rate against specific opponent type
   */
  getWinRateByMode(mode: string): number {
    const history = this.getHistory().filter(game => game.mode === mode);
    if (history.length === 0) return 0;
    
    const wins = history.filter(game => game.result === 'win').length;
    return (wins / history.length) * 100;
  }
  
  /**
   * Get recent games (last N games)
   */
  getRecentGames(count: number = 10): GameResult[] {
    return this.getHistory().slice(0, count);
  }
}

export const statisticsService = new StatisticsService();
