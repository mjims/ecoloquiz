'use client';

import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';
import { useState } from 'react';

// Mock user data - à remplacer par le vrai contexte d'authentification
const mockUser = {
  isAuthenticated: true, // Changer à false pour voir la version non connectée
  quizCompleted: 45,
  levels: [
    { level: 1, stars: 1, progress: 100, name: 'Niveau 1' },
    { level: 2, stars: 2, progress: 42, name: 'Niveau 2' },
    { level: 3, stars: 3, progress: 0, name: 'Niveau 3' },
  ]
};

export default function Home() {
  const [user] = useState(mockUser);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <Header />

      <main className="flex-1 w-full px-4 py-6 lg:py-10">
        {/* Desktop Layout: 2 columns when authenticated, single column otherwise */}
        <div className={`max-w-7xl mx-auto ${user.isAuthenticated ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : 'max-w-md mx-auto'}`}>

          {/* Main Content */}
          <div className={`space-y-6 ${user.isAuthenticated ? 'lg:col-span-8' : ''}`}>
            {/* Call-to-Action Banner */}
            {user.isAuthenticated ? (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 lg:p-5 relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xs text-purple-600 mb-1 uppercase tracking-wide">
                      En ce moment
                    </h2>
                    <p className="text-sm lg:text-base text-gray-800">
                      Joue au quiz Zéro déchet et participe au tirage au sort pour gagner des cadeaux !
                    </p>
                  </div>
                  <div className="ml-3 text-4xl lg:text-5xl">🎁</div>
                </div>
              </div>
            ) : (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-purple-900 mb-1">
                      Inscrits-toi
                    </h2>
                    <p className="text-sm text-gray-800">
                      N&apos;attends pas, inscrits-toi et joue au quiz Zéro déchet pour gagner des cadeaux !
                    </p>
                  </div>
                  <div className="ml-3 text-4xl">🎁</div>
                </div>
              </div>
            )}

            {/* Welcome Section */}
            <div className="bg-gradient-to-b from-teal-50 to-white rounded-lg p-6 lg:p-8 text-center border border-teal-100">
              <div className="flex justify-center items-center mb-4">
                <div className="text-3xl lg:text-4xl mr-3">🌱</div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-teal-700">
                    Bienvenue sur <span className="block text-2xl lg:text-3xl mt-1">
                      <span className="text-teal-700">Zéro</span>
                      <span className="text-sm lg:text-base block text-gray-700">Déchet</span>
                    </span>
                  </h1>
                </div>
                <div className="text-3xl lg:text-4xl ml-3">🌿</div>
              </div>
              <p className="text-sm lg:text-base text-teal-800 leading-relaxed max-w-2xl mx-auto">
                Les quiz qui te testent sur <strong>3 niveaux</strong> pour apprendre comment réduire et recycler tes déchets
              </p>
            </div>

            {/* Suggested Quiz */}
            <div className="bg-white rounded-lg shadow-sm p-5 lg:p-6 space-y-4">
              <div className="text-xs lg:text-sm text-gray-500 uppercase tracking-wide">
                Quiz suggéré
              </div>
              <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
                Découvre comment faire la différence pour notre planète grâce à ce quiz !
              </p>

              {/* Quiz Card */}
              <div className="bg-gradient-to-b from-teal-50 to-white rounded-lg p-4 lg:p-5 border border-teal-100">
                <h3 className="font-semibold text-gray-800 mb-3 text-lg">
                  Cycle de vie des déchets
                </h3>

                <div className="flex items-center mb-4">
                  <span className="text-yellow-400 text-xl lg:text-2xl mr-2">⭐</span>
                  <span className="text-sm lg:text-base text-gray-600">Niveau 1</span>
                </div>

                {/* Trash Can Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 lg:w-28 lg:h-28 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-5xl lg:text-6xl">🗑️</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link href="/quiz/cycle-vie-dechets">
                  <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm lg:text-base mb-3">
                    Répondre au quiz pour un code promo
                  </button>
                </Link>

                {/* Additional buttons for authenticated users */}
                {user.isAuthenticated && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-3">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors text-sm lg:text-base flex-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Partager avec mes potes
                    </button>
                    <Link href="/quiz" className="flex-1">
                      <button className="w-full px-4 py-2 text-teal-700 hover:text-teal-800 font-medium text-sm lg:text-base underline">
                        Voir tous les quiz
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Game Rules - Only show for non-authenticated users on mobile */}
            {!user.isAuthenticated && (
              <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
                <h2 className="text-lg font-bold text-gray-800">
                  Les règles du jeu
                </h2>

                <div className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
                  <span className="text-sm font-medium text-green-800">
                    Bonne réponse
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    +5 points
                  </span>
                </div>

                <div className="flex items-center justify-between bg-red-50 rounded-lg p-3 border border-red-200">
                  <span className="text-sm font-medium text-red-800">
                    Mauvaise réponse
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    -10 points
                  </span>
                </div>

                <div className="flex items-start bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <div className="text-2xl mr-3">🤓</div>
                  <p className="text-xs text-gray-700 leading-relaxed flex-1">
                    Tu verras, c&apos;est fastoche, t&apos;as vite fait de gagner des points rapidement !
                  </p>
                </div>
              </div>
            )}

            {/* Progression on Mobile - Only for authenticated users */}
            {user.isAuthenticated && (
              <div className="lg:hidden bg-white rounded-lg shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Progression</h2>
                  <span className="text-teal-600 font-bold text-xl">
                    {user.quizCompleted} <span className="text-sm text-gray-600 font-normal">quiz terminés</span>
                  </span>
                </div>

                {user.levels.map((level) => (
                  <div key={level.level} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Niveau {level.level}</span>
                        <div className="flex">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <span key={i} className={`text-lg ${i < level.stars ? 'text-yellow-400' : 'text-gray-300'}`}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-700">{level.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${level.progress > 0 ? 'bg-teal-600' : 'bg-gray-200'}`}
                        style={{ width: `${level.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Progression on Desktop */}
          {user.isAuthenticated && (
            <div className="hidden lg:block lg:col-span-4">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24 space-y-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Progression</h2>
                </div>
                <div className="text-center mb-6">
                  <span className="text-teal-600 font-bold text-3xl">{user.quizCompleted}</span>
                  <p className="text-sm text-gray-600">quiz terminés</p>
                </div>

                {user.levels.map((level) => (
                  <div key={level.level} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Niveau {level.level}</span>
                        <div className="flex">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <span key={i} className={`text-base ${i < level.stars ? 'text-yellow-400' : 'text-gray-300'}`}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-700">{level.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${level.progress > 0 ? 'bg-teal-600' : 'bg-gray-200'}`}
                        style={{ width: `${level.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
