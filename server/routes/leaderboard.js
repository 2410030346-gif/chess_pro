import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/leaderboard
// @desc    Get top players by rating
// @access  Public
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'rating';

    let sortOptions = {};
    
    switch (sortBy) {
      case 'wins':
        sortOptions = { 'stats.wins': -1 };
        break;
      case 'winrate':
        // Calculate win rate on the fly
        sortOptions = { 'stats.wins': -1 };
        break;
      case 'games':
        sortOptions = { 'stats.totalGames': -1 };
        break;
      default:
        sortOptions = { rating: -1 };
    }

    const users = await User.find()
      .select('username rating stats createdAt')
      .sort(sortOptions)
      .limit(limit);

    // Calculate win rate for each user
    const leaderboard = users.map((user, index) => {
      const winRate = user.stats.totalGames > 0 
        ? ((user.stats.wins / user.stats.totalGames) * 100).toFixed(1)
        : 0;

      return {
        rank: index + 1,
        username: user.username,
        rating: user.rating,
        stats: {
          wins: user.stats.wins,
          losses: user.stats.losses,
          draws: user.stats.draws,
          totalGames: user.stats.totalGames,
          winRate: parseFloat(winRate)
        },
        memberSince: user.createdAt
      };
    });

    // If sorting by winrate, re-sort the results
    if (sortBy === 'winrate') {
      leaderboard.sort((a, b) => b.stats.winRate - a.stats.winRate);
      // Update ranks
      leaderboard.forEach((player, index) => {
        player.rank = index + 1;
      });
    }

    res.json({
      leaderboard,
      sortBy,
      totalPlayers: await User.countDocuments()
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/leaderboard/user/:username
// @desc    Get user's rank and nearby players
// @access  Public
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const context = parseInt(req.query.context) || 5; // Players above and below

    const user = await User.findOne({ username }).select('username rating stats');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's rank
    const higherRatedCount = await User.countDocuments({ rating: { $gt: user.rating } });
    const userRank = higherRatedCount + 1;

    // Get nearby players
    const playersAbove = await User.find({ rating: { $gt: user.rating } })
      .select('username rating stats')
      .sort({ rating: 1 })
      .limit(context);

    const playersBelow = await User.find({ rating: { $lt: user.rating } })
      .select('username rating stats')
      .sort({ rating: -1 })
      .limit(context);

    const nearbyPlayers = [
      ...playersAbove.reverse(),
      user,
      ...playersBelow
    ].map((player, index) => {
      const winRate = player.stats.totalGames > 0 
        ? ((player.stats.wins / player.stats.totalGames) * 100).toFixed(1)
        : 0;

      return {
        rank: userRank - context + index,
        username: player.username,
        rating: player.rating,
        stats: {
          wins: player.stats.wins,
          losses: player.stats.losses,
          draws: player.stats.draws,
          totalGames: player.stats.totalGames,
          winRate: parseFloat(winRate)
        },
        isCurrentUser: player.username === username
      };
    });

    res.json({
      userRank,
      totalPlayers: await User.countDocuments(),
      nearbyPlayers
    });
  } catch (error) {
    console.error('User rank error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/leaderboard/stats
// @desc    Get overall statistics
// @access  Public
router.get('/stats/global', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGames = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$stats.totalGames' } } }
    ]);

    const topRatedPlayer = await User.findOne().sort({ rating: -1 }).select('username rating');
    const mostActivePlayer = await User.findOne().sort({ 'stats.totalGames': -1 }).select('username stats.totalGames');

    res.json({
      totalUsers,
      totalGames: totalGames[0]?.total || 0,
      topRatedPlayer: topRatedPlayer ? {
        username: topRatedPlayer.username,
        rating: topRatedPlayer.rating
      } : null,
      mostActivePlayer: mostActivePlayer ? {
        username: mostActivePlayer.username,
        gamesPlayed: mostActivePlayer.stats.totalGames
      } : null
    });
  } catch (error) {
    console.error('Global stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
