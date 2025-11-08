# 🌐 Live Deployment Guide

## Your Chess Game is Now Live!

### 🎮 Frontend (GitHub Pages)

**Your game is deployed at:**
```
https://2410030346-gif.github.io/chess_pro/
```

**What works without backend:**
- ✅ Local play (2 players on same device)
- ✅ Play vs Stockfish AI
- ✅ Play vs Custom AI
- ✅ All chess features (move history, themes, sounds, clock, etc.)

**What needs backend to work:**
- ❌ Online multiplayer
- ❌ User authentication (login/register)
- ❌ Game saving to database
- ❌ Leaderboard

---

## 🚀 Deploy Backend (For Full Features)

To enable ALL features, deploy your backend server:

### Option 1: Render.com (FREE - Recommended)

1. **Sign up**: Go to https://render.com and sign up with GitHub

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect GitHub and select `chess_pro` repository
   
3. **Configure**:
   - **Name**: `chess-pro-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Add Environment Variables** (click "Environment" tab):
   ```
   MONGODB_URI = <your MongoDB Atlas connection string>
   JWT_SECRET = <your JWT secret>
   PORT = 3001
   ```

5. **Deploy**: Click "Create Web Service" and wait for deployment

6. **Your backend URL**: `https://chess-pro-backend.onrender.com`

### Option 2: Railway.app (FREE Alternative)

1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Select `chess_pro` repository
5. Configure to deploy from `server` directory
6. Add environment variables (same as above)
7. Deploy!

---

## 🔗 Connect Frontend to Backend

After deploying backend, you need to update the frontend to use it:

### Method 1: Using GitHub Actions (Automatic)

1. Go to your repository: https://github.com/2410030346-gif/chess_pro
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com` (your actual backend URL)
5. Push a commit to trigger rebuild

### Method 2: Update Locally and Push

Edit `client/.env.production`:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

Then:
```bash
git add client/.env.production
git commit -m "Configure production backend URL"
git push origin main
```

The GitHub Actions workflow will automatically rebuild and redeploy.

---

## 📝 Quick Checklist

- [ ] Frontend deployed to GitHub Pages (✅ Done automatically)
- [ ] Backend deployed to Render/Railway
- [ ] Environment variables set in backend (MONGODB_URI, JWT_SECRET)
- [ ] Frontend configured with backend URL (VITE_API_URL)
- [ ] Tested online multiplayer
- [ ] Tested authentication (login/register)
- [ ] Tested leaderboard

---

## 🧪 Testing Your Deployment

### Test Frontend Only (Works Now!)
1. Visit https://2410030346-gif.github.io/chess_pro/
2. Try "Local Play" - should work ✅
3. Try "Play with AI" - should work ✅

### Test Full Features (After Backend Deployment)
1. Visit your site
2. Click "Login / Register" - should open modal
3. Register a new account
4. Play a game (any mode)
5. Check leaderboard - should show your stats
6. Try online multiplayer with a friend

---

## 🆘 Troubleshooting

### "Page not found on GitHub Pages"
- Go to repository Settings → Pages
- Make sure Source is set to "GitHub Actions"
- Check Actions tab for build status

### "Cannot connect to backend"
- Open browser console (F12)
- Check for CORS errors
- Verify backend URL is correct in `config.ts`
- Make sure backend is running (visit backend URL in browser)

### "Authentication not working"
- Check JWT_SECRET is set in backend environment variables
- Make sure MongoDB connection string is correct
- Check backend logs for errors

### "Online multiplayer not connecting"
- Backend must be deployed and running
- Check Socket.IO connection in browser console
- Verify backend URL in frontend config

---

## 💡 Current Status

**Right now:**
- ✅ Frontend is deployed and live
- ⏳ Backend needs to be deployed (follow steps above)
- ⏳ Frontend needs backend URL configuration

**After backend deployment:**
- ✅ All game modes work
- ✅ Authentication works
- ✅ Game saving works
- ✅ Leaderboard works
- ✅ Online multiplayer works

---

## 🎯 Your Live Links

**Frontend (Live Now):**
```
https://2410030346-gif.github.io/chess_pro/
```

**Backend (Deploy using steps above):**
```
https://your-chosen-name.onrender.com
```
or
```
https://your-project.up.railway.app
```

**Full App (After connecting both):**
```
https://2410030346-gif.github.io/chess_pro/
```
(Will have all features working!)

---

## 📊 Free Tier Limits

**GitHub Pages:**
- ✅ Unlimited bandwidth
- ✅ Free SSL certificate
- ✅ Custom domain support

**Render.com Free:**
- ✅ 750 hours/month (enough for one service 24/7)
- ⚠️ Sleeps after 15 min of inactivity (wakes up on request - takes ~30 seconds)
- ✅ 512 MB RAM

**Railway.app Free:**
- ✅ $5 credit/month (enough for small apps)
- ✅ No sleep on inactivity
- ✅ Better performance than Render

**MongoDB Atlas Free:**
- ✅ 512 MB storage
- ✅ Enough for thousands of games

---

**Next Step:** Deploy your backend using one of the methods above, then your chess game will be fully functional online! 🚀
