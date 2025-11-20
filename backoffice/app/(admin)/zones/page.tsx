'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { getPagePreference, savePagePreference } from '@/lib/pagination-preferences';

interface Zone {
  id: string;
  name: string;
  type: string;
  code_postal: string | null;
  parent_zone_id: string | null;
  parent?: {
    name: string;
    type: string;
  };
  created_at: string;
  metadata?: {
    region?: string;
    department?: string;
    start_date?: string;
    end_date?: string;
    company_count?: number;
  };
}

const PAGE_NAME = 'zones';

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(() => getPagePreference(PAGE_NAME, 15));

  useEffect(() => {
    loadZones(currentPage);
  }, [currentPage]);

  const loadZones = async (page: number, itemsPerPage?: number) => {
    setIsLoading(true);
    setError('');

    const response = await apiClient.getZones(page, itemsPerPage || perPage);

    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      const zonesData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setZones(zonesData);

      if (response.data.last_page) {
        setTotalPages(response.data.last_page);
      }
      if (response.data.total) {
        setTotalItems(response.data.total);
      }
      if (response.data.per_page) {
        setPerPage(response.data.per_page);
      }
    }

    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) {
      return;
    }

    const response = await apiClient.deleteZone(id);

    if (response.error) {
      alert('Erreur lors de la suppression : ' + response.error);
    } else {
      loadZones(currentPage);
    }
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    savePagePreference(PAGE_NAME, newPerPage);
    setCurrentPage(1);
    loadZones(1, newPerPage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des zones...</p>
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
            Gestion des Zones
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            LISTE DES ZONES
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert('Créer une zone - À implémenter')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Créer une zone</span>
          </button>
          <button
            onClick={() => loadZones(currentPage)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow">
        <div className="flex items-center gap-2">
          <label htmlFor="perPage" className="text-sm text-gray-700 dark:text-gray-300">Afficher</label>
          <select
            id="perPage"
            value={perPage}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-700 dark:text-gray-300">par page</span>
        </div>
        {totalItems > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total: <span className="font-medium">{totalItems}</span> zones
          </span>
        )}
      </div>

      {/* Tableau des zones */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Zones</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Régions</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Départements</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Codes postaux</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Entreprises/Collectivités</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Modifier</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {zones.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucune zone trouvée
                </td>
              </tr>
            ) : (
              zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{zone.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {zone.metadata?.region || zone.parent?.type === 'REGION' ? zone.parent?.name || zone.metadata?.region : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {zone.metadata?.department || zone.type === 'DEPT' ? zone.name : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{zone.code_postal || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {zone.metadata?.start_date && zone.metadata?.end_date
                      ? `${new Date(zone.metadata.start_date).toLocaleDateString('fr-FR')} - ${new Date(zone.metadata.end_date).toLocaleDateString('fr-FR')}`
                      : new Date(zone.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-100">
                    {zone.type === 'ENTREPRISE' ? 'Oui' : 'Non'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => alert('Édition à implémenter')}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="Éditer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(zone.id)}
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
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {totalItems > 0 && (
                <>
                  Affichage de <span className="font-medium">{(currentPage - 1) * perPage + 1}</span>
                  {' - '}
                  <span className="font-medium">{Math.min(currentPage * perPage, totalItems)}</span>
                  {' sur '}
                  <span className="font-medium">{totalItems}</span> zones
                </>
              )}
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ≪
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ‹
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      currentPage === pageNum
                        ? 'bg-green-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ›
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ≫
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
