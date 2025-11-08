import { useState, useEffect } from 'react';
import { leaderboardService, LeaderboardPlayer } from '../services/leaderboard';
import './Leaderboard.css';

interface LeaderboardProps {
  onClose: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'wins' | 'winrate' | 'games'>('rating');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [globalStats, setGlobalStats] = useState<any>(null);

  useEffect(() => {
    loadLeaderboard();
    loadGlobalStats();
  }, [sortBy]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await leaderboardService.getLeaderboard(sortBy, 20);
      setLeaderboard(data.leaderboard);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalStats = async () => {
    try {
      const stats = await leaderboardService.getGlobalStats();
      setGlobalStats(stats);
    } catch (err) {
      console.error('Failed to load global stats:', err);
    }
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="leaderboard-overlay" onClick={onClose}>
      <div className="leaderboard-content" onClick={(e) => e.stopPropagation()}>
        <button className="leaderboard-close" onClick={onClose}>✕</button>
        
        <h2 className="leaderboard-title">🏆 Leaderboard</h2>

        {globalStats && (
          <div className="global-stats">
            <div className="stat-card">
              <div className="stat-value">{globalStats.totalUsers}</div>
              <div className="stat-label">Total Players</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{globalStats.totalGames}</div>
              <div className="stat-label">Games Played</div>
            </div>
            {globalStats.topRatedPlayer && (
              <div className="stat-card">
                <div className="stat-value">{globalStats.topRatedPlayer.username}</div>
                <div className="stat-label">Top Player ({globalStats.topRatedPlayer.rating})</div>
              </div>
            )}
          </div>
        )}

        <div className="sort-buttons">
          <button
            className={`sort-btn ${sortBy === 'rating' ? 'active' : ''}`}
            onClick={() => setSortBy('rating')}
          >
            ⭐ Rating
          </button>
          <button
            className={`sort-btn ${sortBy === 'wins' ? 'active' : ''}`}
            onClick={() => setSortBy('wins')}
          >
            🏅 Wins
          </button>
          <button
            className={`sort-btn ${sortBy === 'winrate' ? 'active' : ''}`}
            onClick={() => setSortBy('winrate')}
          >
            📊 Win Rate
          </button>
          <button
            className={`sort-btn ${sortBy === 'games' ? 'active' : ''}`}
            onClick={() => setSortBy('games')}
          >
            🎮 Games
          </button>
        </div>

        {loading ? (
          <div className="leaderboard-loading">
            <div className="spinner"></div>
            <p>Loading rankings...</p>
          </div>
        ) : error ? (
          <div className="leaderboard-error">
            <p>{error}</p>
            <button onClick={loadLeaderboard} className="retry-btn">Retry</button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="leaderboard-empty">
            <p>🎯 No players yet! Be the first to play!</p>
          </div>
        ) : (
          <div className="leaderboard-table">
            <div className="table-header">
              <div className="col-rank">Rank</div>
              <div className="col-player">Player</div>
              <div className="col-rating">Rating</div>
              <div className="col-stats">W/L/D</div>
              <div className="col-winrate">Win %</div>
            </div>
            {leaderboard.map((player) => (
              <div
                key={player.rank}
                className={`table-row ${player.rank <= 3 ? 'top-three' : ''}`}
              >
                <div className="col-rank rank-badge">
                  {getRankEmoji(player.rank)}
                </div>
                <div className="col-player">
                  <span className="player-name">{player.username}</span>
                </div>
                <div className="col-rating">
                  <span className="rating-value">{player.rating}</span>
                </div>
                <div className="col-stats">
                  <span className="stat-wins">{player.stats.wins}</span> /
                  <span className="stat-losses"> {player.stats.losses}</span> /
                  <span className="stat-draws"> {player.stats.draws}</span>
                </div>
                <div className="col-winrate">
                  <div className="winrate-bar">
                    <div
                      className="winrate-fill"
                      style={{ width: `${player.stats.winRate}%` }}
                    ></div>
                  </div>
                  <span className="winrate-text">{player.stats.winRate}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
