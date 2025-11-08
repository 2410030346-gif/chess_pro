# 🎮 Chess Website API Documentation

Base URL: `http://localhost:3001/api`

---

## 🔐 Authentication Endpoints

### Register a New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player123",
  "email": "player@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "player123",
    "email": "player@example.com",
    "rating": 1200,
    "stats": {
      "wins": 0,
      "losses": 0,
      "draws": 0,
      "totalGames": 0
    }
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "securePassword123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Update Profile
```http
PUT /api/auth/update-profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "newUsername"
}
```

---

## 🎯 Game Endpoints

### Save a Game
```http
POST /api/games
Content-Type: application/json
Authorization: Bearer {token} (optional)

{
  "players": {
    "white": "player1",
    "black": "player2"
  },
  "moves": [
    {
      "move": "e4",
      "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
    }
  ],
  "result": "white",
  "gameMode": "online",
  "finalFEN": "final_position_fen"
}
```

### Get All Games
```http
GET /api/games?page=1&limit=10
```

### Get Specific Game
```http
GET /api/games/{gameId}
```

### Get User's Games
```http
GET /api/games/user/{username}?page=1&limit=10
```

### Delete a Game
```http
DELETE /api/games/{gameId}
Authorization: Bearer {token}
```

---

## 🏆 Leaderboard Endpoints

### Get Leaderboard
```http
GET /api/leaderboard?sortBy=rating&limit=20
```

**Sort Options:** `rating`, `wins`, `winrate`, `games`

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "username": "GrandMaster123",
      "rating": 2500,
      "stats": {
        "wins": 150,
        "losses": 30,
        "draws": 20,
        "totalGames": 200,
        "winRate": 75.0
      },
      "memberSince": "2025-01-01"
    }
  ],
  "sortBy": "rating",
  "totalPlayers": 1000
}
```

### Get User's Rank
```http
GET /api/leaderboard/user/{username}?context=5
```

Returns user's rank and nearby players (5 above, 5 below by default)

### Get Global Statistics
```http
GET /api/leaderboard/stats/global
```

**Response:**
```json
{
  "totalUsers": 1000,
  "totalGames": 5000,
  "topRatedPlayer": {
    "username": "Champion",
    "rating": 2800
  },
  "mostActivePlayer": {
    "username": "Grinder",
    "gamesPlayed": 500
  }
}
```

---

## 📊 Health Check

### Server Health
```http
GET /health
```

### Database Test
```http
GET /api/test-db
```

---

## 🔑 Authentication Header Format

For protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

---

## ✨ Client Services Available

### `authService` (client/src/services/auth.ts)
- `register(username, email, password)`
- `login(email, password)`
- `logout()`
- `getUser()`
- `isAuthenticated()`
- `getCurrentUser()`
- `updateProfile(username)`

### `gameAPI` (client/src/services/gameAPI.ts)
- `saveGame(gameData, token?)`
- `getGames(page, limit)`
- `getGame(gameId)`
- `getUserGames(username, page, limit)`

### `leaderboardService` (client/src/services/leaderboard.ts)
- `getLeaderboard(sortBy, limit)`
- `getUserRank(username, context)`
- `getGlobalStats()`

---

## 🚀 Usage Example in React

```typescript
import { authService } from './services/auth';
import { gameAPI } from './services/gameAPI';
import { leaderboardService } from './services/leaderboard';

// Register
const user = await authService.register('username', 'email@example.com', 'password');

// Login
const user = await authService.login('email@example.com', 'password');

// Save game
await gameAPI.saveGame({
  players: { white: 'player1', black: 'AI' },
  moves: [...],
  result: 'white',
  gameMode: 'ai',
  finalFEN: '...'
}, authService.getToken());

// Get leaderboard
const { leaderboard } = await leaderboardService.getLeaderboard('rating', 10);
```

---

## 🎉 All Features Implemented!

✅ User Registration & Login  
✅ JWT Authentication  
✅ Save & Load Games  
✅ User Statistics Tracking  
✅ Global Leaderboard  
✅ User Rankings  
✅ Game History  
✅ Profile Management  

Your chess website now has a complete backend with database! 🚀
