# Chess Website Architecture

This document explains the technical architecture of the chess website.

## System Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Browser A     │◄───────►│  Socket.IO      │◄───────►│   Browser B     │
│   (React App)   │   WS    │  Server         │   WS    │   (React App)   │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                                                         │
        │                                                         │
        ▼                                                         ▼
┌─────────────────┐                                     ┌─────────────────┐
│ Stockfish.js    │                                     │ Stockfish.js    │
│ (Web Worker)    │                                     │ (Web Worker)    │
└─────────────────┘                                     └─────────────────┘
```

## Frontend Architecture

### Technology Choices

**React + TypeScript**
- Component-based architecture for maintainability
- Type safety prevents runtime errors
- Fast development with hot module reload (Vite)

**chess.js**
- Battle-tested chess rules engine
- Handles all move validation, check/checkmate detection
- FEN/PGN support for game state serialization

**react-chessboard**
- Pre-built chessboard UI with drag-and-drop
- Customizable styling and piece sets
- Responsive design

**socket.io-client**
- WebSocket wrapper with automatic reconnection
- Event-based API for real-time communication
- Fallback to long polling if WebSocket unavailable

### Component Hierarchy

```
App
├── Menu Screen (gameMode === 'menu')
│   ├── Local Play Button
│   ├── AI Play Button
│   └── Online Play Section
│       ├── Create Room Button
│       └── Join Room Input + Button
│
├── AI Setup Screen (gameMode === 'ai' && no moves)
│   ├── Color Selection
│   ├── Difficulty Slider
│   └── Start Button
│
└── Game Screen (gameMode in ['local', 'ai', 'online'])
    ├── Header (title + back button)
    ├── Room Info (online mode only)
    ├── AI Thinking Indicator (AI mode only)
    └── Game Layout
        ├── Board Component
        │   ├── Chessboard (react-chessboard)
        │   └── Promotion Dialog (when needed)
        └── Sidebar
            ├── GameControls
            │   ├── Status Display
            │   ├── New Game Button
            │   ├── Undo Button (local/AI)
            │   └── Resign Button (online)
            └── MoveHistory
                └── Move List (PGN format)
```

### State Management

State is managed using React hooks (useState, useEffect, useCallback):

**Game State:**
- `gameEngine` - Instance of GameEngine class (chess.js wrapper)
- `position` - Current board position (FEN string)
- `gameStatus` - Human-readable game status message
- `moveHistory` - Array of moves in SAN notation

**Mode State:**
- `gameMode` - Current mode: 'menu' | 'local' | 'ai' | 'online'
- `playerColor` - Player's color in AI/online modes
- `isAiThinking` - Whether AI is calculating
- `roomInfo` - Room ID and assigned color for online play

**UI State:**
- `pendingMove` - Pending pawn promotion move
- `showPromotionDialog` - Show/hide promotion piece selector

### Data Flow

**Local Mode:**
```
User drags piece → handlePieceDrop → makeMove → gameEngine.makeMove()
                                    ↓
                          updateGameState() → React re-renders
