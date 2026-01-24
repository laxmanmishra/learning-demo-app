import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config';
import './config/passport';
import passport from 'passport';
import { initPostgres } from './database/postgres';
import { initMySQL } from './database/mysql';
import { initWebSocket } from './websocket';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: config.nodeEnv === 'development' ? err.message : 'Internal server error',
  });
});

// Initialize databases and start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize databases
    await initPostgres();
    await initMySQL();
    
    // Initialize WebSocket
    initWebSocket(server);
    
    server.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📡 WebSocket server ready`);
      console.log(`🔧 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, server };
