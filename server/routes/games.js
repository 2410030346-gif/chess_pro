import express from 'express';
import Game from '../models/Game.js';
import User from '../models/User.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/games
// @desc    Save a new game
// @access  Public/Private
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { players, moves, result, gameMode, finalFEN } = req.body;

    const game = new Game({
      players,
      moves: moves.map(move => ({
        move: move.move,
        fen: move.fen,
        timestamp: move.timestamp || new Date()
      })),
      result,
      gameMode,
      finalFEN,
      endTime: new Date()
    });

    await game.save();

    // Update user stats if authenticated
    if (req.user) {
      req.user.stats.totalGames += 1;
      
      if (result === 'white' && players.white === req.user.username) {
        req.user.stats.wins += 1;
      } else if (result === 'black' && players.black === req.user.username) {
        req.user.stats.wins += 1;
      } else if (result === 'draw') {
        req.user.stats.draws += 1;
      } else {
        req.user.stats.losses += 1;
      }

      await req.user.save();
    }

    res.status(201).json({
      message: 'Game saved successfully',
      gameId: game._id
    });
  } catch (error) {
    console.error('Save game error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/games
// @desc    Get all games (with pagination)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const games = await Game.find()
      .sort({ startTime: -1 })
      .limit(limit)
      .skip(skip)
      .select('-moves'); // Exclude moves array for performance

    const total = await Game.countDocuments();

    res.json({
      games,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalGames: total
    });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/games/:id
// @desc    Get a specific game by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/games/user/:username
// @desc    Get games by username
// @access  Public
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const games = await Game.find({
      $or: [
        { 'players.white': username },
        { 'players.black': username }
      ]
    })
      .sort({ startTime: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Game.countDocuments({
      $or: [
        { 'players.white': username },
        { 'players.black': username }
      ]
    });

    res.json({
      games,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalGames: total
    });
  } catch (error) {
    console.error('Get user games error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/games/:id
// @desc    Delete a game
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    await game.deleteOne();

    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
