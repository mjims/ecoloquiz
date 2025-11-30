'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@admin/lib/api-client';
import Modal from '../common/Modal';

interface EmailTemplateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
}

interface EmailTemplateData {
  id: string;
  name: string;
  code: string;
  type: string;
  target_types: string;
  subject: string;
  sender_name: string;
  sender_email: string;
  to: string;
  cc: string;
  bcc: string;
  body_html: string;
  body_text: string;
  variables_schema: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator?: {
    name: string;
    email: string;
  };
}

export default function EmailTemplateDetailsModal({
  isOpen,
  onClose,
  templateId,
}: EmailTemplateDetailsModalProps) {
  const [template, setTemplate] = useState<EmailTemplateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
      const templateData = response.data.template || response.data;
      setTemplate(templateData);
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setTemplate(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Détails du modèle d'email" size="xl">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      ) : template ? (
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</h3>
              <p className="mt-1 text-base text-gray-900 dark:text-gray-100">{template.name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Code</h3>
              <p className="mt-1 text-base font-mono text-gray-900 dark:text-gray-100">{template.code}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</h3>
              <p className="mt-1 text-base text-gray-900 dark:text-gray-100">{template.type || '-'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Destinataires cibles</h3>
              <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                {template.target_types || 'Tous'}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</h3>
              <p className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  template.is_active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {template.is_active ? 'Actif' : 'Inactif'}
                </span>
              </p>
            </div>

            {template.creator && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Créé par</h3>
                <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                  {template.creator.name} ({template.creator.email})
                </p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de création</h3>
              <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                {new Date(template.created_at).toLocaleString('fr-FR')}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dernière modification</h3>
              <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                {new Date(template.updated_at).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Informations d'envoi */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Informations d'envoi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom de l'émetteur</h4>
                <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                  {template.sender_name || '-'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email de l'émetteur</h4>
                <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                  {template.sender_email || '-'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">À</h4>
                <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                  {template.to || '-'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">CC</h4>
                <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                  {template.cc || '-'}
                </p>
              </div>

              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">CCI</h4>
                <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                  {template.bcc || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Sujet */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Objet
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-base text-gray-900 dark:text-gray-100">
                {template.subject}
              </p>
            </div>
          </div>

          {/* Corps HTML */}
          {template.body_html && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Corps du message (HTML)
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono">
                  {template.body_html}
                </pre>
              </div>
            </div>
          )}

          {/* Corps texte */}
          {template.body_text && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Corps du message (Texte)
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {template.body_text}
                </pre>
              </div>
            </div>
          )}

          {/* Variables */}
          {template.variables_schema && Object.keys(template.variables_schema).length > 0 && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Variables disponibles
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono">
                  {JSON.stringify(template.variables_schema, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Bouton de fermeture */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
