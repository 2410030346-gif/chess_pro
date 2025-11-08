# 🚀 Render Deployment Guide (All-in-One)

This guide will help you deploy BOTH frontend and backend together on Render, so you can play the game directly from the Render URL.

## 📋 What You're Deploying

Your Render deployment will serve:
- ✅ **Frontend** (React chess game UI)
- ✅ **Backend** (Node.js API + Socket.IO)
- ✅ **All Features** (multiplayer, auth, leaderboard)

**Result:** One URL that does everything!

---

## 🎯 Render Configuration

### Step 1: Create Web Service

1. Go to https://render.com/register
2. Sign up with GitHub (free)
3. Click "New +" → "Web Service"
4. Connect your GitHub and select `chess_pro` repository

### Step 2: Configure Service

Fill in these settings **EXACTLY**:

| Setting | Value |
|---------|-------|
| **Name** | `chess-pro` (or your choice) |
| **Region** | Oregon (US West) - or closest to you |
| **Branch** | `main` |
| **Root Directory** | (leave empty - not `server`) |
| **Runtime** | `Node` |
| **Build Command** | `chmod +x build.sh && ./build.sh` |
| **Start Command** | `cd server && npm start` |
| **Instance Type** | `Free` |

### Step 3: Add Environment Variables

Click "Advanced" or go to "Environment" tab and add:

```
MONGODB_URI = mongodb+srv://2410030346_db_user:sm20v5Ub2zosRzSc@cluster0.g808jr8.mongodb.net/chess_db
JWT_SECRET = your_super_secret_jwt_key_change_this_in_production_12345
PORT = 10000
NODE_ENV = production
```

