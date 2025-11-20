'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { usePagination } from '@/hooks/usePagination';
import PaginationControls from '@/components/common/PaginationControls';
import CreateGiftModal from '@/components/gifts/CreateGiftModal';
import EditGiftModal from '@/components/gifts/EditGiftModal';

interface Gift {
  id: string;
  code: string;
  name: string;
  company_name: string;
  level_id: string | null;
  level?: {
    id: string;
    name: string;
    level_number: number;
  };
  total_quantity: number;
  start_date: string | null;
  end_date: string | null;
  metadata?: any;
}

interface Level {
  id: string;
  name: string;
  level_number: number;
}

export default function CadeauxPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtres
  const [filterCompany, setFilterCompany] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);

  const { currentPage, perPage, totalPages, totalItems, setCurrentPage, setPerPage, setTotalPages, setTotalItems, resetPagination } = usePagination();

  useEffect(() => {
    loadLevels();
  }, []);

  useEffect(() => {
    loadGifts();
  }, [currentPage, perPage, filterCompany, filterLevel]);

  const loadLevels = async () => {
    const response = await apiClient.getLevels(1, 100);
    if (response.data) {
      const levelsData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setLevels(levelsData);
    }
  };

  const loadGifts = async () => {
    setIsLoading(true);
    setError('');

    const response = await apiClient.getGifts(
      currentPage,
      perPage,
      filterLevel || undefined,
      undefined,
      filterCompany || undefined
    );

    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      const giftsData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setGifts(giftsData);

      if (response.data.last_page) setTotalPages(response.data.last_page);
      if (response.data.total) setTotalItems(response.data.total);
    }

    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cadeau ?')) return;

    const response = await apiClient.deleteGift(id);
    if (response.error) {
      alert('Erreur lors de la suppression : ' + response.error);
    } else {
      loadGifts();
    }
  };

  const handleDuplicate = async (gift: Gift) => {
    // Copier le cadeau avec un nouveau code
    const newCode = prompt('Nouveau code pour la copie:', gift.code + '-copie');
    if (!newCode) return;

    const giftCopy = {
      ...gift,
      code: newCode,
      id: undefined,
    };

    const response = await apiClient.createGift(giftCopy);
    if (response.error) {
      alert('Erreur lors de la duplication : ' + response.error);
    } else {
      loadGifts();
    }
  };

  const handleFilterChange = () => {
    resetPagination();
  };

  const handleEdit = (giftId: string) => {
    setSelectedGiftId(giftId);
    setIsEditModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadGifts();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des cadeaux...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des Cadeaux
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            LISTE DES CADEAUX
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Créer un cadeau</span>
          </button>
          <button
            onClick={loadGifts}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="filterCompany" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enseigne
            </label>
            <input
              type="text"
              id="filterCompany"
              value={filterCompany}
              onChange={(e) => { setFilterCompany(e.target.value); handleFilterChange(); }}
              placeholder="Rechercher par entreprise..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="filterLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Niveau
            </label>
            <select
              id="filterLevel"
              value={filterLevel}
              onChange={(e) => { setFilterLevel(e.target.value); handleFilterChange(); }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tous niveaux</option>
              {levels.map(level => (
                <option key={level.id} value={level.id}>{level.level_number}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cadeau</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Enseigne</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Niveau</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Quantité</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {gifts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucun cadeau trouvé
                </td>
              </tr>
            ) : (
              gifts.map((gift) => (
                <tr key={gift.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {gift.code}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {gift.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {gift.company_name}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
                    {gift.level?.level_number || '-'}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
                    {gift.total_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleDuplicate(gift)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                        title="Dupliquer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(gift.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="Éditer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(gift.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={setPerPage}
          itemName="cadeaux"
        />
      )}

      {/* Modals */}
      <CreateGiftModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <EditGiftModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleModalSuccess}
        giftId={selectedGiftId}
      />
    </div>
  );
}
