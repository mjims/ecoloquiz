'use client';

import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <Header />

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 space-y-6">
        {/* Sign-up Call-to-Action */}
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

        {/* Welcome Section */}
        <div className="bg-gradient-to-b from-teal-50 to-white rounded-lg p-6 text-center border border-teal-100">
          <div className="flex justify-center items-center mb-4">
            <div className="text-3xl mr-3">🌱</div>
            <div>
              <h1 className="text-2xl font-bold text-teal-700">
                Bienvenue sur <span className="block text-2xl mt-1">
                  <span className="text-teal-700">Zéro</span>
                  <span className="text-sm block text-gray-700">Déchet</span>
                </span>
              </h1>
            </div>
            <div className="text-3xl ml-3">🌿</div>
          </div>
          <p className="text-sm text-teal-800 leading-relaxed">
            Les quiz qui te testent sur <strong>3 niveaux</strong> pour apprendre comment réduire et recycler tes déchets
          </p>
        </div>

        {/* Game Rules */}
        <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">
            Les règles du jeu
          </h2>

          {/* Good Answer */}
          <div className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
            <span className="text-sm font-medium text-green-800">
              Bonne réponse
            </span>
            <span className="text-sm font-bold text-green-600">
              +5 points
            </span>
          </div>

          {/* Bad Answer */}
          <div className="flex items-center justify-between bg-red-50 rounded-lg p-3 border border-red-200">
            <span className="text-sm font-medium text-red-800">
              Mauvaise réponse
            </span>
            <span className="text-sm font-bold text-red-600">
              -10 points
            </span>
          </div>

          {/* Emoji Tip */}
          <div className="flex items-start bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <div className="text-2xl mr-3">🤓</div>
            <p className="text-xs text-gray-700 leading-relaxed flex-1">
              Tu verras, c&apos;est fastoche, t&apos;as vite fait de gagner des points rapidement !
            </p>
          </div>
        </div>

        {/* Suggested Quiz */}
        <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Quiz suggéré
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Découvre comment faire la différence pour notre planète grâce à ce quiz !
          </p>

          {/* Quiz Card */}
          <div className="bg-gradient-to-b from-teal-50 to-white rounded-lg p-4 border border-teal-100">
            <h3 className="font-semibold text-gray-800 mb-3">
              Cycle de vie des déchets
            </h3>

            <div className="flex items-center mb-4">
              <span className="text-yellow-400 text-xl mr-2">⭐</span>
              <span className="text-sm text-gray-600">Niveau 1</span>
            </div>

            {/* Trash Can Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-5xl">🗑️</span>
              </div>
            </div>

            {/* CTA Button */}
            <Link href="/quiz/cycle-vie-dechets">
              <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm">
                Répondre au quiz pour<br />un code promo
              </button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
