import { Router, Request, Response } from 'express';
import { pgPool } from '../database/postgres';
import { cacheGet, cacheSet, cacheDelete } from '../database/redis';
import { authenticateJWT, optionalAuth } from '../middleware/auth';
import { validate, postSchemas } from '../middleware/validation';
import { Post, PaginatedResponse } from '../types';

const router = Router();

// Get all posts (with pagination and caching)
router.get(
  '/',
  optionalAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      const cacheKey = `posts:page:${page}:limit:${limit}`;
      const cached = await cacheGet<{ posts: Post[]; total: number }>(cacheKey);
      
      if (cached) {
        const response: PaginatedResponse<Post> = {
          success: true,
          data: cached.posts,
          pagination: {
            page,
            limit,
            total: cached.total,
            totalPages: Math.ceil(cached.total / limit),
          },
        };
        res.json(response);
        return;
      }
      
      const postsResult = await pgPool.query<Post>(
        `SELECT p.*, u.name as author_name, u.avatar as author_avatar
         FROM posts p
         LEFT JOIN users u ON p.author_id = u.id
         ORDER BY p.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      
      const countResult = await pgPool.query('SELECT COUNT(*) FROM posts');
      const total = parseInt(countResult.rows[0].count);
      
      // Cache for 5 minutes
      await cacheSet(cacheKey, { posts: postsResult.rows, total }, 300);
      
      const response: PaginatedResponse<Post> = {
        success: true,
        data: postsResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
      
      res.json(response);
    } catch (error) {
      console.error('Get posts error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch posts' });
    }
  }
);

// Get single post
router.get(
  '/:id',
  validate(postSchemas.getById),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const cacheKey = `post:${id}`;
      const cached = await cacheGet<Post>(cacheKey);
      
      if (cached) {
        res.json({ success: true, data: cached });
        return;
      }
      
      const result = await pgPool.query<Post>(
        `SELECT p.*, u.name as author_name, u.avatar as author_avatar
         FROM posts p
         LEFT JOIN users u ON p.author_id = u.id
         WHERE p.id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Post not found' });
        return;
      }
      
      await cacheSet(cacheKey, result.rows[0], 600);
      
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Get post error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch post' });
    }
  }
);

// Create post
router.post(
  '/',
  authenticateJWT,
  validate(postSchemas.create),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, content } = req.body;
      const authorId = req.user?.id;
      
      const result = await pgPool.query<Post>(
        `INSERT INTO posts (title, content, author_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [title, content || '', authorId]
      );
      
      // Invalidate posts cache
      await cacheDelete('posts:*');
      
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ success: false, error: 'Failed to create post' });
    }
  }
);

// Update post
router.put(
  '/:id',
  authenticateJWT,
  validate(postSchemas.update),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.user?.id;
      
      // Check ownership
      const existingPost = await pgPool.query(
        'SELECT author_id FROM posts WHERE id = $1',
        [id]
      );
      
      if (existingPost.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Post not found' });
        return;
      }
      
      if (existingPost.rows[0].author_id !== userId) {
        res.status(403).json({ success: false, error: 'Not authorized' });
        return;
      }
      
      const result = await pgPool.query<Post>(
        `UPDATE posts 
         SET title = COALESCE($1, title), 
             content = COALESCE($2, content),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [title, content, id]
      );
      
      // Invalidate cache
      await cacheDelete(`post:${id}`);
      await cacheDelete('posts:*');
      
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Update post error:', error);
      res.status(500).json({ success: false, error: 'Failed to update post' });
    }
  }
);

// Delete post
router.delete(
  '/:id',
  authenticateJWT,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const existingPost = await pgPool.query(
        'SELECT author_id FROM posts WHERE id = $1',
        [id]
      );
      
      if (existingPost.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Post not found' });
        return;
      }
      
      if (existingPost.rows[0].author_id !== userId) {
        res.status(403).json({ success: false, error: 'Not authorized' });
        return;
      }
      
      await pgPool.query('DELETE FROM posts WHERE id = $1', [id]);
      
      // Invalidate cache
      await cacheDelete(`post:${id}`);
      await cacheDelete('posts:*');
      
      res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ success: false, error: 'Failed to delete post' });
    }
  }
);

export default router;
