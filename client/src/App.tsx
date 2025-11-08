import { useState, useEffect, useCallback } from 'react';
import { Square } from 'chess.js';
import { Board } from './components/Board';
import { MoveHistory } from './components/MoveHistory';
import { GameControls } from './components/GameControls';
import { ChessClock } from './components/ChessClock';
import { CapturedPieces } from './components/CapturedPieces';
import { AuthModal } from './components/AuthModal';
import { Leaderboard } from './components/Leaderboard';
import { GameEngine } from './engine/GameEngine';
import { getStockfishService } from './services/stockfish';
import { customAI } from './services/customai';
import { getSocketService, RoomInfo } from './services/socket';
import { soundService } from './services/sounds';
import { openingBook } from './services/openings';
import { boardThemes, themeService } from './services/themes';
import { statisticsService, PlayerStats } from './services/statistics';
import { authService } from './services/auth';
import { gameAPI } from './services/gameAPI';
import './App.css';

type GameMode = 'menu' | 'local' | 'ai' | 'customai' | 'online';
type PlayerColor = 'white' | 'black';

function App() {
  const [gameEngine] = useState(() => new GameEngine());
  const [position, setPosition] = useState(gameEngine.getFEN());
  const [gameStatus, setGameStatus] = useState(gameEngine.getGameStatus());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [showSplash, setShowSplash] = useState(false);
  
  // Authentication state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // AI mode state
  const [aiDifficulty, setAiDifficulty] = useState<number>(5);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [playerColor, setPlayerColor] = useState<PlayerColor>('white');
  const [aiGameStarted, setAiGameStarted] = useState(false);
  
  // Online mode state
  const [roomId, setRoomId] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);

  // Promotion state
  const [pendingMove, setPendingMove] = useState<{ from: Square; to: Square } | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);

  // Feature state - Sound, Theme, Clock, Stats
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(() => {
    themeService.loadSavedTheme();
    return themeService.getThemeName();
  });
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[]; black: string[] }>({ white: [], black: [] });
  const [currentOpening, setCurrentOpening] = useState<string>('');
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  
  // Chess clock state
  const [whiteTime, setWhiteTime] = useState(600); // 10 minutes in seconds
  const [blackTime, setBlackTime] = useState(600);
  const [timeIncrement, setTimeIncrement] = useState(0); // seconds per move
  const [clockActive, setClockActive] = useState(false);
  
  // Stats
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => statisticsService.getStats());
  const [showStats, setShowStats] = useState(false);

  // Handle splash screen keyboard skip
  useEffect(() => {
    if (showSplash) {
      const handleKeyPress = () => setShowSplash(false);
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [showSplash]);

  const updateGameState = useCallback(() => {
    setPosition(gameEngine.getFEN());
    setGameStatus(gameEngine.getGameStatus());
    setMoveHistory(gameEngine.history());
  }, [gameEngine]);

  const makeMove = useCallback((from: Square, to: Square, promotion?: string) => {
    const move = gameEngine.makeMove({ from, to, promotion });
    if (move) {
      // Update last move
      setLastMove({ from, to });
      
      // Play sound based on move type
      if (soundEnabled) {
        if (move.captured) {
          soundService.play('capture');
        } else if (move.flags.includes('k') || move.flags.includes('q')) {
          soundService.play('castle');
        } else {
          soundService.play('move');
        }
      }
      
      // Update captured pieces
      if (move.captured) {
        const capturedPiece = move.captured;
        const capturedColor = move.color === 'w' ? 'black' : 'white';
        setCapturedPieces(prev => ({
          ...prev,
          [capturedColor]: [...prev[capturedColor], capturedPiece]
        }));
      }
      
      // Update opening name
      const history = gameEngine.history();
      if (openingBook.isInOpening(history.length)) {
        const opening = openingBook.getOpening(history);
        if (opening) {
          setCurrentOpening(opening);
        }
      } else if (history.length > 15) {
        setCurrentOpening(''); // Clear opening after move 15
      }
      
      updateGameState();
      
      // Check for check or checkmate
      if (soundEnabled) {
        setTimeout(() => {
          if (gameEngine.isCheckmate()) {
            soundService.play('checkmate');
          } else if (gameEngine.inCheck()) {
            soundService.play('check');
          }
        }, 100);
      }
      
      // Start clock on first move
      if (history.length === 1) {
        setClockActive(true);
        if (soundEnabled) {
          soundService.play('start');
        }
      }
      
      // Send move to opponent in online mode
      if (gameMode === 'online' && roomInfo) {
        const socketService = getSocketService();
        socketService.sendMove(roomInfo.roomId, { from, to, promotion });
      }
      
      return true;
    } else {
      // Play illegal move sound
      if (soundEnabled) {
        soundService.play('illegal');
      }
    }
    return false;
  }, [gameEngine, updateGameState, gameMode, roomInfo, soundEnabled, openingBook]);

  const handlePieceDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
    // Check if this is a pawn promotion
    const moves = gameEngine.getLegalMoves(sourceSquare);
    const promotionMove = moves.find(m => m.from === sourceSquare && m.to === targetSquare && m.promotion);
    
    if (promotionMove) {
      setPendingMove({ from: sourceSquare, to: targetSquare });
      setShowPromotionDialog(true);
      return false; // Don't make the move yet, wait for promotion choice
    }

    return makeMove(sourceSquare, targetSquare);
  };

  const handlePromotionPieceSelect = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (pendingMove) {
      makeMove(pendingMove.from, pendingMove.to, piece);
      setPendingMove(null);
      setShowPromotionDialog(false);
    }
  };

  const handleNewGame = () => {
    gameEngine.newGame();
    updateGameState();
    setIsAiThinking(false);
    setAiGameStarted(false);
    
    // Reset feature states
    setLastMove(null);
    setCapturedPieces({ white: [], black: [] });
    setCurrentOpening('');
    setClockActive(false);
    setWhiteTime(600);
    setBlackTime(600);
    
    // Play game start sound
    if (soundEnabled) {
      soundService.play('start');
    }
  };

  const handleUndo = () => {
    gameEngine.undo();
    if (gameMode === 'ai') {
      gameEngine.undo(); // Undo AI move too
    }
    updateGameState();
  };

  const handleBackToMenu = () => {
    handleNewGame();
    setGameMode('menu');
    setIsConnected(false);
    setRoomInfo(null);
    setAiGameStarted(false);
    const socketService = getSocketService();
    socketService.disconnect();
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const user = authService.getUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Authentication handlers
  const handleLogin = async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setCurrentUser(user);
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    const user = await authService.register(username, email, password);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Save game when it ends
  useEffect(() => {
    const saveGameIfEnded = async () => {
      if (gameEngine.isGameOver() && moveHistory.length > 0) {
        const result = gameEngine.isCheckmate() 
          ? (gameEngine.turn() === 'w' ? 'black' : 'white')
          : 'draw';

        const playerWhite = currentUser?.username || 'Player1';
        const playerBlack = gameMode === 'ai' || gameMode === 'customai' 
          ? 'Computer'
          : gameMode === 'online' && roomInfo
          ? 'Opponent'
          : 'Player2';

        try {
          await gameAPI.saveGame({
            players: {
              white: playerColor === 'white' ? playerWhite : playerBlack,
              black: playerColor === 'white' ? playerBlack : playerWhite
            },
            moves: moveHistory.map((move) => ({
              move,
              fen: gameEngine.getFEN(),
              timestamp: new Date()
            })),
            result,
            gameMode: gameMode as any,
            finalFEN: gameEngine.getFEN()
          }, authService.getToken() || undefined);

          console.log('✅ Game saved to database!');
        } catch (error) {
          console.error('Failed to save game:', error);
        }
      }
    };

    saveGameIfEnded();
  }, [gameEngine.isGameOver(), moveHistory.length]);

  // AI move logic
  useEffect(() => {
    // Only trigger AI if game has started AND at least one move has been made (or AI plays first as black)
    const shouldAiMove = gameMode === 'ai' && aiGameStarted && !gameEngine.isGameOver();
    
    if (shouldAiMove) {
      const currentTurn = gameEngine.turn();
      const isAiTurn = (playerColor === 'white' && currentTurn === 'b') || 
                       (playerColor === 'black' && currentTurn === 'w');
      
      // If player is black and it's the first move (white's turn), AI should move first
      const isFirstMove = moveHistory.length === 0;
      const aiMovesFirst = playerColor === 'black' && isFirstMove && currentTurn === 'w';

      if ((isAiTurn || aiMovesFirst) && !isAiThinking) {
        setIsAiThinking(true);
        
        const stockfish = getStockfishService();
        if (!stockfish.ready()) {
          stockfish.init().then(() => {
            makeAiMove();
          }).catch(err => {
            console.error('Stockfish initialization failed:', err);
            alert('AI engine failed to load. Please ensure stockfish.js is in the public folder.');
            setIsAiThinking(false);
          });
        } else {
          makeAiMove();
        }
      }
    }

    function makeAiMove() {
      const stockfish = getStockfishService();
      stockfish.getBestMove(gameEngine.getFEN(), { 
        skillLevel: aiDifficulty,
        movetime: 1000 
      }).then(bestMove => {
        console.log('Stockfish move:', bestMove);
        // Parse UCI move format (e.g., "e2e4" or "e7e8q")
        const from = bestMove.substring(0, 2) as Square;
        const to = bestMove.substring(2, 4) as Square;
        const promotion = bestMove.length > 4 ? bestMove[4] : undefined;
        
        setTimeout(() => {
          makeMove(from, to, promotion);
          setIsAiThinking(false);
        }, 300); // Small delay for better UX
      }).catch(err => {
        console.error('❌ Stockfish error:', err);
        setIsAiThinking(false);
        alert('AI failed to calculate move: ' + err.message);
      });
    }
  }, [gameMode, playerColor, isAiThinking, aiDifficulty, aiGameStarted, moveHistory.length]);

  // Custom AI move logic
  useEffect(() => {
    // Only trigger AI if game has started AND at least one move has been made (or AI plays first as black)
    const shouldAiMove = gameMode === 'customai' && aiGameStarted && !gameEngine.isGameOver();
    
    if (shouldAiMove) {
      const currentTurn = gameEngine.turn();
      const isAiTurn = (playerColor === 'white' && currentTurn === 'b') || 
                       (playerColor === 'black' && currentTurn === 'w');
      
      // If player is black and it's the first move (white's turn), AI should move first
      const isFirstMove = moveHistory.length === 0;
      const aiMovesFirst = playerColor === 'black' && isFirstMove && currentTurn === 'w';

      console.log('🔍 CustomAI check - isAiTurn:', isAiTurn, 'isAiThinking:', isAiThinking, 'currentTurn:', currentTurn, 'playerColor:', playerColor, 'aiMovesFirst:', aiMovesFirst);

      if ((isAiTurn || aiMovesFirst) && !isAiThinking) {
        setIsAiThinking(true);
        
        console.log('🤖 Custom AI is thinking...');
        console.log('📍 Current position:', gameEngine.getFEN());
        console.log('⚙️ Difficulty level:', aiDifficulty);
        
        // Use setTimeout to allow UI to update before heavy calculation
        setTimeout(() => {
          customAI.getBestMove(gameEngine.getFEN(), aiDifficulty)
            .then(move => {
              console.log('🎯 Custom AI chose move:', move);
              // Parse move string (e.g., "e2e4" or "e7e8q")
              const from = move.substring(0, 2) as Square;
              const to = move.substring(2, 4) as Square;
              const promotion = move.length > 4 ? move[4] : undefined;
              
              console.log('📤 Making move:', { from, to, promotion });
              
              setTimeout(() => {
                const success = makeMove(from, to, promotion);
                console.log('✅ Move result:', success ? 'success' : 'failed');
                setIsAiThinking(false);
              }, 100);
            })
            .catch(err => {
              console.error('❌ Custom AI error:', err);
              setIsAiThinking(false);
              alert('Custom AI failed to calculate move. Check console for details.');
            });
        }, 50); // Small delay to allow UI to update
      }
    }
  }, [gameMode, playerColor, isAiThinking, aiGameStarted, moveHistory.length]);

  // Online mode - listen for opponent moves
  useEffect(() => {
    if (gameMode === 'online' && isConnected) {
      const socketService = getSocketService();
      
      socketService.onMove((move) => {
        makeMove(move.from as Square, move.to as Square, move.promotion);
      });

      socketService.onOpponentDisconnect(() => {
        alert('Opponent disconnected');
        handleBackToMenu();
      });
    }
  }, [gameMode, isConnected, makeMove]);

  const handleCreateRoom = async () => {
    try {
      const socketService = getSocketService();
      await socketService.connect();
      const info = await socketService.createRoom();
      setRoomInfo(info);
      setRoomId(info.roomId);
      setIsConnected(true);
      setPlayerColor('white');
      setGameMode('online');
      handleNewGame();
    } catch (error) {
      alert('Failed to create room: ' + error);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomInput.trim()) {
      alert('Please enter a room ID');
      return;
    }

    try {
      const socketService = getSocketService();
      await socketService.connect();
      const info = await socketService.joinRoom(roomInput);
      setRoomInfo(info);
      setRoomId(roomInput);
      setIsConnected(true);
      setPlayerColor('black');
      setGameMode('online');
      handleNewGame();
    } catch (error) {
      alert('Failed to join room: ' + error);
    }
  };

  const isPlayerTurn = () => {
    if (gameMode === 'local') return true;
    if (gameMode === 'ai' || gameMode === 'customai') {
      const currentTurn = gameEngine.turn();
      return (playerColor === 'white' && currentTurn === 'w') || 
             (playerColor === 'black' && currentTurn === 'b');
    }
    if (gameMode === 'online' && roomInfo) {
      const currentTurn = gameEngine.turn();
      return (roomInfo.playerColor === 'white' && currentTurn === 'w') || 
             (roomInfo.playerColor === 'black' && currentTurn === 'b');
    }
    return false;
  };

  const getBoardOrientation = (): 'white' | 'black' => {
    if (boardFlipped) {
      // Flip the board
      if (gameMode === 'ai' || gameMode === 'customai') return playerColor === 'white' ? 'black' : 'white';
      if (gameMode === 'online' && roomInfo) return roomInfo.playerColor === 'white' ? 'black' : 'white';
      return 'black';
    }
    
    if (gameMode === 'ai' || gameMode === 'customai') return playerColor;
    if (gameMode === 'online' && roomInfo) return roomInfo.playerColor;
    return 'white';
  };
  
  // Theme handlers
  const handleThemeChange = (themeName: string) => {
    themeService.setTheme(themeName);
    setCurrentTheme(themeName);
  };
  
  // Sound handler
  const toggleSound = () => {
    soundService.toggle();
    setSoundEnabled(!soundEnabled);
  };
  
  // Board flip handler
  const toggleBoardFlip = () => {
    setBoardFlipped(!boardFlipped);
  };
  
  // Clock handlers
  const handleWhiteTimeUp = () => {
    setClockActive(false);
    alert('White ran out of time! Black wins!');
  };
  
  const handleBlackTimeUp = () => {
    setClockActive(false);
    alert('Black ran out of time! White wins!');
  };

  // Get current theme colors
  const theme = boardThemes[currentTheme];

  // Splash Screen
  if (showSplash) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <div className="chess-pieces-animation">
            <span className="piece piece1">♔</span>
            <span className="piece piece2">♕</span>
            <span className="piece piece3">♖</span>
            <span className="piece piece4">♗</span>
            <span className="piece piece5">♘</span>
            <span className="piece piece6">♙</span>
          </div>
          
          <h1 className="splash-title">
            Chess <span className="pro-text">PRO</span>
          </h1>
          
          <p className="splash-subtitle">Master the Game of Kings</p>
          
          <div className="splash-features">
            <div className="feature-item">🎮 Multiple Game Modes</div>
            <div className="feature-item">🤖 AI Opponents</div>
            <div className="feature-item">🌐 Online Multiplayer</div>
          </div>
          
          <button 
            className="splash-button"
            onClick={() => setShowSplash(false)}
          >
            Start Playing
          </button>
          
          <div className="splash-footer">
            Press any key or click to continue
          </div>
        </div>
      </div>
    );
  }

  // Main menu
  if (gameMode === 'menu') {
    return (
      <div className="app">
        <div className="menu-container-pro">
          <div className="menu-header">
            <div className="logo-container">
              <span className="logo-icon">♔</span>
              <h1 className="menu-title">Chess <span className="pro-badge">PRO</span></h1>
            </div>
            <p className="menu-tagline">Master the Game of Kings</p>
            
            {/* Auth & Leaderboard Controls */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'center', 
              alignItems: 'center',
              marginTop: '20px'
            }}>
              <button
                onClick={() => setShowLeaderboard(true)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
              >
                🏆 Leaderboard
              </button>
              
              {currentUser ? (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{
                    padding: '12px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    👤 {currentUser.username} | ⭐ {currentUser.rating}
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '12px 24px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.6)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                  }}
                >
                  🔐 Login / Register
                </button>
              )}
            </div>
          </div>

          <div className="game-modes-grid">
            {/* Stats Button */}
            <button 
              className="stats-toggle-button"
              onClick={() => setShowStats(!showStats)}
            >
              📊 {showStats ? 'Hide' : 'Show'} Stats
            </button>

            {/* Stats Panel */}
            {showStats && (
              <div style={{
                position: 'absolute',
                top: '80px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.98)',
                border: '2px solid #667eea',
                borderRadius: '12px',
                padding: '20px',
                minWidth: '300px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                zIndex: 10
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📊 Your Statistics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ textAlign: 'center', padding: '15px', background: '#f0f9ff', borderRadius: '8px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4ade80' }}>{playerStats.wins}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Wins</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '15px', background: '#fff1f2', borderRadius: '8px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f87171' }}>{playerStats.losses}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Losses</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '15px', background: '#fef9c3', borderRadius: '8px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#facc15' }}>{playerStats.draws}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Draws</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '15px', background: '#f3e8ff', borderRadius: '8px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{playerStats.winRate.toFixed(1)}%</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Win Rate</div>
                  </div>
                </div>
                <div style={{ marginTop: '15px', padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    🔥 Current Streak: <strong>{playerStats.currentStreak}</strong>
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    ⭐ Best Streak: <strong>{playerStats.bestStreak}</strong>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all statistics?')) {
                      statisticsService.clearStats();
                      setPlayerStats(statisticsService.getStats());
                    }
                  }}
                  style={{
                    marginTop: '15px',
                    width: '100%',
                    padding: '10px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Clear Stats
                </button>
              </div>
            )}

            {/* Single Player Modes */}
            <div className="mode-category">
              <h3 className="category-title">👤 Single Player</h3>
              
              <button className="mode-card" onClick={() => { setGameMode('local'); handleNewGame(); }}>
                <div className="mode-icon">🎮</div>
                <div className="mode-content">
                  <h4 className="mode-name">Local Play</h4>
                  <p className="mode-description">Play with a friend on the same device</p>
                </div>
                <div className="mode-arrow">→</div>
              </button>

              <button className="mode-card" onClick={() => { setGameMode('ai'); handleNewGame(); }}>
                <div className="mode-icon">🤖</div>
                <div className="mode-content">
                  <h4 className="mode-name">Play with Computer</h4>
                </div>
                <div className="mode-arrow">→</div>
              </button>

              <button className="mode-card" onClick={() => { setGameMode('customai'); handleNewGame(); }}>
                <div className="mode-icon">🧠</div>
                <div className="mode-content">
                  <h4 className="mode-name">Play with AI</h4>
                  <div className="mode-badge rating-badge">~1600-1800 ELO</div>
                </div>
                <div className="mode-arrow">→</div>
              </button>
            </div>

            {/* Multiplayer Mode */}
            <div className="mode-category">
              <h3 className="category-title">🌐 Multiplayer</h3>
              
              <button className="mode-card multiplayer-card" onClick={handleCreateRoom}>
                <div className="mode-icon">➕</div>
                <div className="mode-content">
                  <h4 className="mode-name">Create Room</h4>
                  <p className="mode-description">Host a game and share the room ID</p>
                </div>
                <div className="mode-arrow">→</div>
              </button>

              <div className="join-room-container">
                <div className="join-label">
                  <span className="mode-icon-small">🔗</span>
                  <span>Join Existing Room</span>
                </div>
                <div className="join-input-group">
                  <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    className="room-input-pro"
                  />
                  <button className="join-button-pro" onClick={handleJoinRoom}>
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AI setup screen
  if (gameMode === 'ai' && !aiGameStarted) {
    return (
      <div className="app">
        <div className="menu-container">
          <h1>🤖 Play vs AI</h1>
          
          <div className="ai-setup">
            <h3>Choose your color:</h3>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
              <button
                className={`color-button ${playerColor === 'white' ? 'active' : ''}`}
                onClick={() => setPlayerColor('white')}
              >
                ⬜ White
              </button>
              <button
                className={`color-button ${playerColor === 'black' ? 'active' : ''}`}
                onClick={() => setPlayerColor('black')}
              >
                ⬛ Black
              </button>
            </div>

            <h3>AI Difficulty:</h3>
            <input
              type="range"
              min="0"
              max="20"
              value={aiDifficulty}
              onChange={(e) => setAiDifficulty(Number(e.target.value))}
              style={{ width: '200px', marginBottom: '10px' }}
            />
            <p>Level: {aiDifficulty} / 20</p>

            <button className="menu-button" onClick={() => { 
              // Reset the game first
              gameEngine.newGame();
              updateGameState();
              setIsAiThinking(false);
              // Mark game as started
              setAiGameStarted(true);
              // If player chose black, trigger AI move after a short delay
              if (playerColor === 'black') {
                setTimeout(() => {
                  setIsAiThinking(true);
                }, 100);
              }
            }}>
              Start Game
            </button>
            
            <button className="back-button" onClick={handleBackToMenu}>
              ← Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Custom AI setup screen
  if (gameMode === 'customai' && !aiGameStarted) {
    return (
      <div className="app">
        <div className="menu-container">
          <h1>🧠 Play vs Custom AI</h1>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Professional Chess Engine with Minimax & Alpha-Beta Pruning (~1400-2200 ELO)
          </p>
          
          <div className="ai-setup">
            <h3>Choose your color:</h3>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
              <button
                className={`color-button ${playerColor === 'white' ? 'active' : ''}`}
                onClick={() => setPlayerColor('white')}
              >
                ⬜ White
              </button>
              <button
                className={`color-button ${playerColor === 'black' ? 'active' : ''}`}
                onClick={() => setPlayerColor('black')}
              >
                ⬛ Black
              </button>
            </div>

            <h3>AI Difficulty:</h3>
            <input
              type="range"
              min="0"
              max="20"
              value={aiDifficulty}
              onChange={(e) => setAiDifficulty(Number(e.target.value))}
              style={{ width: '200px', marginBottom: '10px' }}
            />
            <p>Level: {aiDifficulty} / 20</p>
            <p style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>
              {aiDifficulty < 5 ? '🟢 Beginner' : aiDifficulty < 10 ? '🟡 Intermediate' : aiDifficulty < 15 ? '🟠 Advanced' : '🔴 Expert'}
            </p>

            <button className="menu-button" onClick={() => { 
              // Reset the game first
              gameEngine.newGame();
              updateGameState();
              setIsAiThinking(false);
              // Mark game as started
              setAiGameStarted(true);
              // If player chose black, trigger AI move after a short delay
              if (playerColor === 'black') {
                setTimeout(() => {
                  setIsAiThinking(true);
                }, 100);
              }
            }}>
              Start Game
            </button>
            
            <button className="back-button" onClick={handleBackToMenu}>
              ← Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if game is over for effects
  const isCheckmate = gameEngine.isCheckmate();
  const winner = isCheckmate ? (gameEngine.turn() === 'w' ? 'Black' : 'White') : null;

  // Generate confetti pieces for checkmate
  const confettiPieces = isCheckmate ? Array.from({ length: 150 }, (_, i) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8', '#fdcb6e', '#00b894'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomDelay = Math.random() * 2;
    const randomDuration = 3 + Math.random() * 2;
    const randomX = Math.random() * 100;
    const randomRotate = Math.random() * 360;
    const randomSize = 8 + Math.random() * 8;
    
    return (
      <div
        key={i}
        className="confetti-piece"
        style={{
          left: `${randomX}%`,
          backgroundColor: randomColor,
          animationDelay: `${randomDelay}s`,
          animationDuration: `${randomDuration}s`,
          width: `${randomSize}px`,
          height: `${randomSize}px`,
          transform: `rotate(${randomRotate}deg)`
        }}
      />
    );
  }) : [];

  // Game screen
  return (
    <div className="app">
      {/* Confetti for checkmate */}
      {isCheckmate && <div className="confetti-container">{confettiPieces}</div>}
      
      <div className={`game-container ${isCheckmate ? 'checkmate-shake' : ''}`}>
        <div className="game-header">
          <button className="back-button" onClick={handleBackToMenu}>
            ← Back to Menu
          </button>
          
          {/* Settings Bar */}
          <div className="settings-bar">
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`sound-toggle-button ${!soundEnabled ? 'muted' : ''}`}
            >
              {soundEnabled ? '🔊' : '🔇'} Sound
            </button>
            
            {/* Theme Selector */}
            <select
              value={currentTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="theme-selector"
            >
              {Object.keys(boardThemes).map(themeName => (
                <option key={themeName} value={themeName}>
                  {themeName}
                </option>
              ))}
            </select>
            
            {/* Board Flip Button */}
            <button
              onClick={toggleBoardFlip}
              className="flip-board-button"
            >
              🔄 Flip Board
            </button>
          </div>
        </div>

        {gameMode === 'online' && roomId && (
          <div className="room-info">
            <strong>Room ID:</strong> {roomId}
            <br />
            <small>Share this ID with your friend to join</small>
          </div>
        )}
        
        {/* Opening Name Display */}
        {currentOpening && (
          <div className="opening-display">
            📚 {currentOpening}
          </div>
        )}

        <div className="game-layout">
          <div className="board-section">
            {/* Left Side - Clocks */}
            <div className="board-left-panel">
              <ChessClock
                initialTime={blackTime}
                increment={timeIncrement}
                isActive={clockActive && gameEngine.turn() === 'b'}
                onTimeUp={handleBlackTimeUp}
                playerColor="black"
              />
              <ChessClock
                initialTime={whiteTime}
                increment={timeIncrement}
                isActive={clockActive && gameEngine.turn() === 'w'}
                onTimeUp={handleWhiteTimeUp}
                playerColor="white"
              />
            </div>

            {/* Center - Board */}
            <Board
              position={position}
              onPieceDrop={handlePieceDrop}
              boardOrientation={getBoardOrientation()}
              isPlayerTurn={isPlayerTurn() && !isAiThinking}
              showPromotionDialog={showPromotionDialog}
              onPromotionPieceSelect={handlePromotionPieceSelect}
              isCheck={gameEngine.inCheck()}
              currentTurn={gameEngine.turn()}
              customLightSquareStyle={{ backgroundColor: theme.lightSquare }}
              customDarkSquareStyle={{ backgroundColor: theme.darkSquare }}
              lastMove={lastMove}
            />
            
            {/* Right Side - Captured Pieces */}
            <div className="board-right-panel">
              <CapturedPieces captured={capturedPieces.black} color="white" />
              <CapturedPieces captured={capturedPieces.white} color="black" />
            </div>
          </div>

          <div className="sidebar">
            <GameControls
              onNewGame={handleNewGame}
              onUndo={gameMode === 'local' || gameMode === 'ai' ? handleUndo : undefined}
              gameStatus={gameStatus}
              canUndo={moveHistory.length > 0}
              showMultiplayerControls={gameMode === 'online'}
            />

            <MoveHistory moves={moveHistory} />
          </div>
        </div>

        {/* Checkmate Victory Banner */}
        {isCheckmate && (
          <div className="victory-banner">
            <div className="victory-content">
              <div className="trophy">🏆</div>
              <h1 className="victory-title">Checkmate!</h1>
              <h2 className="victory-winner">{winner} Wins!</h2>
              <div className="crown">👑</div>
              
              <div className="victory-buttons">
                <button 
                  className="victory-button restart-button"
                  onClick={handleNewGame}
                >
                  🔄 Restart
                </button>
                <button 
                  className="victory-button menu-button"
                  onClick={handleBackToMenu}
                >
                  🏠 Main Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}

export default App;
