'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, loading } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-lg z-50">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-light tracking-wider uppercase">
              Leboncon
            </h1>
          </Link>

          <div className="flex items-center space-x-8">
            {loading ? (
              <div className="animate-pulse w-24 h-8 bg-gray-200 dark:bg-gray-800" />
            ) : !user ? (
              <div className="flex items-center space-x-8">
                <Link href="/signin">
                  <span className="nav-link">Connexion</span>
                </Link>
                <Link href="/signup">
                  <span className="nav-link">Inscription</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-8">
                <Link href="/post-ad">
                  <span className="nav-link">Publier</span>
                </Link>
                <Link href="/messages">
                  <span className="nav-link">Messages</span>
                </Link>
                <Link href="/profile">
                  <span className="nav-link">{user.first_name}</span>
                </Link>
              </div>
            )}
            
            <button
              onClick={toggleDarkMode}
              className="p-2"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 