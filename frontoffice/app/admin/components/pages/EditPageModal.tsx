'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@admin/lib/api-client';

interface EditPageModalProps {
  isOpen: boolean;
  pageId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPageModal({ isOpen, pageId, onClose, onSuccess }: EditPageModalProps) {
  const [formData, setFormData] = useState({
    type: 'BLOG',
    title: '',
    long_title: '',
    subtitle: '',
    content_html: '',
    is_active: true,
    published_at: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && pageId) {
      loadPage();
    }
  }, [isOpen, pageId]);

  const loadPage = async () => {
    setIsLoading(true);
    setError('');

    const response = await apiClient.getPage(pageId);

    if (response.error) {
      setError(response.error);
      setIsLoading(false);
    } else if (response.data) {
      const page = response.data;
      setFormData({
        type: page.type || 'BLOG',
        title: page.title || '',
        long_title: page.long_title || '',
        subtitle: page.subtitle || '',
        content_html: page.content_html || '',
        is_active: page.is_active ?? true,
        published_at: page.published_at ? new Date(page.published_at).toISOString().slice(0, 16) : ''
      });
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const dataToSend = {
      ...formData,
      published_at: formData.published_at || null
    };

    const response = await apiClient.updatePage(pageId, dataToSend);

    if (response.error) {
      setError(response.error);
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      onSuccess();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Modifier la page
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Type de page */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de page <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="BLOG">Blog</option>
                <option value="INFO">Info</option>
                <option value="QUIZ_PAGE">Quiz</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Chaque contenu de page sera lié à un type
              </p>
            </div>

            {/* Titre */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Entrez le titre principal"
              />
            </div>

            {/* Titre long */}
            <div>
              <label htmlFor="long_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre long
              </label>
              <input
                type="text"
                id="long_title"
                name="long_title"
                value={formData.long_title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Titre détaillé (optionnel)"
              />
            </div>

            {/* Sous-titre */}
            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sous-titre
              </label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Sous-titre accrocheur (optionnel)"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="content_html" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content_html"
                name="content_html"
                value={formData.content_html}
                onChange={handleChange}
                required
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                placeholder="Contenu de la page (HTML accepté)"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Vous pouvez utiliser du HTML pour formater le contenu
              </p>
            </div>

            {/* Date de publication */}
            <div>
              <label htmlFor="published_at" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de publication
              </label>
              <input
                type="datetime-local"
                id="published_at"
                name="published_at"
                value={formData.published_at}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Statut actif */}
            <div className="flex items-center gap-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Statut
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="is_active"
                    checked={formData.is_active === true}
                    onChange={() => setFormData(prev => ({ ...prev, is_active: true }))}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Actif</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="is_active"
                    checked={formData.is_active === false}
                    onChange={() => setFormData(prev => ({ ...prev, is_active: false }))}
                    className="w-4 h-4 text-gray-600 focus:ring-gray-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Inactif</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  'Valider'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
