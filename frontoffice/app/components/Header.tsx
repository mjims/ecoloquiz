'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = storage.getToken();
    setIsAuthenticated(!!token);
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-green-600">Ecolo</span>
              <span className="text-sm text-gray-700 -mt-1">Quiz</span>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              Accueil
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
              >
                Tableau de bord
              </Link>
            )}
            <Link
              href="/quiz"
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              Quiz
            </Link>
            {isAuthenticated && (
              <Link
                href="/gifts"
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
              >
                Mes cadeaux
              </Link>
            )}
            <Link
              href="/about"
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              À propos
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* User Dropdown */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Menu utilisateur"
                >
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      href="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Mon Profil
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        storage.clear();
                        setIsAuthenticated(false);
                        setIsUserDropdownOpen(false);
                        window.location.href = '/';
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Déconnexion
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <>
                {/* Desktop Buttons */}
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/register"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    S'inscrire
                  </Link>
                </div>

                {/* Mobile Icon (optional, kept for quick access or can be removed if preferred) */}
                <Link
                  href="/login"
                  className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Se connecter"
                >
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
              </>
            )}

            {/* Menu Icon - Only on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="block text-gray-700 hover:text-green-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Accueil
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link
                    href="/dashboard"
                    className="block text-gray-700 hover:text-green-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tableau de bord
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/quiz"
                  className="block text-gray-700 hover:text-green-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Quiz
                </Link>
              </li>
              {isAuthenticated && (
                <>
                  <li>
                    <Link
                      href="/gifts"
                      className="block text-gray-700 hover:text-green-600 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Mes cadeaux
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/profile"
                      className="block text-gray-700 hover:text-green-600 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Mon profil
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link
                  href="/about"
                  className="block text-gray-700 hover:text-green-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  À propos
                </Link>
              </li>
              {!isAuthenticated && (
                <>
                  <li className="pt-2 border-t border-gray-100">
                    <Link
                      href="/login"
                      className="block text-gray-700 hover:text-green-600 transition-colors font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Se connecter
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="block text-green-600 hover:text-green-700 transition-colors font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      S'inscrire
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
