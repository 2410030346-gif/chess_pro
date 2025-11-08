# 🚀 START HERE

Welcome to your Chess Website project!

## Quick Start (5 minutes)

### Step 1: Install Dependencies

Open PowerShell in this folder and run:

```powershell
.\install.ps1
```

Or manually:
```powershell
cd client
npm install
cd ..\server
npm install
```

### Step 2: Start the Servers

**Terminal 1 - Server:**
```powershell
cd server
npm start
```

**Terminal 2 - Client:**
```powershell
cd client
npm run dev
```

### Step 3: Open the App

Go to: http://localhost:3000

## What You Get

✅ **Local Play** - Play chess with a friend on the same device
✅ **AI Opponent** - Play against Stockfish chess engine
✅ **Online Multiplayer** - Play with friends over the internet

## File Structure

```
chess_website/
├── client/          → React frontend (TypeScript)
├── server/          → Socket.IO server (Node.js)
├── docs/            → Documentation
├── README.md        → Full documentation
└── install.ps1      → Installation script
```

## Important Files

- `client/src/App.tsx` - Main application logic
- `client/src/engine/GameEngine.ts` - Chess rules wrapper
- `client/src/components/Board.tsx` - Chessboard UI
- `server/index.js` - Multiplayer server

## Next Steps

1. ✅ Run the app (see Quick Start above)
2. 📖 Read `README.md` for full documentation
3. 🎨 Customize `client/src/App.css` for styling
4. 🤖 Download Stockfish.js for AI mode (optional)
5. 🚀 Deploy to the internet

## Getting Stockfish (Optional - for AI mode)

1. Visit: https://github.com/nmrugg/stockfish.js/
2. Download `stockfish.js`
3. Place it in: `client/public/stockfish.js`

Without Stockfish, local hotseat and online multiplayer will still work!

## Need Help?

- `docs/QUICKSTART.md` - Quick start guide
- `docs/SETUP.md` - Detailed setup instructions
- `docs/ARCHITECTURE.md` - Technical architecture
- `README.md` - Full documentation with troubleshooting

## Test Each Mode

### Local Mode
1. Click "Play Local (Hotseat)"
2. Take turns moving pieces

### AI Mode (requires Stockfish)
1. Click "Play vs AI"
2. Choose color and difficulty
3. Play against the computer

### Online Mode
1. Click "Create Room" → Get Room ID
2. Open new tab → "Join Room" → Enter Room ID
3. Play in real-time!

---

**Ready to play chess? Start with Step 1 above! ♟️**
