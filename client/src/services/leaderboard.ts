const API_URL = 'http://localhost:3001/api';

export interface LeaderboardPlayer {
  rank: number;
  username: string;
  rating: number;
  stats: {
    wins: number;
    losses: number;
    draws: number;
    totalGames: number;
    winRate: number;
  };
  memberSince?: Date;
  isCurrentUser?: boolean;
}

class LeaderboardService {
  async getLeaderboard(sortBy: 'rating' | 'wins' | 'winrate' | 'games' = 'rating', limit = 20) {
    try {
      const response = await fetch(`${API_URL}/leaderboard?sortBy=${sortBy}&limit=${limit}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }

      return data;
    } catch (error: any) {
      console.error('Get leaderboard error:', error);
      throw new Error(error.message || 'Failed to fetch leaderboard');
    }
  }

  async getUserRank(username: string, context = 5) {
    try {
      const response = await fetch(`${API_URL}/leaderboard/user/${username}?context=${context}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user rank');
      }

      return data;
    } catch (error: any) {
      console.error('Get user rank error:', error);
      throw new Error(error.message || 'Failed to fetch user rank');
    }
  }

  async getGlobalStats() {
    try {
      const response = await fetch(`${API_URL}/leaderboard/stats/global`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch global stats');
      }

      return data;
    } catch (error: any) {
      console.error('Get global stats error:', error);
      throw new Error(error.message || 'Failed to fetch global stats');
    }
  }
}

export const leaderboardService = new LeaderboardService();
