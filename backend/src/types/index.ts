import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  google_id?: string;
  avatar?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author?: User;
  created_at: Date;
  updated_at: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AnalyticsEvent {
  id: number;
  event_type: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
  created_at: Date;
}

export interface WebSocketMessage {
  type: 'message' | 'notification' | 'typing' | 'presence';
  payload: unknown;
  userId?: string;
  timestamp: Date;
}
