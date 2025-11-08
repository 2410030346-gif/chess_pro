# ⚡ Quick Render Setup (Copy & Paste)

## 🎯 Render Configuration

### Root Directory:
```
(leave empty)
```

### Build Command:
```
chmod +x build.sh && ./build.sh
```

### Start Command:
```
cd server && npm start
```

### Environment Variables:
```
MONGODB_URI = mongodb+srv://2410030346_db_user:sm20v5Ub2zosRzSc@cluster0.g808jr8.mongodb.net/chess_db
JWT_SECRET = your_super_secret_jwt_key_change_this_in_production_12345
PORT = 10000
NODE_ENV = production
```

---

## ✅ After Deployment

Your game will be live at:
```
https://your-service-name.onrender.com
```

**You can play directly from this URL!**

All features work:
- ✅ Local play
- ✅ AI opponents
- ✅ Online multiplayer
- ✅ Authentication
- ✅ Leaderboard

---

## 🔍 Checklist

Before deploying:
- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas allows all IPs (0.0.0.0/0)

In Render:
- [ ] Root Directory: (empty)
- [ ] Build: `chmod +x build.sh && ./build.sh`
- [ ] Start: `cd server && npm start`
- [ ] All 4 environment variables added
- [ ] Instance Type: Free

After deployment:
- [ ] Status shows "Live"
- [ ] Can load the game
- [ ] Can register/login
- [ ] Can play multiplayer

---

**Done! Your chess game is live! 🎉**
