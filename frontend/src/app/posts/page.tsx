import { Suspense } from 'react';
import PostsList from '@/components/PostsList';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

async function getPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/posts`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
  
  return res.json();
}

export default async function PostsPage() {
  const postsData = await getPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Posts</h1>
      </div>
      
      <Suspense fallback={<PostsLoadingSkeleton />}>
        <PostsList initialPosts={postsData.data || []} />
      </Suspense>
    </div>
  );
}

function PostsLoadingSkeleton() {
  return (
    <div className="grid gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}
