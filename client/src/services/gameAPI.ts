const API_URL = 'http://localhost:3001/api';

export interface SaveGameData {
  players: {
    white: string;
    black: string;
  };
  moves: Array<{
    move: string;
    fen: string;
    timestamp?: Date;
  }>;
  result: 'white' | 'black' | 'draw';
  gameMode: 'local' | 'ai' | 'customai' | 'online';
  finalFEN: string;
}

class GameAPIService {
  async saveGame(gameData: SaveGameData, token?: string) {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/games`, {
        method: 'POST',
        headers,
        body: JSON.stringify(gameData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save game');
      }

      return data;
    } catch (error: any) {
      console.error('Save game error:', error);
      throw new Error(error.message || 'Failed to save game');
    }
  }

  async getGames(page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_URL}/games?page=${page}&limit=${limit}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch games');
      }

      return data;
    } catch (error: any) {
      console.error('Get games error:', error);
      throw new Error(error.message || 'Failed to fetch games');
    }
  }

  async getGame(gameId: string) {
    try {
      const response = await fetch(`${API_URL}/games/${gameId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch game');
      }

      return data;
    } catch (error: any) {
      console.error('Get game error:', error);
      throw new Error(error.message || 'Failed to fetch game');
    }
  }

  async getUserGames(username: string, page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_URL}/games/user/${username}?page=${page}&limit=${limit}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user games');
      }

      return data;
    } catch (error: any) {
      console.error('Get user games error:', error);
      throw new Error(error.message || 'Failed to fetch user games');
    }
  }
}

export const gameAPI = new GameAPIService();
