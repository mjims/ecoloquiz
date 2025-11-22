'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api-client';
import { storage } from '../lib/storage';

interface Gift {
    id: string;
    name: string;
    description: string;
    image_url: string;
    company_name: string;
}

interface Allocation {
    id: string;
    gift_id: string;
    allocated_at: string;
    status: string;
    redeemed_at: string | null;
    gift: Gift;
}

interface GiftsData {
    gifts: Allocation[];
    next_milestone: number;
    points_to_next: number;
    current_points: number;
}

export default function GiftsPage() {
    const router = useRouter();
    const [giftsData, setGiftsData] = useState<GiftsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = storage.getToken();
        if (!token) {
            router.push('/login');
            return;
        }

        fetchGifts();
    }, [router]);

    const fetchGifts = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.getPlayerGifts();
            if (response.data) {
                setGiftsData(response.data);
            } else if (response.error) {
                console.error('Error fetching gifts:', response.error);
            }
        } catch (error) {
            console.error('Error fetching gifts:', error);
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

    const progressPercentage = giftsData
        ? Math.min(100, ((giftsData.current_points % 100) / 100) * 100)
        : 0;

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
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">Mes Cadeaux 🎁</h1>
                    <p className="text-gray-600 mt-2">
                        Vos cadeaux gagnés grâce à vos performances au quiz
                    </p>
                </div>

                {/* Progress to next milestone */}
                {giftsData && (
                    <div className="bg-gradient-to-r from-teal-500 to-green-500 rounded-lg p-6 mb-8 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold">Prochain cadeau</h2>
                                <p className="text-teal-100">
                                    Palier de {giftsData.next_milestone} points
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold">{giftsData.current_points}</p>
                                <p className="text-sm text-teal-100">points actuels</p>
                            </div>
                        </div>

                        <div className="w-full bg-white/30 rounded-full h-6 mb-2">
                            <div
                                className="bg-white h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                                style={{ width: `${progressPercentage}%` }}
                            >
                                {progressPercentage > 15 && (
                                    <span className="text-xs font-bold text-teal-600">
                                        {Math.round(progressPercentage)}%
                                    </span>
                                )}
                            </div>
                        </div>

                        <p className="text-sm text-teal-100 text-center">
                            Plus que <strong>{giftsData.points_to_next} points</strong> pour gagner un nouveau cadeau !
                        </p>
                    </div>
                )}

                {/* Gifts grid */}
                {!giftsData || giftsData.gifts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">
                            Aucun cadeau pour le moment
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Continuez à jouer et à gagner des points pour recevoir vos premiers cadeaux !
                        </p>
                        <p className="text-sm text-gray-500">
                            Un cadeau est tiré au sort à chaque palier de 100 points (100, 200, 300...)
                        </p>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Cadeaux gagnés ({giftsData.gifts.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {giftsData.gifts.map((allocation) => (
                                <div
                                    key={allocation.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                                >
                                    {allocation.gift.image_url && (
                                        <div className="relative h-48 bg-gray-200">
                                            <img
                                                src={allocation.gift.image_url}
                                                alt={allocation.gift.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-lg text-gray-800 flex-1">
                                                {allocation.gift.name}
                                            </h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${allocation.status === 'REDEEMED'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {allocation.status === 'REDEEMED' ? '✓ Récupéré' : 'En attente'}
                                            </span>
                                        </div>

                                        {allocation.gift.company_name && (
                                            <p className="text-sm text-gray-500 mb-2">
                                                par {allocation.gift.company_name}
                                            </p>
                                        )}

                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {allocation.gift.description || 'Pas de description disponible'}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                                            <span className="flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {new Date(allocation.allocated_at).toLocaleDateString('fr-FR')}
                                            </span>
                                            {allocation.status === 'REDEEMED' && allocation.redeemed_at && (
                                                <span className="text-green-600">
                                                    Récupéré le {new Date(allocation.redeemed_at).toLocaleDateString('fr-FR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
