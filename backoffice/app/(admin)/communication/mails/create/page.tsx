'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import EmailTypeModal from '@/components/communication/EmailTypeModal';

interface EmailType {
  id: string;
  code: string;
  name: string;
  description: string;
  is_system: boolean;
  is_active: boolean;
  email_template?: any;
}

export default function CreateEmailTemplatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailTypes, setEmailTypes] = useState<EmailType[]>([]);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    email_type_id: '',
    type: 'transactional',
    name: '',
    sender_name: '',
    subject: '',
    to: '',
    cc: '',
    bcc: '',
    body_html: '',
    is_active: true,
  });

  useEffect(() => {
    loadEmailTypes();
  }, []);

  const loadEmailTypes = async () => {
    const response = await apiClient.getEmailTypes();
    if (response.data) {
      setEmailTypes(response.data.types || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validation
    if (!formData.email_type_id) {
      setError('Le type d\'email est requis');
      setIsSubmitting(false);
      return;
    }

    if (!formData.name || !formData.subject) {
      setError('Le nom et le sujet sont requis');
      setIsSubmitting(false);
      return;
    }

    const response = await apiClient.createEmailTemplate(formData);

    if (response.error) {
      setError(response.error);
      setIsSubmitting(false);
    } else {
      // Rediriger vers la liste des mails
      router.push('/communication/mails');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Modèle d'e-mail
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Créer un nouveau modèle d'email
          </p>
        </div>
        <button
          onClick={() => router.push('/communication/mails')}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Retour</span>
        </button>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Type d'email */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="email_type_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type d'email <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsTypeModalOpen(true)}
              className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              Gérer les types
            </button>
          </div>
          <select
            id="email_type_id"
            value={formData.email_type_id}
            onChange={(e) => setFormData({ ...formData, email_type_id: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">Sélectionnez un type</option>
            {emailTypes.map((type) => (
              <option
                key={type.id}
                value={type.id}
                disabled={type.is_system && !!type.email_template}
              >
                {type.name} {type.is_system ? '(Système)' : '(Personnalisé)'}
                {type.is_system && type.email_template ? ' - Déjà utilisé' : ''}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Les types système ne peuvent avoir qu'un seul template. Les types personnalisés peuvent en avoir plusieurs.
          </p>
        </div>

        {/* Titre et Émetteur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Confirmation d'inscription"
              required
            />
          </div>

          <div>
            <label htmlFor="sender_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Émetteur
            </label>
            <input
              type="text"
              id="sender_name"
              value={formData.sender_name}
              onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: EcoloQuiz"
            />
          </div>
        </div>

        {/* Récepteur principal et Copie CC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Récepteur principal
            </label>
            <input
              type="text"
              id="to"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: {user_email}"
            />
          </div>

          <div>
            <label htmlFor="cc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Copie CC
            </label>
            <input
              type="text"
              id="cc"
              value={formData.cc}
              onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              placeholder="email1@example.com, email2@example.com"
            />
          </div>
        </div>

        {/* Copie CCI */}
        <div>
          <label htmlFor="bcc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Copie CCI
          </label>
          <input
            type="text"
            id="bcc"
            value={formData.bcc}
            onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            placeholder="admin@example.com"
          />
        </div>

        {/* Sujet */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Objet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            placeholder="Ex: Bienvenue sur EcoloQuiz"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="body_html" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            {/* Barre d'outils simple */}
            <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 px-3 py-2 flex flex-wrap gap-2 text-xs">
              <span className="text-gray-600 dark:text-gray-400">Fichier Modifcateur</span>
              <span className="text-gray-600 dark:text-gray-400">Afficher</span>
              <span className="text-gray-600 dark:text-gray-400">Insérer</span>
              <span className="text-gray-600 dark:text-gray-400">Format</span>
              <span className="text-gray-600 dark:text-gray-400">Outils</span>
              <span className="text-gray-600 dark:text-gray-400">Tableau</span>
            </div>
            <textarea
              id="body_html"
              value={formData.body_html}
              onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
              rows={12}
              className="w-full px-4 py-3 focus:ring-0 focus:outline-none dark:bg-gray-700 dark:text-white border-0"
              placeholder="Bonjour {{missionResponsibleFullName}}

Ecoloquiz vous confirme l'inscription de votre compte sur notre plateforme.
Profitez dès maintenant des questions pour faire de vous une personne incollable sur l'écologie.

Des milliers de cadeaux à remporter dès maintenant !"
              required
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            87 mots
          </p>
        </div>

        {/* Statut Actif/Inactif */}
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="status"
              checked={formData.is_active === true}
              onChange={() => setFormData({ ...formData, is_active: true })}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Actif</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="status"
              checked={formData.is_active === false}
              onChange={() => setFormData({ ...formData, is_active: false })}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Inactif</span>
          </label>
        </div>

        {/* Bouton de validation */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Création en cours...' : 'Valider'}
          </button>
        </div>
      </form>

      {/* Modal de gestion des types d'email */}
      <EmailTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        onSuccess={() => {
          loadEmailTypes();
        }}
      />
    </div>
  );
}
