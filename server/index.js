import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/games.js';
import leaderboardRoutes from './routes/leaderboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);

// Configure CORS - Allow all origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? true  // Allow all origins in production
    : "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(httpServer, {
  cors: corsOptions
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  // Debug: Log current directory info
  console.log('🔍 __filename:', __filename);
  console.log('🔍 __dirname:', __dirname);
  console.log('🔍 process.cwd():', process.cwd());
  
  // Try multiple possible paths for client/dist
  const possiblePaths = [
    path.resolve(__dirname, '..', 'client', 'dist'),           // Standard: server/../client/dist
    path.resolve(process.cwd(), 'client', 'dist'),             // From cwd
    path.resolve(process.cwd(), '..', 'client', 'dist'),       // From cwd/../client/dist
    path.resolve(__dirname, '..', '..', 'client', 'dist'),     // Up two levels
    path.resolve('/opt/render/project', 'src', 'client', 'dist'), // Absolute with /src/
    path.resolve('/opt/render/project', 'client', 'dist'),     // Absolute without /src/
  ];
  
  let clientDistPath = null;
  
  for (const testPath of possiblePaths) {
    console.log('🔍 Testing path:', testPath);
    if (fs.existsSync(testPath)) {
      const indexExists = fs.existsSync(path.join(testPath, 'index.html'));
      console.log('  � Directory exists:', true, '| index.html exists:', indexExists);
      if (indexExists) {
        clientDistPath = testPath;
        console.log('✅ Found valid client/dist at:', clientDistPath);
        const files = fs.readdirSync(clientDistPath);
        console.log('📄 Files in dist:', files.slice(0, 10)); // Show first 10 files
        break;
      }
    } else {
      console.log('  ❌ Path does not exist');
    }
  }
  
  if (!clientDistPath) {
    console.error('❌ Could not find client/dist in any expected location!');
    console.error('Tried paths:', possiblePaths);
  } else {
    // Serve static files from the client/dist directory
    app.use(express.static(clientDistPath));

    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API route not found' });
      }
      const indexPath = path.join(clientDistPath, 'index.html');
      res.sendFile(indexPath);
    });
  }
}

// Store rooms and their state
const rooms = new Map();

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Create a new room
  socket.on('createRoom', (callback) => {
    const roomId = generateRoomId();
    
    // Initialize room
    rooms.set(roomId, {
      players: [socket.id],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Starting position
      createdAt: Date.now()
    });

    socket.join(roomId);
    console.log(`Room created: ${roomId} by ${socket.id}`);
    
    callback({ roomId });
  });

  // Join an existing room
  socket.on('joinRoom', ({ roomId }, callback) => {
    const room = rooms.get(roomId);

    if (!room) {
      callback({ error: 'Room not found' });
      return;
    }

    if (room.players.length >= 2) {
      callback({ error: 'Room is full' });
      return;
    }

    // Add player to room
    room.players.push(socket.id);
    socket.join(roomId);

    console.log(`${socket.id} joined room ${roomId}`);
    
    // Notify both players that the room is ready
    io.to(roomId).emit('roomFull');
    
    callback({ success: true, fen: room.fen });
  });

  // Handle move
  socket.on('move', ({ roomId, move }) => {
    const room = rooms.get(roomId);

    if (!room) {
      console.error('Room not found:', roomId);
      return;
    }

    // Broadcast move to other player in the room
    socket.to(roomId).emit('move', move);
    
    console.log(`Move in room ${roomId}:`, move);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Find and clean up rooms where this player was
    rooms.forEach((room, roomId) => {
      if (room.players.includes(socket.id)) {
        // Notify other player
        socket.to(roomId).emit('opponentDisconnected');
        
        // Remove room after disconnect
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted after disconnect`);
      }
    });
  });
});

// Clean up old empty rooms periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  const ROOM_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  rooms.forEach((room, roomId) => {
    if (now - room.createdAt > ROOM_TIMEOUT) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} deleted due to timeout`);
    }
  });
}, 5 * 60 * 1000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
      database: 'MongoDB',
      state: states[dbState],
      dbName: mongoose.connection.name || 'not connected'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`✓ Chess server running on http://localhost:${PORT}`);
  console.log(`✓ Socket.IO server ready for connections`);
});
