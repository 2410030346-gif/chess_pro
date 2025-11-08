# Stockfish AI Setup

To enable the AI opponent feature, you need to add Stockfish.js to your project.

## Quick Download Links

### Option 1: Stockfish.js (Recommended)
- Repository: https://github.com/nmrugg/stockfish.js/
- Direct download: Go to "Releases" and download `stockfish.js`
- Size: ~5-6 MB

### Option 2: Stockfish WASM
- Repository: https://github.com/lichess-org/stockfish.wasm
- More modern, potentially faster
- Requires additional setup

## Installation

1. Download `stockfish.js` from one of the links above
2. Place the file here: `client\public\stockfish.js`
3. Restart the client dev server if it's running

## Without Stockfish

If you don't install Stockfish:
- ✅ Local hotseat play works perfectly
- ✅ Online multiplayer works perfectly
- ❌ AI opponent mode will show an error

## Testing AI Mode

After installing Stockfish:

1. Open http://localhost:3000
2. Click "Play vs AI"
3. Choose your color (White or Black)
4. Set difficulty (0 = beginner, 20 = master)
5. Click "Start Game"
6. Make a move and wait for AI response

## Troubleshooting

### AI not responding

**Check browser console (F12) for errors:**

- "Failed to load resource: stockfish.js" → File not in correct location
- "Stockfish worker error" → Try a different Stockfish build
- No error, but no response → Increase `movetime` in `App.tsx`

### AI too slow

In `App.tsx`, find the `getBestMove` call and adjust:

```typescript
stockfish.getBestMove(gameEngine.getFEN(), { 
  skillLevel: aiDifficulty,
  movetime: 500  // Reduce from 1000 to 500ms
});
```

### AI too weak/strong

Adjust the difficulty slider in the UI (0-20), or modify the range in `App.tsx`.

## Alternative: Skip AI Mode

If you don't want to deal with Stockfish:

1. Comment out the AI option in `App.tsx`
2. Or just don't download Stockfish - the other modes work fine!

## File Locations

```
chess_website/
└── client/
    └── public/
        └── stockfish.js  ← Place the file here
```

After placing the file, your project should look like:
```
client/public/
├── stockfish.js  ← Your Stockfish engine
└── vite.svg      ← Default Vite icon
```

---

**Note:** Stockfish is a powerful chess engine (world computer chess champion). It's completely free and open-source!
