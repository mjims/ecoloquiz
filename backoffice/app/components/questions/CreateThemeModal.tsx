'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

interface CreateThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateThemeModal({ isOpen, onClose, onSuccess }: CreateThemeModalProps) {
  const [themeData, setThemeData] = useState({
    title: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!themeData.title || !themeData.description) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);

    const response = await apiClient.createTheme({
      title: themeData.title,
      description: themeData.description,
    });

    setIsSubmitting(false);

    if (response.error) {
      setError(response.error);
    } else {
      onSuccess();
      handleClose();
    }
  };

  const handleClose = () => {
    setThemeData({ title: '', description: '' });
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Créer un nouveau thème" size="md">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Titre du thème *"
            value={themeData.title}
            onChange={(e) => setThemeData({ ...themeData, title: e.target.value })}
            placeholder="Ex: Déchet"
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Description du thème *
            </label>
            <textarea
              value={themeData.description}
              onChange={(e) => setThemeData({ ...themeData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Décrivez le thème et son objectif pédagogique..."
              required
            />
          </div>

        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={handleClose} variant="secondary" className="flex-1">
            Annuler
          </Button>
          <Button onClick={handleSubmit} variant="primary" className="flex-1" isLoading={isSubmitting}>
            Créer le thème
          </Button>
        </div>
      </div>
    </Modal>
  );
}
