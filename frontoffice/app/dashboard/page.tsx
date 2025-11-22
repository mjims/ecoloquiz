'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface Quiz {
  id: string;
  title: string;
  theme_id: string;
  level_id: number;
  max_score?: number;
  theme?: {
    id: string;
    name: string;
  };
  level?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface ProgressionData {
  quizCompleted: number;
  totalPoints?: number;
  levels: Array<{
    level: number;
    name: string;
    percentage: number;
    stars: number;
  }>;
}

interface CurrentGame {
  has_game_in_progress: boolean;
  theme_id: string | null;
  theme_name: string | null;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedQuiz, setSuggestedQuiz] = useState<Quiz | null>(null);
  const [progressionData, setProgressionData] = useState<ProgressionData>({
    quizCompleted: 0,
    levels: [],
  });
  const [currentGame, setCurrentGame] = useState<CurrentGame>({
    has_game_in_progress: false,
    theme_id: null,
    theme_name: null,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        // Fetch suggested quiz
        const quizResponse = await apiClient.getSuggestedQuiz();
        if (quizResponse.data && quizResponse.data.quiz) {
          setSuggestedQuiz(quizResponse.data.quiz);
        }

        // Fetch progression data
        const progressionResponse = await apiClient.getProgression();
        if (progressionResponse.data) {
          setProgressionData(progressionResponse.data);
        }

        // Fetch current game in progress
        const currentGameResponse = await apiClient.getCurrentGame();
        if (currentGameResponse.data) {
          setCurrentGame(currentGameResponse.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <Header />

        <main className="flex-1 w-full px-4 py-6 lg:py-10">
          <div className="max-w-7xl mx-auto">
            {/* Desktop: 2 columns, Mobile: 1 column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Main Content - Left column (2/3 on desktop) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Event Banner */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 lg:p-5 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xs text-purple-600 mb-1 font-medium">
                        En ce moment
                      </h2>
                      <p className="text-sm lg:text-base text-gray-800">
                        Joue au quiz Écolo Quiz et participe au tirage au sort pour gagner des cadeaux !
                      </p>
                    </div>
                    <div className="ml-3 text-4xl lg:text-5xl">🎁</div>
                  </div>
                </div>

                {/* Welcome Section */}
                <div className="bg-gradient-to-b from-teal-50 to-white rounded-lg p-6 lg:p-8 text-center border border-teal-100">
                  <div className="flex justify-center items-center mb-4">
                    <div className="text-3xl lg:text-4xl mr-3">🌱</div>
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-teal-700">
                        Bienvenue sur <span className="block text-2xl lg:text-3xl mt-1">
                          <span className="text-teal-700">Ecolo</span>
                          <span className="text-sm lg:text-base block text-gray-700">Quiz</span>
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
                {suggestedQuiz ? (
                  <div className="bg-white rounded-lg shadow-sm p-5 lg:p-6 space-y-4">
                    <div className="text-xs lg:text-sm text-gray-500 uppercase tracking-wide">
                      Quiz suggéré
                    </div>
                    <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
                      Découvre comment faire la différence pour notre planète grâce à ce quiz !
                    </p>

                    {/* Quiz Card */}
                    <div className="bg-gradient-to-b from-teal-50 to-white rounded-lg p-4 lg:p-5 border border-teal-100">
                      <h3 className="font-semibold text-gray-800 mb-3 text-lg lg:text-xl">
                        {suggestedQuiz.title}
                      </h3>

                      <div className="flex items-center mb-4">
                        <span className="text-yellow-400 text-xl lg:text-2xl mr-2">⭐</span>
                        <span className="text-sm lg:text-base text-gray-600">
                          {suggestedQuiz.level?.name || 'Niveau 1'}
                        </span>
                      </div>

                      {/* Trash Can Icon */}
                      <div className="flex justify-center mb-4">
                        <div className="w-24 h-24 lg:w-28 lg:h-28 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-5xl lg:text-6xl">🗑️</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Link href={`/play/${suggestedQuiz.theme_id}`}>
                        <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm lg:text-base mb-3">
                          Répondre au quiz pour un code promo
                        </button>
                      </Link>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button className="flex-1 bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-50 font-medium py-2 px-4 rounded-lg transition-colors text-sm lg:text-base flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Partager avec mes potes
                        </button>
                        <Link href="/quiz" className="flex-1">
                          <button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors text-sm lg:text-base">
                            Voir tous les quiz
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-5 lg:p-6 text-center">
                    <p className="text-gray-500">Aucun quiz disponible pour le moment</p>
                  </div>
                )}

                {/* Progression - Mobile only */}
                {progressionData.levels.length > 0 && (
                  <div className="lg:hidden bg-white rounded-lg shadow-sm p-5 space-y-4">
                    <h2 className="text-lg font-bold text-gray-800">Progression</h2>
                    <div className="text-center mb-4">
                      <span className="text-3xl font-bold text-teal-600">{progressionData.quizCompleted}</span>
                      <span className="text-sm text-gray-600 ml-2">quiz terminés</span>
                    </div>

                    {/* Continue Button - Mobile */}
                    {currentGame.has_game_in_progress && currentGame.theme_id && (
                      <Link href={`/play/${currentGame.theme_id}`}>
                        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm mb-4">
                          Continuer le quiz : {currentGame.theme_name}
                        </button>
                      </Link>
                    )}

                    {progressionData.levels.map((level) => (
                      <div key={level.level} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">{level.name}</span>
                            <div className="flex">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${i < level.stars ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                >
                                  ⭐
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{level.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-teal-600 h-2 rounded-full transition-all"
                            style={{ width: `${level.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 mt-4 border-t border-gray-100 text-center">
                      <span className="text-gray-600 text-sm">Points cumulés</span>
                      <div className="text-2xl font-bold text-teal-600">
                        {progressionData.totalPoints || 0} pts
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Right column (1/3 on desktop) - Progression */}
              {progressionData.levels.length > 0 && (
                <div className="hidden lg:block lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24 space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Progression</h2>
                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold text-teal-600">{progressionData.quizCompleted}</span>
                      <span className="text-sm text-gray-600 ml-2">quiz terminés</span>
                    </div>

                    {/* Continue Button - Desktop */}
                    {currentGame.has_game_in_progress && currentGame.theme_id && (
                      <Link href={`/play/${currentGame.theme_id}`}>
                        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm mb-4">
                          Continuer le quiz : {currentGame.theme_name}
                        </button>
                      </Link>
                    )}

                    {progressionData.levels.map((level) => (
                      <div key={level.level} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">{level.name}</span>
                            <div className="flex">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-base ${i < level.stars ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                >
                                  ⭐
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{level.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-teal-600 h-2.5 rounded-full transition-all"
                            style={{ width: `${level.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 mt-4 border-t border-gray-100 text-center">
                      <span className="text-gray-600 text-sm">Points cumulés</span>
                      <div className="text-2xl font-bold text-teal-600">
                        {progressionData.totalPoints || 0} pts
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
