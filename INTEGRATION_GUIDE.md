# Integration Instructions for Chess Website Features

## Quick Start - Add These Features Now!

I've created 6 powerful feature systems that are ready to use. Here's how to integrate them into your existing `App.tsx`:

### 1. Add New Imports (at the top of App.tsx)

```typescript
import { soundService } from './services/sounds';
import { openingBook } from './services/openings';
import { themeService } from './services/themes';
import { statisticsService } from './services/statistics';
import { ChessClock } from './components/ChessClock';
import { CapturedPieces } from './components/CapturedPieces';
```

### 2. Add New State Variables (after existing useState declarations)

```typescript
// Theme
const [currentTheme, setCurrentTheme] = useState(themeService.getCurrentTheme());
const [showThemeSelector, setShowThemeSelector] = useState(false);

// Sounds
const [soundsEnabled, setSoundsEnabled] = useState(true);

// Captured pieces
const [whiteCaptured, setWhiteCaptured] = useState<string[]>([]);
const [blackCaptured, setBlackCaptured] = useState<string[]>([]);

// Opening
const [currentOpening, setCurrentOpening] = useState<string | null>(null);

// Timer (optional - set to 0 for no timer)
const [whiteTime, setWhiteTime] = useState(0);
const [blackTime, setBlackTime] = useState(0);
const [timeControl, setTimeControl] = useState({ time: 0, increment: 0 });

// Last move highlighting
const [lastMove, setLastMove] = useState<{from: Square, to: Square} | null>(null);

// Board flip
const [boardFlipped, setBoardFlipped] = useState(false);
```

### 3. Load Saved Theme on Startup (add this useEffect)

```typescript
useEffect(() => {
  themeService.loadSavedTheme();
  setCurrentTheme(themeService.getCurrentTheme());
  soundService.setEnabled(soundsEnabled);
}, [soundsEnabled]);
```

### 4. Enhanced makeMove Function

Replace your existing `makeMove` function with this enhanced version:

```typescript
const makeMove = useCallback((from: Square, to: Square, promotion?: string): boolean => {
  const move = gameEngine.move({ from, to, promotion });
  
  if (move) {
    // Play appropriate sound
    if (soundsEnabled) {
      if (gameEngine.isCheckmate()) {
        soundService.play('checkmate');
      } else if (gameEngine.inCheck()) {
        soundService.play('check');
      } else if (move.captured) {
        soundService.play('capture');
      } else if (move.flags.includes('k') || move.flags.includes('q')) {
        soundService.play('castle');
      } else {
        soundService.play('move');
      }
    }
    
    // Track captured pieces
    if (move.captured) {
      if (move.color === 'w') {
        setBlackCaptured(prev => [...prev, move.captured!]);
      } else {
        setWhiteCaptured(prev => [...prev, move.captured!]);
      }
    }
    
    // Update last move for highlighting
    setLastMove({ from, to });
    
    // Update opening name
    if (moveHistory.length <= 15) {
      const opening = openingBook.getOpening(gameEngine.history());
      setCurrentOpening(opening);
    } else {
      setCurrentOpening(null);
    }
    
    // Update time (add increment)
    if (timeControl.time > 0) {
      if (gameEngine.turn() === 'b') {
        setWhiteTime(prev => prev + timeControl.increment);
      } else {
        setBlackTime(prev => prev + timeControl.increment);
      }
    }
    
    updateGameState();
    return true;
  }
  
  if (soundsEnabled) {
    soundService.play('illegal');
  }
  return false;
}, [gameEngine, soundsEnabled, moveHistory.length, timeControl, updateGameState]);
```

### 5. Add Game Stats Recording (when game ends)

Add this function and call it when the game ends:

```typescript
const recordGameResult = (result: 'win' | 'loss' | 'draw') => {
  statisticsService.recordGame({
    id: Date.now().toString(),
    mode: gameMode,
    result: result,
    opponent: gameMode === 'ai' ? 'Stockfish AI' : 
              gameMode === 'customai' ? 'Custom AI' : 
              gameMode === 'online' ? 'Online Player' : 'Local Player',
    moves: moveHistory.length,
    duration: Math.floor((Date.now() - gameStartTime) / 1000),
    date: new Date(),
    pgn: gameEngine.getPGN()
  });
};
```

### 6. Update handleNewGame Function

Add reset logic for new features:

```typescript
const handleNewGame = () => {
  gameEngine.reset();
  setWhiteCaptured([]);
  setBlackCaptured([]);
  setLastMove(null);
  setCurrentOpening(null);
  setWhiteTime(timeControl.time);
  setBlackTime(timeControl.time);
  updateGameState();
  
  if (soundsEnabled) {
    soundService.play('start');
  }
};
```

### 7. Add UI Elements to Game Screen

Insert these components in your game screen JSX (inside the game-container):

