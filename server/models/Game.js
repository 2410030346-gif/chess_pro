import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  players: {
    white: {
      type: String,
      required: true
    },
    black: {
      type: String,
      required: true
    }
  },
  moves: [{
    move: String,
    fen: String,
    timestamp: Date
  }],
  result: {
    type: String,
    enum: ['white', 'black', 'draw', 'ongoing'],
    default: 'ongoing'
  },
  gameMode: {
    type: String,
    enum: ['local', 'ai', 'customai', 'online'],
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  finalFEN: String
});

export default mongoose.model('Game', gameSchema);
