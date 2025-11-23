'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { storage } from '@/lib/storage';

interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    zone_id?: string;
    zone?: {
        id: string;
        name: string;
    };
}

interface Zone {
    id: string;
    name: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [zones, setZones] = useState<Zone[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        zone_id: '',
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        fetchUserData();
        fetchZones();
    }, []);

    const fetchUserData = async () => {
        setIsLoading(true);
        const response = await apiClient.getCurrentUser();

        if (response.data) {
            setUser(response.data);
            setFormData({
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                email: response.data.email,
                zone_id: response.data.zone_id || '',
            });
        }
        setIsLoading(false);
    };

    const fetchZones = async () => {
        const response = await apiClient.getZones();
        if (response.data) {
            const zonesData = Array.isArray(response.data) ? response.data : response.data.data || [];
            setZones(zonesData);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const response = await apiClient.updateProfile(
            formData.first_name,
            formData.last_name,
            formData.email,
            formData.zone_id || undefined
        );

        if (response.error) {
            setError(response.error);
        } else if (response.data) {
            setSuccess('Profil mis à jour avec succès !');
            setUser(response.data);
            setIsEditing(false);
            // Update stored user
            storage.setUser(response.data);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordData.new_password.length < 8) {
            setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères');
            return;
        }

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            setPasswordError('Les mots de passe ne correspondent pas');
            return;
        }

        const response = await apiClient.changePassword(
            passwordData.current_password,
            passwordData.new_password,
            passwordData.new_password_confirmation
        );

        if (response.error) {
            setPasswordError(response.error);
        } else {
            setPasswordSuccess('Mot de passe changé avec succès !');
            setPasswordData({
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            });
            setIsChangingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50 to-white">
                <Header />

                <main className="flex-1 py-8">
                    <div className="container mx-auto px-4 max-w-4xl">
                        {/* Page Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">Mon Profil</h1>
                            <p className="text-gray-600">Gérez vos informations personnelles</p>
                        </div>

                        {/* User Info Card */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Informations personnelles</h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                                    >
                                        Modifier
                                    </button>
                                )}
                            </div>

                            {success && (
                                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                                    {success}
                                </div>
                            )}

                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            {isEditing ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Prénom
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nom
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Zone
                                        </label>
                                        <select
                                            value={formData.zone_id}
                                            onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        >
                                            <option value="">Aucune zone</option>
                                            {zones.map((zone) => (
                                                <option key={zone.id} value={zone.id}>
                                                    {zone.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                                        >
                                            Enregistrer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setError('');
                                                setFormData({
                                                    first_name: user?.first_name || '',
                                                    last_name: user?.last_name || '',
                                                    email: user?.email || '',
                                                    zone_id: user?.zone_id || '',
                                                });
                                            }}
                                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Prénom
                                            </label>
                                            <p className="text-lg text-gray-800">{user?.first_name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Nom
                                            </label>
                                            <p className="text-lg text-gray-800">{user?.last_name}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Email
                                        </label>
                                        <p className="text-lg text-gray-800">{user?.email}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Zone
                                        </label>
                                        <p className="text-lg text-gray-800">{user?.zone?.name || 'Aucune zone'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Password Change Card */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Changer le mot de passe</h2>
                                {!isChangingPassword && (
                                    <button
                                        onClick={() => setIsChangingPassword(true)}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                                    >
                                        Modifier
                                    </button>
                                )}
                            </div>

                            {passwordSuccess && (
                                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                                    {passwordSuccess}
                                </div>
                            )}

                            {passwordError && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                    {passwordError}
                                </div>
                            )}

                            {isChangingPassword ? (
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mot de passe actuel
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nouveau mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                            required
                                            minLength={8}
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Minimum 8 caractères</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirmer le nouveau mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.new_password_confirmation}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                                        >
                                            Changer le mot de passe
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsChangingPassword(false);
                                                setPasswordError('');
                                                setPasswordData({
                                                    current_password: '',
                                                    new_password: '',
                                                    new_password_confirmation: '',
                                                });
                                            }}
                                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <p className="text-gray-600">
                                    Pour des raisons de sécurité, nous vous recommandons de changer régulièrement votre mot de passe.
                                </p>
                            )}
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </ProtectedRoute>
    );
}
