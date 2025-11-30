'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@admin/lib/api-client';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface EmailTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface EmailType {
  id: string;
  code: string;
  name: string;
  description: string;
  is_system: boolean;
  is_active: boolean;
}

export default function EmailTypeModal({ isOpen, onClose, onSuccess }: EmailTypeModalProps) {
  const [types, setTypes] = useState<EmailType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState({ name: '', description: '' });

  useEffect(() => {
    if (isOpen) {
      loadTypes();
    }
  }, [isOpen]);

  const loadTypes = async () => {
    setIsLoading(true);
    setError('');

    const response = await apiClient.getEmailTypes();

    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setTypes(response.data.types || []);
    }

    setIsLoading(false);
  };

  const handleAddType = async () => {
    if (!newType.name.trim()) {
      alert('Le nom est requis');
      return;
    }

    const response = await apiClient.createEmailType(newType);

    if (response.error) {
      alert('Erreur : ' + response.error);
    } else {
      setNewType({ name: '', description: '' });
      setIsAdding(false);
      loadTypes();
      onSuccess();
    }
  };

  const handleDeleteType = async (id: string, isSystem: boolean) => {
    if (isSystem) {
      alert('Les types système ne peuvent pas être supprimés');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce type d\'email ?')) {
      return;
    }

    const response = await apiClient.deleteEmailType(id);

    if (response.error) {
      alert('Erreur : ' + response.error);
    } else {
      loadTypes();
      onSuccess();
    }
  };

  const handleClose = () => {
    setNewType({ name: '', description: '' });
    setIsAdding(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Gestion des types d'email" size="lg">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Liste des types */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Types d'email disponibles
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {types.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{type.name}</h4>
                      {type.is_system && (
                        <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          Système
                        </span>
                      )}
                    </div>
                    {type.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{type.description}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Code: {type.code}</p>
                  </div>
                  {!type.is_system && (
                    <button
                      onClick={() => handleDeleteType(type.id, type.is_system)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Formulaire d'ajout */}
          {isAdding ? (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ajouter un type personnalisé
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newType.name}
                  onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Newsletter mensuelle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newType.description}
                  onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Description du type d'email"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setIsAdding(false)} variant="secondary" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleAddType} variant="primary" className="flex-1">
                  Ajouter
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <Button
                onClick={() => setIsAdding(true)}
                variant="primary"
                className="w-full"
              >
                + Ajouter un type personnalisé
              </Button>
            </div>
          )}

          {/* Bouton de fermeture */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handleClose} variant="secondary">
              Fermer
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
