'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

interface GiftData {
    id: string;
    name: string;
    description: string;
    image_url: string;
    company_name: string;
    milestone: number;
}

interface GiftAnimationProps {
    gift: GiftData;
    onContinue: () => void;
}

export default function GiftAnimation({ gift, onContinue }: GiftAnimationProps) {
    const [selectedBox, setSelectedBox] = useState<number | null>(null);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        console.log('🎨 GiftAnimation mounted with gift:', gift);
    }, [gift]);

    const handleBoxClick = (boxIndex: number) => {
        if (selectedBox !== null) return;

        setSelectedBox(boxIndex);

        // Trigger confetti after a short delay
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            setRevealed(true);
        }, 800);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8"
            >
                <AnimatePresence mode="wait">
                    {!revealed ? (
                        <motion.div
                            key="boxes"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                        >
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-teal-700 mb-2">
                                    🎉 Félicitations ! 🎉
                                </h2>
                                <p className="text-lg text-gray-700">
                                    Vous avez atteint {gift.milestone} points !
                                </p>
                                <p className="text-md text-gray-600 mt-2">
                                    Choisissez une boîte pour découvrir votre cadeau
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-6 mb-8">
                                {[0, 1, 2].map((index) => (
                                    <motion.button
                                        key={index}
                                        onClick={() => handleBoxClick(index)}
                                        disabled={selectedBox !== null}
                                        whileHover={selectedBox === null ? { scale: 1.05 } : {}}
                                        whileTap={selectedBox === null ? { scale: 0.95 } : {}}
                                        animate={
                                            selectedBox === index
                                                ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                                                : {}
                                        }
                                        className={`aspect-square rounded-xl flex items-center justify-center transition-all ${selectedBox === null
                                            ? 'bg-gradient-to-br from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 cursor-pointer'
                                            : selectedBox === index
                                                ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                                                : 'bg-gray-300 opacity-50'
                                            }`}
                                    >
                                        <Gift className="w-16 h-16 text-white" />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reveal"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <h2 className="text-3xl font-bold text-teal-700 mb-6">
                                Vous avez gagné !
                            </h2>

                            <div className="max-w-md mx-auto mb-6">
                                {gift.image_url && (
                                    <img
                                        src={gift.image_url}
                                        alt={gift.name}
                                        className="w-full h-64 object-cover rounded-xl mb-4"
                                    />
                                )}
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    {gift.name}
                                </h3>
                                {gift.company_name && (
                                    <p className="text-sm text-gray-500 mb-3">
                                        Par {gift.company_name}
                                    </p>
                                )}
                                <p className="text-gray-700">{gift.description}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={onContinue}
                                    className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                                >
                                    Continuer le jeu
                                </button>
                                <Link href="/gifts">
                                    <button className="px-6 py-3 bg-gray-100 text-teal-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                                        Voir mes cadeaux
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
