import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload, WebSocketMessage } from '../types';
import { redis } from '../database/redis';

let io: Server;

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

export const initWebSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: config.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    try {
      const decoded = jwt.verify(token as string, config.jwt.secret) as JwtPayload;
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });
  
  io.on('connection', async (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Store user presence in Redis
    if (socket.userId) {
      await redis.sadd('online_users', socket.userId);
      await redis.hset(`user:${socket.userId}`, 'socketId', socket.id, 'lastSeen', Date.now().toString());
    }
    
    // Join user's personal room
    socket.join(`user:${socket.userId}`);
    
    // Broadcast online status
    io.emit('presence', {
      type: 'presence',
      payload: { userId: socket.userId, status: 'online' },
      timestamp: new Date(),
    } as WebSocketMessage);
    
    // Handle chat messages
    socket.on('message', async (data: { to?: string; content: string; room?: string }) => {
      const message: WebSocketMessage = {
        type: 'message',
        payload: {
          from: socket.userId,
          content: data.content,
          timestamp: new Date(),
        },
        userId: socket.userId,
        timestamp: new Date(),
      };
      
      if (data.to) {
        // Private message
        io.to(`user:${data.to}`).emit('message', message);
        socket.emit('message', message); // Echo back
      } else if (data.room) {
        // Room message
        io.to(data.room).emit('message', message);
      } else {
        // Broadcast to all
        io.emit('message', message);
      }
      
      // Store in Redis for history (last 100 messages)
      await redis.lpush('chat:history', JSON.stringify(message));
      await redis.ltrim('chat:history', 0, 99);
    });
    
    // Handle typing indicator
    socket.on('typing', (data: { to?: string; room?: string; isTyping: boolean }) => {
      const typingMessage: WebSocketMessage = {
        type: 'typing',
        payload: { userId: socket.userId, isTyping: data.isTyping },
        userId: socket.userId,
        timestamp: new Date(),
      };
      
      if (data.to) {
        io.to(`user:${data.to}`).emit('typing', typingMessage);
      } else if (data.room) {
        socket.to(data.room).emit('typing', typingMessage);
      }
    });
    
    // Handle room join
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      socket.to(roomId).emit('notification', {
        type: 'notification',
        payload: { message: `User ${socket.userId} joined the room` },
        timestamp: new Date(),
      } as WebSocketMessage);
    });
    
    // Handle room leave
    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
      socket.to(roomId).emit('notification', {
        type: 'notification',
        payload: { message: `User ${socket.userId} left the room` },
        timestamp: new Date(),
      } as WebSocketMessage);
    });
    
    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      if (socket.userId) {
        await redis.srem('online_users', socket.userId);
        await redis.hset(`user:${socket.userId}`, 'lastSeen', Date.now().toString());
      }
      
      io.emit('presence', {
        type: 'presence',
        payload: { userId: socket.userId, status: 'offline' },
        timestamp: new Date(),
      } as WebSocketMessage);
    });
  });
  
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: unknown): void => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToAll = (event: string, data: unknown): void => {
  io.emit(event, data);
};
