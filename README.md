# ♟️ Chess Website

A full-featured chess game built with React, TypeScript, Node.js, and MongoDB, featuring local play, AI opponents, online multiplayer, user authentication, and competitive leaderboards.

## Features

✨ **Four Game Modes:**
- 🎮 **Local Hotseat**: Play with a friend on the same device
- 🤖 **AI Opponent (Stockfish)**: Challenge the powerful Stockfish engine with adjustable difficulty (0-20)
- 🧠 **Custom AI**: Play against a custom minimax-based AI (~1600-1800 ELO) with difficulty levels
- 🌐 **Online Multiplayer**: Play with friends over the internet using room codes

✨ **User System & Persistence:**
- 🔐 **User Authentication**: Register and login with JWT tokens
- 💾 **Game Saving**: All completed games automatically saved to MongoDB
- 🏆 **Global Leaderboard**: Compete with players worldwide, ranked by rating
- 📊 **Player Statistics**: Track wins, losses, draws, win rate, and current streak
- ⭐ **ELO Rating System**: Start at 1200 rating and climb the ranks

✨ **Complete Chess Features:**
- Full chess rules implementation (checkmate, stalemate, castling, en passant, promotion)
- Move history with timestamps
- Drag-and-drop piece movement with visual feedback
- Legal move highlighting
- Right-click square highlighting for analysis
- Undo moves (local & AI modes)
- Opening name detection and display
- Captured pieces display
- Sound effects for moves
- Multiple board themes
- Board flip option
- Chess clock with time controls
- Confetti animation on checkmate
- Responsive design for mobile and desktop

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **chess.js** for game logic and rules
- **react-chessboard** for the UI
- **socket.io-client** for real-time multiplayer
- **Axios** for HTTP requests

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Socket.IO** for WebSocket communication
- **express-validator** for input validation

### AI
- **Stockfish.js** running in a Web Worker (UCI protocol)
- **Custom Minimax AI** with alpha-beta pruning and position evaluation

### Database
- **MongoDB Atlas** (cloud-hosted NoSQL database)
- Collections: Users, Games
- Automatic statistics tracking

## Project Structure

```
chess_website/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   │   ├── stockfish.js   # Stockfish AI engine
│   │   └── models/        # AI training models
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Board.tsx           # Chessboard component
│   │   │   ├── MoveHistory.tsx     # Move list display
│   │   │   ├── GameControls.tsx    # Game buttons & status
│   │   │   ├── ChessClock.tsx      # Timer display
│   │   │   ├── CapturedPieces.tsx  # Captured pieces
│   │   │   ├── AuthModal.tsx       # Login/Register modal
│   │   │   └── Leaderboard.tsx     # Rankings display
│   │   ├── engine/        # Chess logic
│   │   │   └── GameEngine.ts       # chess.js wrapper
│   │   ├── services/      # External services
│   │   │   ├── stockfish.ts        # Stockfish AI service
│   │   │   ├── customai.ts         # Custom minimax AI
│   │   │   ├── socket.ts           # Socket.IO client
│   │   │   ├── auth.ts             # Authentication service
│   │   │   ├── gameAPI.ts          # Game saving API
│   │   │   ├── leaderboard.ts      # Leaderboard API
│   │   │   ├── sounds.ts           # Sound effects
│   │   │   ├── themes.ts           # Board themes
│   │   │   ├── openings.ts         # Opening detection
│   │   │   └── statistics.ts       # Local stats
│   │   ├── App.tsx        # Main application
│   │   ├── App.css        # Styles
│   │   └── main.tsx       # Entry point
│   └── package.json
├── server/                # Node.js backend
│   ├── config/
│   │   └── database.js    # MongoDB connection
│   ├── models/
│   │   ├── User.js        # User schema
│   │   └── Game.js        # Game schema
│   ├── routes/
│   │   ├── auth.js        # Authentication routes
│   │   ├── games.js       # Game management routes
│   │   └── leaderboard.js # Leaderboard routes
│   ├── middleware/
│   │   └── auth.js        # JWT authentication
│   ├── .env.example       # Environment variables template
│   ├── index.js           # Server entry point
│   └── package.json
├── ai-training/           # AI training notebooks (optional)
├── docs/                  # Documentation
├── .gitignore            # Git ignore rules
├── DEPLOYMENT.md         # Deployment guide
└── README.md             # This file
```

## Getting Started

### Prerequisites

- **Node.js** 16+ and npm
- Modern web browser with WebAssembly support

### Installation

#### 1. Install Client Dependencies

```powershell
cd client
npm install
```

#### 2. Install Server Dependencies

```powershell
cd ..\server
npm install
```

#### 3. Download Stockfish (for AI mode)

