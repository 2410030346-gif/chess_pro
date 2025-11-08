# Quick Start Guide

This guide will get your chess website running in 5 minutes.

## Step 1: Install Dependencies

Open PowerShell in the project folder and run:

```powershell
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ..\server
npm install
```

## Step 2: Download Stockfish (Optional - for AI mode)

1. Visit https://github.com/nmrugg/stockfish.js/
2. Download `stockfish.js` (or `stockfish.wasm` bundle)
3. Place it in `client\public\stockfish.js`

**Note:** You can skip this step if you only want local hotseat or online multiplayer modes. The app will work without AI.

## Step 3: Start the Server

```powershell
cd server
npm start
```

You should see:
```
✓ Chess server running on http://localhost:3001
✓ Socket.IO server ready for connections
```

Keep this terminal open.

## Step 4: Start the Client

Open a **new PowerShell window** in the project folder:

```powershell
cd client
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Step 5: Open the App

Open your browser to **http://localhost:3000**

You should see the main menu with three options:
- 🎮 Play Local (Hotseat)
- 🤖 Play vs AI
- 🌐 Play Online

## Testing Each Mode

### Test Local Mode
1. Click "Play Local (Hotseat)"
2. Move a piece (drag and drop)
3. Players alternate turns on the same device

### Test AI Mode (if Stockfish is installed)
1. Click "Play vs AI"
2. Choose your color
3. Set difficulty
4. Click "Start Game"
5. Make a move and wait for AI response

### Test Online Mode
1. Click "Create Room" - you'll get a Room ID (e.g., "ABC123")
2. Open a new browser window/tab to http://localhost:3000
3. Click "Join Room" and enter the Room ID
4. Both windows should now be connected
5. Make moves in either window - they sync in real-time

## Common Issues

### Port Already in Use

If port 3000 or 3001 is already taken:

**For client** (edit `vite.config.ts`):
```typescript
server: {
  port: 3002,  // Change to any free port
}
```

**For server** (edit `index.js`):
```javascript
const PORT = 3005; // Change to any free port
```

Don't forget to update the socket URL in `client/src/services/socket.ts`:
```typescript
constructor(serverUrl = 'http://localhost:3005') {
```

### Dependencies Installation Failed

Try clearing npm cache:
```powershell
npm cache clean --force
rm -rf node_modules
npm install
```

### AI Not Responding

- Verify `stockfish.js` is in `client/public/` folder
- Check browser console (F12) for errors
- Try a different Stockfish build

## Next Steps

- Read the full [README.md](../README.md) for detailed documentation
- Customize the UI in `client/src/App.css`
- Adjust AI difficulty in the app settings
- Deploy to the internet (see Deployment section in README)

## Development Commands

```powershell
# Client
cd client
npm run dev      # Development mode with hot reload
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter

# Server
cd server
npm start        # Start server
npm run dev      # Start with auto-reload (nodemon)
```

## File Structure Overview

```
client/src/
├── App.tsx              # Main app logic and routing
├── components/          # UI components
│   ├── Board.tsx        # Chessboard
│   ├── MoveHistory.tsx  # Move list
│   └── GameControls.tsx # Buttons and status
├── engine/
│   └── GameEngine.ts    # Chess rules wrapper
└── services/
    ├── stockfish.ts     # AI engine
    └── socket.ts        # Multiplayer connection

server/
└── index.js             # Socket.IO server
```

---

**You're all set! Have fun playing chess! ♟️**
