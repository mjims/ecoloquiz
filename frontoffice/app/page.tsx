'use client';

import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 lg:py-10">
        {/* Desktop Grid Layout: 2 columns on md+, 1 column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content - Takes 2 columns on desktop */}
          <div className="md:col-span-2 space-y-6">
            {/* Sign-up Call-to-Action */}
            <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4 lg:p-6 relative">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-sm lg:text-base font-semibold text-purple-900 mb-1">
                    Inscrits-toi
                  </h2>
                  <p className="text-sm lg:text-base text-gray-700">
                    N&apos;attends pas, inscrits-toi et joue au quiz Zéro déchet pour gagner des cadeaux !
                  </p>
                </div>
                <div className="ml-3 text-4xl lg:text-5xl">🎁</div>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="bg-gradient-to-b from-green-50 to-white rounded-lg p-6 lg:p-8 text-center">
              <div className="flex justify-center items-center mb-4">
                <div className="text-3xl lg:text-4xl mr-3">🌱</div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                    Bienvenue sur <span className="text-green-600">Zéro</span>
                    <span className="text-sm lg:text-base block text-gray-700">Déchet</span>
                  </h1>
                </div>
                <div className="text-3xl lg:text-4xl ml-3">🌿</div>
              </div>
              <p className="text-sm lg:text-base text-gray-700 leading-relaxed max-w-2xl mx-auto">
                Les quiz qui te testent sur <strong>3 niveaux</strong> pour apprendre comment réduire et recycler tes déchets
              </p>
            </div>

            {/* Game Rules */}
            <div className="bg-white rounded-lg shadow-sm p-5 lg:p-6 space-y-4">
              <h2 className="text-lg lg:text-xl font-bold text-gray-800">
                Les règles du jeu
              </h2>

              {/* Good Answer */}
              <div className="flex items-center justify-between bg-green-100 rounded-lg p-3 lg:p-4">
                <span className="text-sm lg:text-base font-medium text-green-800">
                  Bonne réponse
                </span>
                <span className="text-sm lg:text-base font-bold text-green-700">
                  +5 points
                </span>
              </div>

              {/* Bad Answer */}
              <div className="flex items-center justify-between bg-red-100 rounded-lg p-3 lg:p-4">
                <span className="text-sm lg:text-base font-medium text-red-800">
                  Mauvaise réponse
                </span>
                <span className="text-sm lg:text-base font-bold text-red-700">
                  -10 points
                </span>
              </div>

              {/* Emoji Tip */}
              <div className="flex items-start bg-yellow-50 rounded-lg p-3 lg:p-4 border border-yellow-200">
                <div className="text-2xl lg:text-3xl mr-3">🤓</div>
                <p className="text-xs lg:text-sm text-gray-700 leading-relaxed flex-1">
                  Tu verras, c&apos;est fastoche, t&apos;as vite fait de gagner des points rapidement !
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Quiz Suggéré */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-5 lg:p-6 space-y-4 md:sticky md:top-24">
              <div className="text-xs lg:text-sm text-gray-500 uppercase tracking-wide">
                Quiz suggéré
              </div>
              <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
                Découvre comment faire la différence pour notre planète grâce à ce quiz !
              </p>

              {/* Quiz Card */}
              <div className="bg-gray-50 rounded-lg p-4 lg:p-5">
                <h3 className="font-semibold text-gray-800 mb-3 lg:text-lg">
                  Cycle de vie des déchets
                </h3>

                <div className="flex items-center mb-4">
                  <span className="text-yellow-400 text-xl lg:text-2xl mr-2">⭐</span>
                  <span className="text-sm lg:text-base text-gray-600">Niveau 1</span>
                </div>

                {/* Trash Can Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-4xl lg:text-5xl">🗑️</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link href="/quiz/cycle-vie-dechets">
                  <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm lg:text-base">
                    Répondre au quiz pour un code promo
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Quiz Cards on Desktop - Shown below on larger screens */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 mt-8">
          {/* Quiz Card 2 */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">
              Le tri sélectif
            </h3>
            <div className="flex items-center mb-3">
              <span className="text-yellow-400 text-xl mr-2">⭐⭐</span>
              <span className="text-sm text-gray-600">Niveau 2</span>
            </div>
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-3xl">♻️</span>
              </div>
            </div>
            <Link href="/quiz/tri-selectif">
              <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                Commencer
              </button>
            </Link>
          </div>

          {/* Quiz Card 3 */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">
              Compostage domestique
            </h3>
            <div className="flex items-center mb-3">
              <span className="text-yellow-400 text-xl mr-2">⭐</span>
              <span className="text-sm text-gray-600">Niveau 1</span>
            </div>
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center">
                <span className="text-3xl">🌱</span>
              </div>
            </div>
            <Link href="/quiz/compostage">
              <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                Commencer
              </button>
            </Link>
          </div>

          {/* Quiz Card 4 */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">
              Réduction des déchets
            </h3>
            <div className="flex items-center mb-3">
              <span className="text-yellow-400 text-xl mr-2">⭐⭐⭐</span>
              <span className="text-sm text-gray-600">Niveau 3</span>
            </div>
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 bg-yellow-200 rounded-full flex items-center justify-center">
                <span className="text-3xl">🎯</span>
              </div>
            </div>
            <Link href="/quiz/reduction-dechets">
              <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                Commencer
              </button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