**Important:** 
- Use `PORT=10000` (Render's default port)
- Set `NODE_ENV=production` (enables frontend serving)

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait 5-10 minutes for build and deployment
3. Check logs for "✅ Build complete!"

---

## 🎮 Your Live Game URL

After deployment, you'll get a URL like:

```
https://chess-pro-abc123.onrender.com
```

**This is your playable game!** All features work:
- ✅ Local play
- ✅ AI opponents (Stockfish & Custom AI)
- ✅ Online multiplayer
- ✅ User authentication
- ✅ Game saving
- ✅ Leaderboard

---

## 🔧 How It Works

```
┌─────────────────────────────────────────────┐
│         Render.com                          │
│  https://chess-pro.onrender.com             │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Frontend (React)                     │ │
│  │  Served from /client/dist/            │ │
│  │  👉 Users see the chess game here     │ │
│  └────────────┬──────────────────────────┘ │
│               │                             │
│               │ API calls to /api/*         │
│               ↓                             │
│  ┌───────────────────────────────────────┐ │
│  │  Backend (Node.js + Express)          │ │
│  │  Handles:                             │ │
│  │  - Authentication (/api/auth/*)       │ │
│  │  - Game saving (/api/games/*)         │ │
│  │  - Leaderboard (/api/leaderboard/*)   │ │
│  │  - Multiplayer (Socket.IO)            │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 📊 Build Process

When you deploy, Render will:

1. **Install server dependencies** → `cd server && npm install`
2. **Install client dependencies** → `cd client && npm install`
3. **Build React app** → `cd client && npm run build`
4. **Start server** → `cd server && npm start`

The server then serves:
- API routes at `/api/*`
- React app at all other routes (`/*`)

---

## ⚠️ Important Notes

### Free Tier Limitations

**Render Free tier:**
- ✅ Great for testing and small projects
- ⚠️ **Sleeps after 15 minutes of inactivity**
- ⏱️ Takes ~30 seconds to wake up on first request
- ✅ 750 hours/month (enough for 24/7 if only one service)

**What "sleeping" means:**
- First visitor after inactivity sees loading for ~30 seconds
- Then works normally for everyone
- Stays awake while people are playing

### Keep It Awake (Optional)

To prevent sleeping, use a free uptime monitor:
- **UptimeRobot**: https://uptimerobot.com (free)
- Set it to ping your Render URL every 5 minutes

### MongoDB Atlas

Make sure MongoDB Atlas allows connections from anywhere:
1. Go to MongoDB Atlas dashboard
2. Network Access → Add IP Address
3. Add `0.0.0.0/0` (allows all IPs)
4. Save

---

## 🧪 Testing Your Deployment

### 1. Check Deployment Status

In Render dashboard:
- ✅ Green "Live" badge = deployed successfully
- 🔴 Red badge = check logs for errors

### 2. Test the Game

Visit your Render URL:

**Test Local Play:**
1. Go to your URL
2. Click "Local Play"
3. Make some moves ✅

**Test AI:**
1. Click "Play with AI"
2. Choose color and difficulty
3. Play against computer ✅

**Test Authentication:**
1. Click "Login / Register"
2. Create an account
3. Should see your username in menu ✅

**Test Multiplayer:**
1. Click "Create Room"
2. Copy room ID
3. Open in another browser/incognito
4. Join with room ID
5. Play together ✅

**Test Leaderboard:**
1. Play and finish a game
2. Click "Leaderboard"
3. Should see rankings ✅

---

## 🆘 Troubleshooting

### Build Fails

**Error: "build.sh: Permission denied"**
- The build command should include `chmod +x build.sh`
- Make sure it's: `chmod +x build.sh && ./build.sh`

**Error: "npm: command not found"**
- Make sure Runtime is set to "Node"
- Check that Node version is 18 or higher in Render settings

### Deployment Succeeds but Game Doesn't Load

**Check logs** (in Render dashboard):
```
✓ Chess server running on http://localhost:10000
✅ MongoDB connected successfully!
```

If you see these, backend is working!

**White screen or 404:**
- Make sure `NODE_ENV=production` is set
- Check that `client/dist` folder exists in logs
- Verify build.sh ran successfully

### "Cannot connect to backend"

**Check environment variables:**
- `MONGODB_URI` is set correctly
- `JWT_SECRET` is set
- `PORT=10000`
- `NODE_ENV=production`

**Check MongoDB Atlas:**
- IP whitelist includes `0.0.0.0/0`
- Connection string is correct
- Database user exists

### Multiplayer Not Working

**Socket.IO issues:**
- Clear browser cache
- Check browser console for errors
- Make sure CORS is properly configured (it is in the updated code)

---

## 🎯 Alternative: Keep GitHub Pages

If you want to keep GitHub Pages as well, you can have both:

**Option A: Render (Recommended)**
```
https://chess-pro.onrender.com
```
- All features work
- One URL for everything
- Easy to share

**Option B: GitHub Pages + Render Backend**
```
Frontend: https://2410030346-gif.github.io/chess_pro/
Backend: https://chess-pro-backend.onrender.com
```
- Frontend on GitHub (faster)
- Backend on Render (for features)
- Need to configure CORS and API URLs

For simplicity, **use Render for everything** (Option A).

---

## ✅ Deployment Checklist

Before deploying, verify:

- [ ] MongoDB Atlas IP whitelist set to `0.0.0.0/0`
- [ ] MongoDB connection string is correct
- [ ] `.gitignore` excludes `.env`, `node_modules`, `dist`
- [ ] Code pushed to GitHub `main` branch
- [ ] `build.sh` is executable (chmod +x)
- [ ] Environment variables ready to add

During deployment:

- [ ] Build command: `chmod +x build.sh && ./build.sh`
- [ ] Start command: `cd server && npm start`
- [ ] Environment variables added (4 required)
- [ ] Free tier selected
- [ ] Deployment triggered

After deployment:

- [ ] Service shows "Live" status
- [ ] Logs show successful build
- [ ] Game loads at Render URL
- [ ] Can register and login
- [ ] Can play all game modes
- [ ] Multiplayer works
- [ ] Leaderboard shows data

---

## 🎊 Success!

Once deployed, your chess game is live on the internet!

**Share your link:**
```
https://your-service-name.onrender.com
```

**Features that work:**
- ✅ Beautiful chess UI with themes
- ✅ Local play (hotseat)
- ✅ AI opponents (Stockfish & Custom)
- ✅ Online multiplayer with room codes
- ✅ User accounts and authentication
- ✅ Game history saved to database
- ✅ Global leaderboard with rankings
- ✅ Player statistics and streaks
- ✅ Sound effects and animations
- ✅ Responsive design (mobile & desktop)

---

**Need help?** Check the Render logs for error messages and compare with this guide.

**Performance tip:** For better performance (no sleeping), consider upgrading to Render's $7/month plan later.
