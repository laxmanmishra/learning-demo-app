import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Demo App - Full Stack Application',
  description: 'Full-stack demo with Next.js, Express, PostgreSQL, MySQL, Redis, and WebSockets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
