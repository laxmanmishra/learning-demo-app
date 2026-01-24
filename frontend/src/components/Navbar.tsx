'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600">Demo App</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-200 hover:text-primary-600 px-3 py-2 rounded-md font-medium"
            >
              Home
            </Link>
            <Link
              href="/posts"
              className="text-gray-700 dark:text-gray-200 hover:text-primary-600 px-3 py-2 rounded-md font-medium"
            >
              Posts
            </Link>
            <Link
              href="/chat"
              className="text-gray-700 dark:text-gray-200 hover:text-primary-600 px-3 py-2 rounded-md font-medium"
            >
              Chat
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 dark:text-gray-200 flex items-center space-x-2">
                  <User size={20} />
                  <span>{user.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 px-3 py-2 rounded-md font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 px-3 py-2 rounded-md"
            >
              Home
            </Link>
            <Link
              href="/posts"
              className="block text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 px-3 py-2 rounded-md"
            >
              Posts
            </Link>
            <Link
              href="/chat"
              className="block text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 px-3 py-2 rounded-md"
            >
              Chat
            </Link>
            {user ? (
              <>
                <div className="px-3 py-2 text-gray-700 dark:text-gray-200">
                  {user.name}
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left text-red-500 hover:bg-gray-100 dark:hover:bg-slate-700 px-3 py-2 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 px-3 py-2 rounded-md"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block text-primary-600 hover:bg-gray-100 dark:hover:bg-slate-700 px-3 py-2 rounded-md"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