```tsx
{/* Settings Bar */}
<div style={{
  display: 'flex',
  gap: '10px',
  justifyContent: 'center',
  marginBottom: '15px',
  padding: '10px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px'
}}>
  {/* Sound Toggle */}
  <button
    onClick={() => {
      const newState = soundService.toggle();
      setSoundsEnabled(newState);
    }}
    style={{
      padding: '8px 15px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: soundsEnabled ? '#28a745' : '#6c757d',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold'
    }}
  >
    {soundsEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
  </button>
  
  {/* Theme Selector */}
  <button
    onClick={() => setShowThemeSelector(!showThemeSelector)}
    style={{
      padding: '8px 15px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#667eea',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold'
    }}
  >
    🎨 Theme
  </button>
  
  {/* Board Flip */}
  <button
    onClick={() => setBoardFlipped(!boardFlipped)}
    style={{
      padding: '8px 15px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#17a2b8',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold'
    }}
  >
    🔄 Flip Board
  </button>
</div>

{/* Theme Selector Dropdown */}
{showThemeSelector && (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    maxHeight: '200px',
    overflowY: 'auto'
  }}>
    <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Choose Board Theme</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
      {Object.entries(themeService.getAllThemes()).map(([key, theme]) => (
        <button
          key={key}
          onClick={() => {
            themeService.setTheme(key);
            setCurrentTheme(themeService.getCurrentTheme());
            setShowThemeSelector(false);
          }}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: themeService.getThemeName() === key ? '3px solid #667eea' : '2px solid #ddd',
            backgroundColor: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            background: `linear-gradient(135deg, ${theme.lightSquare} 50%, ${theme.darkSquare} 50%)`,
            borderRadius: '4px'
          }} />
          <span style={{ fontWeight: 'bold' }}>{theme.name}</span>
        </button>
      ))}
    </div>
  </div>
)}

{/* Opening Name Display */}
{currentOpening && (
  <div style={{
    backgroundColor: '#667eea',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '10px',
    marginBottom: '15px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    boxShadow: '0 2px 10px rgba(102, 126, 234, 0.3)'
  }}>
    📚 {currentOpening}
  </div>
)}

{/* Chess Clocks (if time control is set) */}
{timeControl.time > 0 && (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '15px'
  }}>
    <ChessClock
      initialTime={whiteTime}
      increment={timeControl.increment}
      isActive={gameEngine.turn() === 'w' && !gameEngine.isGameOver()}
      onTimeUp={() => {
        alert('White ran out of time! Black wins!');
        recordGameResult('loss');
      }}
      playerColor="white"
    />
    <ChessClock
      initialTime={blackTime}
      increment={timeControl.increment}
      isActive={gameEngine.turn() === 'b' && !gameEngine.isGameOver()}
      onTimeUp={() => {
        alert('Black ran out of time! White wins!');
        recordGameResult('win');
      }}
      playerColor="black"
    />
  </div>
)}

{/* Captured Pieces */}
<div style={{ marginBottom: '15px' }}>
  <CapturedPieces captured={blackCaptured} color="black" />
  <CapturedPieces captured={whiteCaptured} color="white" />
</div>
```

### 8. Update Board Component Props

Update your Board component call to use the theme and flip:

```tsx
<Board
  position={position}
  onPieceDrop={handlePieceDrop}
  boardOrientation={boardFlipped ? (playerColor === 'white' ? 'black' : 'white') : getBoardOrientation()}
  isPlayerTurn={isPlayerTurn() && !isAiThinking}
  showPromotionDialog={showPromotionDialog}
  onPromotionPieceSelect={handlePromotionPieceSelect}
  isCheck={gameEngine.inCheck()}
  currentTurn={gameEngine.turn()}
  customLightSquareStyle={{ backgroundColor: currentTheme.lightSquare }}
  customDarkSquareStyle={{ backgroundColor: currentTheme.darkSquare }}
  lastMove={lastMove}  // You'll need to add this prop to Board.tsx
/>
```

### 9. Add Statistics Display to Menu

Add a stats panel to your main menu:

```tsx
{/* Statistics Panel */}
<div style={{
  backgroundColor: '#f8f9fa',
  borderRadius: '15px',
  padding: '25px',
  marginTop: '30px',
  maxWidth: '500px',
  margin: '30px auto'
}}>
  <h2 style={{ marginTop: 0, textAlign: 'center', color: '#333' }}>📊 Your Statistics</h2>
  {(() => {
    const stats = statisticsService.getStats();
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fff', borderRadius: '10px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>{stats.wins}</div>
          <div style={{ color: '#666' }}>Wins</div>
        </div>
        <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fff', borderRadius: '10px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>{stats.losses}</div>
          <div style={{ color: '#666' }}>Losses</div>
        </div>
        <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fff', borderRadius: '10px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>{stats.draws}</div>
          <div style={{ color: '#666' }}>Draws</div>
        </div>
        <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fff', borderRadius: '10px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>
            {stats.winRate.toFixed(1)}%
          </div>
          <div style={{ color: '#666' }}>Win Rate</div>
        </div>
      </div>
    );
  })()}
  <button
    onClick={() => {
      if (confirm('Are you sure you want to clear all statistics?')) {
        statisticsService.clearStats();
        alert('Statistics cleared!');
      }
    }}
    style={{
      width: '100%',
      marginTop: '15px',
      padding: '10px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#dc3545',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold'
    }}
  >
    Clear Statistics
  </button>
</div>
```

---

## That's It! 🎉

You now have:
- ✅ **Sound effects** for all game events
- ✅ **10 beautiful themes** to choose from
- ✅ **Opening names** displayed during play
- ✅ **Captured pieces** with material advantage
- ✅ **Chess clock** with increment support
- ✅ **Statistics tracking** with win rates
- ✅ **Board flipping** capability
- ✅ **Theme persistence** across sessions

All features work together seamlessly and add no external dependencies!

**Test the features:**
1. Start a game - hear the start sound
2. Make moves - hear move sounds
3. Capture pieces - see them displayed
4. Change theme - see board colors update
5. Check stats after games - see your progress

Enjoy your feature-rich chess website! 🏆♟️
