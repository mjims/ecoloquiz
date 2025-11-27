'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { apiClient } from '@/lib/api-client';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState<{
    password?: string;
    password_confirmation?: string;
    general?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (!tokenParam || !emailParam) {
      setErrors({ general: 'Lien de réinitialisation invalide ou expiré' });
    } else {
      setToken(tokenParam);
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token || !email) {
      setErrors({ general: 'Lien de réinitialisation invalide' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const response = await apiClient.resetPassword(
      token,
      email,
      formData.password,
      formData.password_confirmation
    );

    setIsSubmitting(false);

    if (response.error) {
      setErrors({ general: response.error });
    } else {
      setIsSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Mot de passe réinitialisé !
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la
                page de connexion...
              </p>
              <Link href="/login">
                <Button>Aller à la connexion</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errors.general && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Lien invalide
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{errors.general}</p>
              <Link href="/forgot-password">
                <Button>Demander un nouveau lien</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">
            EcoloQuiz
          </h1>
          <h2 className="text-2xl font-semibold text-center text-gray-700 dark:text-gray-300">
            Réinitialiser le mot de passe
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Entrez votre nouveau mot de passe ci-dessous.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="password"
              name="password"
              type="password"
              label="Nouveau mot de passe"
              placeholder="Entrez votre nouveau mot de passe"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
              required
            />

            <Input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              label="Confirmer le mot de passe"
              placeholder="Confirmez votre nouveau mot de passe"
              value={formData.password_confirmation}
              onChange={handleChange}
              error={errors.password_confirmation}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
            <p className="font-medium mb-1">Le mot de passe doit contenir :</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Au moins 8 caractères</li>
              <li>Les deux mots de passe doivent correspondre</li>
            </ul>
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Réinitialiser le mot de passe
          </Button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
