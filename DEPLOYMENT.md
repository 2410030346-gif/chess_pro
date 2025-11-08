# 🚀 Deployment Guide

## Prerequisites

- Node.js 16+ installed
- MongoDB Atlas account (free tier works)
- Git installed

## Local Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd chess_website
```

### 2. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 3. Configure Environment Variables

Create `server/.env` file (copy from `.env.example`):
```bash
cd server
cp .env.example .env
```

Edit `server/.env` and add your MongoDB credentials:
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/chess_db?retryWrites=true&w=majority
PORT=3001
JWT_SECRET=<generate-a-strong-random-string>
JWT_EXPIRE=7d
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or use `0.0.0.0/0` for development)
5. Get your connection string and add it to `.env`

### 5. Run the Application

**Start Backend (Terminal 1):**
```bash
cd server
npm start
```

**Start Frontend (Terminal 2):**
```bash
cd client
npm run dev
```

**Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Production Deployment

### Heroku (Backend)

1. Create a Heroku app:
```bash
heroku create your-chess-api
```

2. Add MongoDB Atlas connection string as config var:
```bash
heroku config:set MONGODB_URI="your-connection-string"
heroku config:set JWT_SECRET="your-jwt-secret"
```

3. Deploy:
```bash
git subtree push --prefix server heroku main
```

### Vercel/Netlify (Frontend)

1. Build the frontend:
```bash
cd client
npm run build
```

2. Deploy the `dist` folder to Vercel or Netlify

3. Set environment variable:
```
VITE_API_URL=https://your-chess-api.herokuapp.com
```

## Environment Variables Reference

### Backend (server/.env)
| Variable | Description | Required |
|----------|-------------|----------|
| MONGODB_URI | MongoDB Atlas connection string | Yes |
| PORT | Server port (default: 3001) | No |
| JWT_SECRET | Secret key for JWT tokens | Yes |
| JWT_EXPIRE | JWT expiration time | No |

### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
| VITE_API_URL | Backend API URL | Yes (production) |

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Strong JWT secret generated
- [ ] MongoDB user has minimal required permissions
- [ ] CORS configured for your frontend domain only (in production)

## Troubleshooting

**Can't connect to MongoDB:**
- Check IP whitelist in MongoDB Atlas
- Verify connection string is correct
- Ensure network allows outbound connections

**CORS errors:**
- Update `server/index.js` CORS origin to match your frontend URL
- In production, use specific domain instead of `*`

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

## Features

✅ User Authentication (JWT)
✅ Game Saving with MongoDB
✅ Global Leaderboard
✅ Multiple Game Modes (Local, AI, Custom AI, Online)
✅ Real-time Multiplayer (Socket.IO)
✅ Move History & Statistics
✅ Chess Clock
✅ Board Themes
✅ Sound Effects

## Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- Chess.js
- Socket.IO Client

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- bcrypt

---

For questions or issues, please open a GitHub issue.
