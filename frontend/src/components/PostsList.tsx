'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name?: string;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function PostsList({ initialPosts }: { initialPosts: Post[] }) {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts([data.data, ...posts]);
        setTitle('');
        setContent('');
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!token) return;
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map((p) => (p.id === id ? data.data : p)));
        setEditingId(null);
        setTitle('');
        setContent('');
      }
    } catch (error) {
      console.error('Failed to update post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`${API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const startEdit = (post: Post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
  };

  return (
    <div>
      {user && (
        <div className="mb-6">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus size={20} />
              New Post
            </button>
          ) : (
            <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create New Post</h3>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Post content"
                className="w-full px-4 py-2 border rounded-lg mb-4 h-32 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setTitle(''); setContent(''); }}
                  className="bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="grid gap-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No posts yet. Be the first to create one!
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              {editingId === post.id ? (
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg mb-4 h-32 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(post.id)}
                      disabled={isLoading}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save'}
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setTitle(''); setContent(''); }}
                      className="bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {post.title}
                    </h2>
                    {user?.id === post.author_id && (
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(post)} className="text-blue-500 hover:text-blue-700">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{post.content}</p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    By {post.author_name || 'Unknown'} • {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
