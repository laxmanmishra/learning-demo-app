import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { config } from '../config';
import { pgPool } from '../database/postgres';
import { mysqlPool } from '../database/mysql';
import { validate, authSchemas } from '../middleware/validation';
import { authenticateJWT } from '../middleware/auth';
import { AuthenticatedRequest, User, ApiResponse } from '../types';

const router = Router();

// Register
router.post(
  '/register',
  validate(authSchemas.register),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email, password, name } = req.body;
      
      // Check if user exists
      const existingUser = await pgPool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      if (existingUser.rows.length > 0) {
        res.status(400).json({ success: false, error: 'Email already registered' });
        return;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      const result = await pgPool.query<User>(
        `INSERT INTO users (email, password, name) 
         VALUES ($1, $2, $3) 
         RETURNING id, email, name, created_at, updated_at`,
        [email, hashedPassword, name]
      );
      
      const user = result.rows[0];
      
      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      // Log analytics to MySQL
      await mysqlPool.query(
        'INSERT INTO analytics (event_type, user_id, metadata) VALUES (?, ?, ?)',
        ['user_registered', user.id, JSON.stringify({ email: user.email })]
      );
      
      res.status(201).json({
        success: true,
        data: { user, token },
        message: 'Registration successful',
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, error: 'Registration failed' });
    }
  }
);

// Login
router.post(
  '/login',
  validate(authSchemas.login),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      
      const result = await pgPool.query<User>(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
      }
      
      const user = result.rows[0];
      
      if (!user.password) {
        res.status(401).json({ success: false, error: 'Please use Google login' });
        return;
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
      }
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      // Log to MySQL
      await mysqlPool.query(
        'INSERT INTO analytics (event_type, user_id) VALUES (?, ?)',
        ['user_login', user.id]
      );
      
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        data: { user: userWithoutPassword, token },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Login failed' });
    }
  }
);

// Google OAuth2
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as User;
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.redirect(`${config.frontendUrl}/auth/callback?token=${token}`);
  }
);

// Get current user
router.get(
  '/me',
  authenticateJWT,
  (req: AuthenticatedRequest, res: Response): void => {
    const response: ApiResponse<User> = {
      success: true,
      data: req.user,
    };
    res.json(response);
  }
);

// Logout (client-side token removal, but we log it)
router.post(
  '/logout',
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      await mysqlPool.query(
        'INSERT INTO analytics (event_type, user_id) VALUES (?, ?)',
        ['user_logout', req.user?.id]
      );
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Logout failed' });
    }
  }
);

export default router;