```

**AI Mode:**
```
User drags piece → handlePieceDrop → makeMove → gameEngine.makeMove()
                                    ↓
                          updateGameState() → React re-renders
                                    ↓
                          useEffect detects AI turn
                                    ↓
                          Stockfish.getBestMove()
                                    ↓
                          makeMove(AI's move) → React re-renders
```

**Online Mode:**
```
Player A: User drags piece → handlePieceDrop → makeMove → gameEngine.makeMove()
                                              ↓
                                    socketService.sendMove()
                                              ↓
                                    Server relays to Player B
                                              ↓
Player B: socketService.onMove() → makeMove → gameEngine.makeMove()
                                              ↓
                                    updateGameState() → React re-renders
```

## GameEngine Architecture

The `GameEngine` class wraps `chess.js` to provide a clean, typed API:

```typescript
class GameEngine {
  private chess: Chess;
  
  // Core operations
  newGame(): void
  loadFEN(fen: string): boolean
  makeMove(move): Move | null
  undo(): Move | null
  
  // State queries
  getFEN(): string
  getPGN(): string
  getLegalMoves(square?): Move[]
  history(): string[]
  
  // Game status
  isGameOver(): boolean
  isCheckmate(): boolean
  isStalemate(): boolean
  isDraw(): boolean
  inCheck(): boolean
  turn(): 'w' | 'b'
  getGameStatus(): string
}
```

**Design Principles:**
- Single source of truth (one Chess instance)
- Immutable API (operations return new state)
- Fail-safe (invalid moves return null, not exceptions)
- Validation at the boundary (all moves validated before applying)

## AI Architecture (Stockfish)

### Web Worker Pattern

Stockfish runs in a Web Worker to prevent UI blocking:

```
Main Thread                    Worker Thread
    │                               │
    │  new Worker('stockfish.js')   │
    ├──────────────────────────────►│
    │                               │ Load Stockfish WASM
    │                               │
    │  postMessage('uci')           │
    ├──────────────────────────────►│
    │                               │ Initialize UCI
    │  ◄──────────────────────────┤│
    │        'uciok'                │
    │                               │
    │  postMessage('position...')   │
    ├──────────────────────────────►│
    │  postMessage('go movetime')   │
    ├──────────────────────────────►│
    │                               │ Calculate best move
    │                               │ (CPU intensive)
    │  ◄──────────────────────────┤│
    │     'bestmove e2e4'           │
    │                               │
```

### UCI Protocol

Stockfish uses the Universal Chess Interface (UCI) protocol:

**Commands (Main → Worker):**
- `uci` - Initialize engine
- `setoption name <name> value <value>` - Set engine parameters
- `position fen <fen>` - Set board position
- `go depth <n>` - Calculate to depth n
- `go movetime <ms>` - Calculate for ms milliseconds
- `stop` - Stop calculating

**Responses (Worker → Main):**
- `uciok` - Engine ready
- `bestmove <move>` - Best move found (e.g., "e2e4" or "e7e8q")
- `info depth <n> score <score>` - Search info (optional)

### Difficulty Tuning

Difficulty is controlled via:
1. **Skill Level** (0-20): Built-in Stockfish parameter that adds randomness
2. **Move Time**: Less time = weaker play
3. **Search Depth**: Shallow depth = weaker play

```typescript
stockfish.getBestMove(fen, {
  skillLevel: 5,    // 0 = beginner, 20 = master
  movetime: 1000,   // 1 second to think
  // or
  depth: 10         // search 10 moves ahead
});
```

## Backend Architecture (Socket.IO Server)

### Server Design

Simple, stateless relay server with in-memory room storage:

```javascript
const rooms = new Map(); // roomId → { players, fen, createdAt }

io.on('connection', (socket) => {
  socket.on('createRoom', callback)
  socket.on('joinRoom', callback)
  socket.on('move', data)
  socket.on('disconnect')
});
```

**Design Decisions:**
- **Stateless**: No database, rooms stored in memory
- **Ephemeral**: Rooms deleted after disconnect or timeout
- **Trust-based**: Move validation on client (could add server validation)
- **Simple**: No authentication, no persistence

### Room Lifecycle

```
1. Player A creates room
   └─> Server generates 6-char room ID (e.g., "ABC123")
   └─> Stores room: { players: [socketA], fen: startingPosition }

2. Player B joins room
   └─> Server adds to players array
   └─> Emits 'roomFull' to both players
   └─> Sends current FEN to Player B

3. Players exchange moves
   └─> Player A emits 'move'
   └─> Server relays to Player B via socket.to(roomId).emit()

4. Player disconnects
   └─> Server emits 'opponentDisconnected' to other player
   └─> Room deleted from memory
```

### Scalability Considerations

Current implementation:
- ✅ Good for 1-100 concurrent games
- ✅ Low latency (WebSocket)
- ✅ Simple deployment

Limitations:
- ❌ Rooms lost on server restart
- ❌ Can't scale horizontally (no shared state)
- ❌ No game history/replay

To scale:
1. Add Redis for shared room state (multi-server)
2. Add database for game persistence
3. Add authentication for user accounts
4. Implement sticky sessions or Redis adapter for Socket.IO

## Security Considerations

### Current Security

**Client-side validation:**
- All moves validated by chess.js before applying
- Only legal moves can be made

**Server relay:**
- Minimal state (just room membership)
- No sensitive data stored

**CORS:**
- Configured to allow localhost development
- Update for production domains

### Potential Vulnerabilities

⚠️ **Cheating via modified client:**
- Attacker could modify client code to make illegal moves
- Mitigation: Add server-side move validation

⚠️ **Room flooding:**
- Attacker could create many rooms
- Mitigation: Rate limiting, room limits per IP

⚠️ **Replay attacks:**
- Attacker could resend captured moves
- Mitigation: Add move sequence numbers

⚠️ **XSS in room IDs:**
- Room IDs are displayed in UI
- Mitigation: Sanitize user input (currently using server-generated IDs only)

### Recommended Improvements

For production:
1. **Server-side move validation** - Verify all moves with chess.js on server
2. **Rate limiting** - Limit room creation and move frequency
3. **Authentication** - Add user accounts (Firebase, Auth0, etc.)
4. **HTTPS/WSS** - Encrypt all traffic
5. **Input sanitization** - Validate and sanitize all user input
6. **Session tokens** - Prevent unauthorized room access

## Performance Optimizations

### Current Optimizations

1. **Web Worker for AI** - Keeps UI responsive during calculation
2. **React memoization** - useCallback prevents unnecessary re-renders
3. **Vite build** - Fast builds, code splitting, tree shaking
4. **Lazy loading** - Stockfish only loaded when AI mode selected

### Potential Improvements

1. **Move animation** - Add CSS transitions for piece movement
2. **Debounce updates** - Batch rapid state changes
3. **Service Worker** - Cache assets for offline play
4. **WebAssembly Stockfish** - Faster than JavaScript version
5. **Piece preloading** - Preload images to prevent flash
6. **Virtual scrolling** - For very long move histories

## Testing Strategy

### Unit Tests (Recommended)

```typescript
// GameEngine tests
describe('GameEngine', () => {
  test('detects checkmate', () => {
    const engine = new GameEngine();
    engine.loadFEN('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3');
    expect(engine.isCheckmate()).toBe(true);
  });
  
  test('rejects illegal moves', () => {
    const engine = new GameEngine();
    const result = engine.makeMove({ from: 'e2', to: 'e5' });
    expect(result).toBeNull();
  });
});
```

### Integration Tests

1. **Local play** - Make a sequence of moves, verify position
2. **AI play** - Ensure AI responds within timeout
3. **Multiplayer** - Open two browser windows, verify move sync

### Manual Testing Checklist

- [ ] All three game modes work
- [ ] Checkmate detected correctly
- [ ] Stalemate detected correctly
- [ ] Pawn promotion works
- [ ] Castling works (both sides)
- [ ] En passant works
- [ ] Move history displays correctly
- [ ] Undo works in local/AI modes
- [ ] AI makes legal moves
- [ ] Online sync works
- [ ] Disconnect handling works
- [ ] Mobile responsive

## Deployment Architecture

### Development
```
localhost:3000 (Vite dev server)  →  localhost:3001 (Node server)
```

### Production (Separate hosts)
```
https://chess-app.netlify.app (Static React)  →  https://chess-server.onrender.com (Node server)
```

### Production (Single host)
```
https://chess-app.com
└─> Express serves React build
└─> Socket.IO on same server
```

**Pros of separate:**
- Independent scaling
- CDN for static assets
- Separate deployment pipelines

**Pros of single:**
- Simpler CORS
- One deployment
- Lower cost

## Future Architecture Improvements

### Database Layer
```
PostgreSQL / MongoDB
  ├── users (id, email, elo)
  ├── games (id, pgn, result, timestamp)
  └── rooms (id, players, status)
```

### Authentication
```
Firebase Auth / Auth0
  └── JWT tokens for API requests
```

### Game Analysis
```
Stockfish Worker Pool
  ├── Worker 1 (ongoing games)
  ├── Worker 2 (analysis requests)
  └── Worker 3 (puzzle generation)
```

### Microservices
```
API Gateway (GraphQL/REST)
  ├── Game Service (moves, validation)
  ├── User Service (profiles, ELO)
  ├── Match Service (matchmaking)
  └── Analysis Service (Stockfish)
```

---

**This architecture provides a solid foundation for a production chess application while remaining simple enough for learning and experimentation.**
