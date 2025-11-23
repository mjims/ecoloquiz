'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api-client';
import { storage } from '../lib/storage';
import { authHelpers } from '../lib/auth-helpers';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        zone_id: '',
    });
    const [zones, setZones] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check if already logged in
        if (storage.getToken()) {
            router.push('/dashboard');
            return;
        }

        // Fetch zones for dropdown
        fetchZones();
    }, [router]);

    const fetchZones = async () => {
        try {
            const response = await apiClient.getZones();
            if (response.data) {
                // Handle both paginated and non-paginated responses
                // @ts-ignore - API response type might be inconsistent
                const zonesData = Array.isArray(response.data) ? response.data : (response.data.data || []);
                setZones(zonesData);
            }
        } catch (error) {
            console.error('Error fetching zones:', error);
            setZones([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.password_confirmation) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiClient.register(
                formData.first_name,
                formData.last_name,
                formData.email,
                formData.password,
                formData.password_confirmation,
                formData.zone_id || undefined
            );

            if (response.data) {
                // Save token and auto-login
                storage.setToken(response.data.access_token);
                storage.setUser(response.data.user);

                // Redirect to returnUrl or dashboard
                const returnUrl = authHelpers.getReturnUrl();
                authHelpers.clearReturnUrl();
                router.push(returnUrl);
            } else if (response.error) {
                setError(response.error);
            }
        } catch (error: any) {
            setError(error.message || 'Une erreur est survenue lors de l\'inscription');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Créer un compte</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Rejoignez Écolo Quiz et commencez à jouer !
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* First Name */}
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                                    Prénom <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    required
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                    placeholder="Prénom"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                                    Nom <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    required
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                    placeholder="Nom"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                placeholder="votre@email.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mot de passe <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                placeholder="Au moins 8 caractères"
                            />
                        </div>

                        {/* Password Confirmation */}
                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                Confirmer le mot de passe <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                required
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                placeholder="Répétez le mot de passe"
                            />
                        </div>

                        {/* Zone */}
                        <div>
                            <label htmlFor="zone" className="block text-sm font-medium text-gray-700">
                                Zone (optionnel)
                            </label>
                            <select
                                id="zone"
                                name="zone"
                                value={formData.zone_id}
                                onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            >
                                <option value="">Sélectionnez une zone</option>
                                {zones.map((zone) => (
                                    <option key={zone.id} value={zone.id}>
                                        {zone.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
                        </button>
                    </div>
                </form>

                {/* Login Link */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Vous avez déjà un compte ?{' '}
                        <button
                            onClick={() => router.push('/login')}
                            className="font-medium text-teal-600 hover:text-teal-500"
                        >
                            Se connecter
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