Download Stockfish.js from one of these sources:
- [nmrugg/stockfish.js](https://github.com/nmrugg/stockfish.js/) - Recommended
- [Official Stockfish WASM](https://github.com/lichess-org/stockfish.wasm)

Place the `stockfish.js` file (or `stockfish.wasm` + wrapper) in:
```
client/public/stockfish.js
```

### Running the Application

#### Development Mode

**Terminal 1 - Start the server:**
```powershell
cd server
npm run dev
# Server runs on http://localhost:3001
```

**Terminal 2 - Start the client:**
```powershell
cd client
npm run dev
# Client runs on http://localhost:3000
```

Open your browser to `http://localhost:3000`

#### Production Build

**Build the client:**
```powershell
cd client
npm run build
```

The built files will be in `client/dist/`. You can:
- Serve them with any static host (Netlify, Vercel, GitHub Pages)
- Serve from the Express server by adding static middleware

**Run production server:**
```powershell
cd server
npm start
```

## How to Play

### Local Mode (Hotseat)
1. Click "Play Local (Hotseat)"
2. Take turns moving pieces on the same device
3. White moves first

### AI Mode
1. Click "Play vs AI"
2. Choose your color (White or Black)
3. Set difficulty level (0 = easiest, 20 = hardest)
4. Click "Start Game"
5. Make your moves; AI responds automatically

### Online Multiplayer
1. **Host:** Click "Create Room" and share the Room ID with your friend
2. **Guest:** Enter the Room ID and click "Join Room"
3. Host plays as White, Guest plays as Black
4. Moves are synced in real-time

## Configuration

### Change Server URL (for deployment)

Edit `client/src/services/socket.ts`:
```typescript
constructor(serverUrl = 'https://your-server.com') {
  this.serverUrl = serverUrl;
}
```

### Adjust AI Settings

In `App.tsx`, modify the `getBestMove` call:
```typescript
stockfish.getBestMove(gameEngine.getFEN(), { 
  skillLevel: aiDifficulty,  // 0-20
  movetime: 1000             // milliseconds
  // OR use depth: 10        // search depth
});
```

### Server Port

Edit `server/index.js`:
```javascript
const PORT = process.env.PORT || 3001;
```

## Deployment

### Deploy Server

**Option 1: Render / Railway / Heroku**
1. Create account on hosting platform
2. Connect your Git repository
3. Set build command: (none needed)
4. Set start command: `node server/index.js`
5. Set PORT environment variable (auto-configured on most platforms)

**Option 2: VPS (DigitalOcean, Linode, AWS EC2)**
```bash
# SSH into server
git clone <your-repo>
cd chess_website/server
npm install
npm install -g pm2
pm2 start index.js --name chess-server
pm2 startup
pm2 save
```

### Deploy Client

**Option 1: Netlify / Vercel (recommended)**
1. Connect Git repository
2. Set build directory: `client`
3. Set build command: `npm run build`
4. Set publish directory: `client/dist`
5. Deploy!

**Option 2: Static Hosting**
```powershell
cd client
npm run build
# Upload contents of dist/ to your hosting
```

**Option 3: Serve from Express**

Add to `server/index.js`:
```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

## Troubleshooting

### AI Not Working

**Problem**: "AI engine failed to load"

**Solutions**:
1. Ensure `stockfish.js` is in `client/public/` folder
2. Check browser console for 404 errors
3. Verify stockfish.js is a Web Worker compatible version
4. Try a different Stockfish build (WASM vs JS)

### Online Mode Connection Issues

**Problem**: Can't connect to server or join rooms

**Solutions**:
1. Verify server is running: `http://localhost:3001/health`
2. Check CORS settings in `server/index.js`
3. Update server URL in `client/src/services/socket.ts`
4. Check browser console for WebSocket errors
5. Ensure firewall allows WebSocket connections

### Build Errors

**Problem**: TypeScript compilation errors

**Solutions**:
```powershell
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

### Performance Issues

**Solutions**:
1. Reduce AI difficulty level
2. Increase AI `movetime` for slower but better moves
3. Check browser console for errors
4. Close other tabs/applications

## Development

### Adding New Features

**Add a custom chess variant:**
1. Modify `GameEngine.ts` to handle special rules
2. Update move validation in `Board.tsx`
3. Add UI controls in `App.tsx`

**Add move timers:**
1. Create a `Timer` component
2. Add timer state to `App.tsx`
3. Integrate with game logic to end game on timeout

**Add move sound effects:**
1. Add audio files to `public/`
2. Play sounds in `makeMove()` callback
3. Different sounds for capture, check, castle, etc.

### Testing

Run the linter:
```powershell
cd client
npm run lint
```

Test server health:
```powershell
curl http://localhost:3001/health
```

## API Reference

### GameEngine API

```typescript
const engine = new GameEngine();

// Game control
engine.newGame()                    // Start new game
engine.loadFEN(fen: string)         // Load position from FEN
engine.makeMove(move)               // Make a move
engine.undo()                       // Undo last move

// Game state
engine.getFEN()                     // Get current FEN
engine.getPGN()                     // Get PGN notation
engine.history()                    // Get move list
engine.turn()                       // Get current turn ('w' or 'b')

// Game status
engine.isGameOver()                 // Check if game ended
engine.isCheckmate()                // Check for checkmate
engine.isStalemate()                // Check for stalemate
engine.isDraw()                     // Check for draw
engine.inCheck()                    // Check if in check
engine.getGameStatus()              // Get status message

// Move validation
engine.getLegalMoves(square?)       // Get legal moves
engine.isMoveLegal(from, to, promo) // Validate a move
```

### Socket.IO Events

**Client → Server:**
- `createRoom` - Create a new game room
- `joinRoom` - Join existing room
- `move` - Send a move to opponent

**Server → Client:**
- `move` - Receive opponent's move
- `roomFull` - Both players connected
- `opponentDisconnected` - Opponent left

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or building your own chess application!

## Credits

- Chess rules: [chess.js](https://github.com/jhlywa/chess.js)
- Chessboard UI: [react-chessboard](https://github.com/Clariity/react-chessboard)
- Chess engine: [Stockfish](https://stockfishchess.org/)
- Icons: Unicode chess symbols

## Roadmap

Future enhancements:
- [ ] Move timers (blitz, rapid, classical)
- [ ] Game analysis with Stockfish
- [ ] Save/load games (PGN import/export)
- [ ] User accounts and ELO ratings
- [ ] Spectator mode
- [ ] Game chat
- [ ] Move annotations
- [ ] Opening book hints
- [ ] Puzzle mode
- [ ] Tournament mode

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Search existing GitHub issues
3. Create a new issue with details about your problem

---

**Happy Chess Playing! ♟️**
