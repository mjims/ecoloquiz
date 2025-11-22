'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api-client';
import { storage } from '../lib/storage';

interface PlayerStats {
    player: {
        points: number;
        current_level: number;
        last_milestone: number;
    };
    performance: {
        total_answers: number;
        correct_answers: number;
        wrong_answers: number;
        accuracy: number;
    };
    by_theme: Array<{
        name: string;
        total_answers: number;
        correct_answers: number;
    }>;
    progression_7_days: Array<{
        date: string;
        points_earned: number;
        questions_answered: number;
    }>;
    gifts_won: number;
}

export default function StatsPage() {
    const router = useRouter();
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = storage.getToken();
        if (!token) {
            router.push('/login');
            return;
        }

        fetchStats();
    }, [router]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.getPlayerStats();
            if (response.data) {
                setStats(response.data);
            } else if (response.error) {
                console.error('Error fetching stats:', response.error);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Impossible de charger vos statistiques.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center text-teal-600 hover:text-teal-700 mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour au tableau de bord
                    </button>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">Mes Statistiques 📊</h1>
                    <p className="text-gray-600 mt-2">Suivez votre progression et vos performances</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg transform transition hover:scale-105">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium opacity-90">Points</span>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                        <p className="text-4xl font-bold">{stats.player.points}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg transform transition hover:scale-105">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium opacity-90">Précision</span>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-4xl font-bold">{stats.performance.accuracy}%</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg transform transition hover:scale-105">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium opacity-90">Niveau</span>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-4xl font-bold">{stats.player.current_level}</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-lg transform transition hover:scale-105">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium opacity-90">Cadeaux gagnés</span>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                                <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                            </svg>
                        </div>
                        <p className="text-4xl font-bold">{stats.gifts_won}</p>
                    </div>
                </div>

                {/* Performance Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Détails de performance</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-gray-600">Total de réponses</span>
                                <span className="font-bold text-lg">{stats.performance.total_answers}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-gray-600">Réponses correctes</span>
                                <span className="font-bold text-lg text-green-600">{stats.performance.correct_answers}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-gray-600">Réponses incorrectes</span>
                                <span className="font-bold text-lg text-red-600">{stats.performance.wrong_answers}</span>
                            </div>
                            <div className="mt-4 bg-gray-100 rounded p-3">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600">Taux de réussite</span>
                                    <span className="text-sm font-bold">{stats.performance.accuracy}%</span>
                                </div>
                                <div className="w-full bg-gray-300 rounded-full h-3">
                                    <div
                                        className="bg-green-500 h-3 rounded-full transition-all"
                                        style={{ width: `${stats.performance.accuracy}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Themes breakdown */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Répartition par thème</h2>
                        {stats.by_theme.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Aucune statistique par thème disponible</p>
                        ) : (
                            <div className="space-y-3">
                                {stats.by_theme.map((theme, index) => {
                                    const accuracy = theme.total_answers > 0
                                        ? Math.round((theme.correct_answers / theme.total_answers) * 100)
                                        : 0;

                                    return (
                                        <div key={index} className="border-b pb-3 last:border-b-0">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium text-gray-700">{theme.name}</span>
                                                <span className="text-sm text-gray-500">{theme.total_answers} réponses</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${accuracy > 70 ? 'bg-green-500' : accuracy > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${accuracy}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium w-12 text-right">{accuracy}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Progression 7 days */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Progression des 7 derniers jours</h2>
                    {stats.progression_7_days.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucune activité ces 7 derniers jours</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Questions</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Points gagnés</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.progression_7_days.map((day, index) => (
                                        <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                {new Date(day.date).toLocaleDateString('fr-FR', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </td>
                                            <td className="py-3 px-4 text-center font-medium">{day.questions_answered}</td>
                                            <td className={`py-3 px-4 text-right font-bold ${parseInt(day.points_earned.toString()) > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {parseInt(day.points_earned.toString()) > 0 ? '+' : ''}{day.points_earned}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
