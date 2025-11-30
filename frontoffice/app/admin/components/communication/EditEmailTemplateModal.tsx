'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@admin/lib/api-client';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface EditEmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  templateId: string;
}

export default function EditEmailTemplateModal({
  isOpen,
  onClose,
  onSuccess,
  templateId,
}: EditEmailTemplateModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    type: '',
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
    if (isOpen && templateId) {
      loadTemplate();
    }
  }, [isOpen, templateId]);

  const loadTemplate = async () => {
    setIsLoading(true);
    setError('');

    const response = await apiClient.getEmailTemplate(templateId);

    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      const template = response.data.template || response.data;
      setFormData({
        type: template.type || 'transactional',
        name: template.name || '',
        sender_name: template.sender_name || '',
        subject: template.subject || '',
        to: template.to || '',
        cc: template.cc || '',
        bcc: template.bcc || '',
        body_html: template.body_html || '',
        is_active: template.is_active !== false,
      });
    }

    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.name || !formData.subject) {
      setError('Le nom et le sujet sont requis');
      setIsSubmitting(false);
      return;
    }

    const response = await apiClient.updateEmailTemplate(templateId, formData);

    if (response.error) {
      setError(response.error);
      setIsSubmitting(false);
    } else {
      onSuccess();
    }
  };

  const handleClose = () => {
    setFormData({
      type: '',
      name: '',
      sender_name: '',
      subject: '',
      to: '',
      cc: '',
      bcc: '',
      body_html: '',
      is_active: true,
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Éditer le modèle d'email" size="xl">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Type de modèle */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de modèle
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="transactional">Confirmation inscription</option>
              <option value="notification">Notification</option>
              <option value="promotional">Promotionnel</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </div>

          {/* Nom et Émetteur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Destinataires */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                À
              </label>
              <input
                type="text"
                id="to"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="cc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CC
              </label>
              <input
                type="text"
                id="cc"
                value={formData.cc}
                onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="bcc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CCI
              </label>
              <input
                type="text"
                id="bcc"
                value={formData.bcc}
                onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Corps du message */}
          <div>
            <label htmlFor="body_html" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              id="body_html"
              value={formData.body_html}
              onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={formData.is_active === true}
                  onChange={() => setFormData({ ...formData, is_active: true })}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Actif</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={formData.is_active === false}
                  onChange={() => setFormData({ ...formData, is_active: false })}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Inactif</span>
              </label>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handleClose} variant="secondary" className="flex-1">
              Annuler
            </Button>
            <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
              Enregistrer
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
