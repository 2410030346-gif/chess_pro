# Chess Website - Setup Instructions

## Installation Script

Run this PowerShell script to install all dependencies:

```powershell
# Navigate to project root
cd "C:\Users\Niranjan\OneDrive\Desktop\chess_website"

# Install client dependencies
Write-Host "Installing client dependencies..." -ForegroundColor Green
cd client
npm install

# Install server dependencies
Write-Host "`nInstalling server dependencies..." -ForegroundColor Green
cd ..\server
npm install

Write-Host "`n✓ Installation complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Download Stockfish.js and place in client\public\stockfish.js"
Write-Host "2. Run 'npm start' in the server folder"
Write-Host "3. Run 'npm run dev' in the client folder (in a separate terminal)"
Write-Host "4. Open http://localhost:3000 in your browser"
```

Save this as `install.ps1` and run it, or copy the commands one by one.

## Manual Installation Steps

### Step 1: Install Client Dependencies

```powershell
cd client
npm install
```

This installs:
- React 18 and React DOM
- TypeScript
- Vite (build tool)
- chess.js (chess logic)
- react-chessboard (UI)
- socket.io-client (multiplayer)
- ESLint (code quality)

### Step 2: Install Server Dependencies

```powershell
cd ..\server
npm install
```

This installs:
- Express (web server)
- Socket.IO (WebSocket server)
- CORS (cross-origin support)
- Nodemon (dev auto-reload)

### Step 3: Download Stockfish (Optional)

For AI mode to work, you need Stockfish.js:

**Option 1: From nmrugg/stockfish.js (Recommended)**

1. Go to https://github.com/nmrugg/stockfish.js/
2. Click "Releases"
3. Download `stockfish.js` from the latest release
4. Place it in `client\public\stockfish.js`

**Option 2: From CDN (Alternative)**

Create `client\public\stockfish.js` with:
```javascript
// Wrapper to load from CDN
importScripts('https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js');
```

**Option 3: Skip AI Mode**

You can skip this step and use only local hotseat and online multiplayer modes.

## Verification

### Verify Installation

Check that node_modules folders exist:
```powershell
# Should show folders with packages
ls client\node_modules
ls server\node_modules
```

### Check Package Versions

```powershell
cd client
npm list react chess.js react-chessboard socket.io-client

cd ..\server
npm list express socket.io cors
```

## Running the Application

### Terminal 1 - Server

```powershell
cd server
npm start
```

Expected output:
```
✓ Chess server running on http://localhost:3001
✓ Socket.IO server ready for connections
```

### Terminal 2 - Client

```powershell
cd client
npm run dev
```

Expected output:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### Open in Browser

Navigate to: `http://localhost:3000`

You should see the chess game menu.

## Troubleshooting Installation

### npm install fails

**Error:** `npm ERR! network`

**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Vite dependency errors

**Error:** `Cannot find module 'vite'`

**Solution:** Dependencies need to be installed. The errors you're seeing are expected before running `npm install`.

```powershell
cd client
npm install
```

### Port already in use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:** Stop the process using the port or change the port:

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change the port in vite.config.ts
```

### Stockfish not loading

**Error:** `Failed to load resource: net::ERR_FILE_NOT_FOUND` for stockfish.js

**Solution:**
1. Verify file exists at `client\public\stockfish.js`
2. Check file name (case-sensitive on some systems)
3. Try a different Stockfish build
4. Check browser console for detailed error

### TypeScript errors

**Error:** `Cannot find module 'react'` or similar

**Solution:** These errors are normal before installation. Run `npm install` in the client folder.

## Development Tools Setup (Optional)

### VS Code Extensions

Recommended extensions:
- ESLint (dbaeumer.vscode-eslint)
- TypeScript Vue Plugin (Vue.vscode-typescript-vue-plugin)
- Prettier (esbenp.prettier-vscode)
- Auto Rename Tag (formulahendry.auto-rename-tag)

### Browser Extensions

For debugging:
- React Developer Tools
- Redux DevTools (if you add Redux later)

### Git Setup

Initialize version control:
```powershell
git init
git add .
git commit -m "Initial commit - chess website"
```

Create `.gitignore`:
```
node_modules/
dist/
.vite/
.env
.DS_Store
*.log
```

## Environment Configuration

### Development Environment

No environment variables needed for local development.

### Production Environment

For deployment, set these environment variables:

**Server:**
```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

**Client:**

Create `.env.production`:
```
VITE_SERVER_URL=https://your-server-domain.com
```

Update `socket.ts`:
```typescript
constructor(serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001') {
  this.serverUrl = serverUrl;
}
```

## Build for Production

### Build Client

```powershell
cd client
npm run build
```

Output: `client\dist\` folder with optimized static files

### Test Production Build

```powershell
cd client
npm run preview
```

Opens production build at http://localhost:4173

### Build Server

No build needed - Node runs JavaScript directly.

For deployment, just copy the `server` folder.

## System Requirements

### Minimum Requirements
- Node.js 16+ (check with `node --version`)
- npm 8+ (check with `npm --version`)
- 4 GB RAM
- Modern browser (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)

### Recommended
- Node.js 18 LTS or 20 LTS
- npm 9+
- 8 GB RAM
- Fast internet (for Stockfish download)
- SSD for faster npm installs

### Browser Compatibility

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome  | 90+     | ✅ Fully supported |
| Firefox | 88+     | ✅ Fully supported |
| Safari  | 14+     | ✅ Fully supported |
| Edge    | 90+     | ✅ Fully supported |
| IE 11   | ❌      | Not supported |

## Next Steps After Installation

1. ✅ Verify all three game modes work
2. ✅ Read the [QUICKSTART.md](QUICKSTART.md) guide
3. ✅ Explore the code in `client/src/App.tsx`
4. ✅ Customize the styling in `client/src/App.css`
5. ✅ Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the design
6. ✅ Deploy to the internet (see README deployment section)

## Getting Help

If you encounter issues:

1. Check this SETUP.md document
2. Check [README.md](../README.md) Troubleshooting section
3. Check browser console (F12) for errors
4. Check server terminal for error messages
5. Search for the error message online
6. Create a GitHub issue with:
   - Your OS and Node version
   - Steps to reproduce
   - Error messages
   - Screenshots

## Useful Commands Reference

```powershell
# Client commands
cd client
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality
npm install <pkg>    # Add new package

# Server commands
cd server
npm start            # Start server
npm run dev          # Start with auto-reload
npm install <pkg>    # Add new package

# General
npm outdated         # Check for package updates
npm update           # Update packages
npm audit            # Check for security issues
npm audit fix        # Fix security issues
```

---

**Installation complete! Ready to play chess! ♟️**
