import { io, Socket } from 'socket.io-client';
import { config } from '../config';

export interface RoomInfo {
  roomId: string;
  playerColor: 'white' | 'black';
}

export interface MoveData {
  from: string;
  to: string;
  promotion?: string;
}

export class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string;

  constructor(serverUrl = config.apiUrl) {
    this.serverUrl = serverUrl;
  }

  /**
   * Connect to the socket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl);

      this.socket.on('connect', () => {
        console.log('Connected to server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
    });
  }

  /**
   * Create a new room
   */
  createRoom(): Promise<RoomInfo> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('createRoom', (response: { roomId: string; error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve({
            roomId: response.roomId,
            playerColor: 'white', // Room creator is white
          });
        }
      });
    });
  }

  /**
   * Join an existing room
   */
  joinRoom(roomId: string): Promise<RoomInfo> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('joinRoom', { roomId }, (response: { success: boolean; fen?: string; error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve({
            roomId,
            playerColor: 'black', // Room joiner is black
          });
        }
      });
    });
  }

  /**
   * Send a move to the opponent
   */
  sendMove(roomId: string, move: MoveData): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('move', { roomId, move });
  }

  /**
   * Listen for opponent moves
   */
  onMove(callback: (move: MoveData) => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.on('move', callback);
  }

  /**
   * Listen for opponent disconnect
   */
  onOpponentDisconnect(callback: () => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.on('opponentDisconnected', callback);
  }

  /**
   * Listen for room full event
   */
  onRoomFull(callback: () => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.on('roomFull', callback);
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Singleton instance
let socketInstance: SocketService | null = null;

export const getSocketService = (): SocketService => {
  if (!socketInstance) {
    socketInstance = new SocketService();
  }
  return socketInstance;
};
