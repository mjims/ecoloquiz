'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api-client';
import { storage } from '../lib/storage';
import { authHelpers } from '../lib/auth-helpers';
import ProtectedRoute from '../components/ProtectedRoute';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Theme {
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    is_completed?: boolean;
    progress_percentage?: number;
}

function QuizSelectionContent() {
    const router = useRouter();
    const [themes, setThemes] = useState<Theme[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchThemes();
    }, []);

    const fetchThemes = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.getThemes();
            if (response.data) {
                // Handle both paginated and non-paginated responses
                const themesData = response.data.data || response.data;
                if (Array.isArray(themesData)) {
                    setThemes(themesData);
                } else {
                    console.error('Unexpected themes data format:', response.data);
                    setThemes([]);
                }
            }
        } catch (error) {
            console.error('Error fetching themes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleThemeSelect = (themeId: string) => {
        router.push(`/play/${themeId}`);
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

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50 to-white">
            <Header />

            <main className="flex-1 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                            Choisissez votre thème 🎯
                        </h1>
                        <p className="text-lg text-gray-600">
                            Sélectionnez un thème pour commencer votre quiz et gagner des points !
                        </p>
                    </div>

                    {/* Themes Grid */}
                    {themes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {themes.map((theme) => (
                                <div
                                    key={theme.id}
                                    className={`bg-white rounded-lg shadow-md overflow-hidden relative ${theme.is_completed
                                        ? 'opacity-60 cursor-not-allowed'
                                        : 'hover:shadow-xl transition-shadow duration-300 cursor-pointer transform hover:scale-105'
                                        }`}
                                    onClick={() => !theme.is_completed && handleThemeSelect(theme.id)}
                                >
                                    {/* Completed Badge */}
                                    {theme.is_completed && (
                                        <div className="absolute top-3 right-3 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                                            ✓ Terminé
                                        </div>
                                    )}
                                    {/* Theme Image or Icon */}
                                    <div className={`h-40 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center ${theme.is_completed ? 'grayscale' : ''
                                        }`}>
                                        {theme.image_url ? (
                                            <img
                                                src={theme.image_url}
                                                alt={theme.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-6xl">🌱</div>
                                        )}
                                    </div>

                                    {/* Theme Info */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{theme.title}</h3>
                                        {theme.description && (
                                            <p className="text-gray-600 text-sm mb-4">{theme.description}</p>
                                        )}
                                        <button className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium">
                                            Jouer →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">Aucun thème disponible pour le moment.</p>
                        </div>
                    )}

                    {/* Back to Dashboard */}
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-teal-600 hover:text-teal-700 font-medium"
                        >
                            ← Retour au tableau de bord
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function QuizSelectionPage() {
    return (
        <ProtectedRoute>
            <QuizSelectionContent />
        </ProtectedRoute>
    );
}
