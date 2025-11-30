'use client';

import { getGlobalPreference, saveGlobalPreference } from '@admin/lib/pagination-preferences';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  itemLabel?: string; // Ex: "abonnés", "pages", "utilisateurs"
}

/**
 * Composant de pagination réutilisable
 * Utilise une préférence GLOBALE sauvegardée dans localStorage
 * Le choix du nombre d'items s'applique à TOUTES les pages du backoffice
 */
export default function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
  itemLabel = 'éléments'
}: PaginationControlsProps) {
  const handlePerPageChange = (newPerPage: number) => {
    saveGlobalPreference(newPerPage);
    onPerPageChange(newPerPage);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    for (let i = 0; i < Math.min(maxPagesToShow, totalPages); i++) {
      let pageNum;

      if (totalPages <= maxPagesToShow) {
        pageNum = i + 1;
      } else if (currentPage <= 3) {
        pageNum = i + 1;
      } else if (currentPage >= totalPages - 2) {
        pageNum = totalPages - (maxPagesToShow - 1) + i;
      } else {
        pageNum = currentPage - 2 + i;
      }

      pages.push(
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            currentPage === pageNum
              ? 'bg-green-600 text-white'
              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          {pageNum}
        </button>
      );
    }

    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div className="space-y-4">
      {/* Barre de contrôle items par page */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow">
        <div className="flex items-center gap-2">
          <label htmlFor="perPage" className="text-sm text-gray-700 dark:text-gray-300">
            Afficher
          </label>
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
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            (s&apos;applique à toutes les pages)
          </span>
        </div>

        {totalItems > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total: <span className="font-medium">{totalItems}</span> {itemLabel}
          </span>
        )}
      </div>

      {/* Navigation de pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page <span className="font-medium">{currentPage}</span> sur{' '}
              <span className="font-medium">{totalPages}</span>
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Affichage de <span className="font-medium">{(currentPage - 1) * perPage + 1}</span>
              {' - '}
              <span className="font-medium">{Math.min(currentPage * perPage, totalItems)}</span>
              {' sur '}
              <span className="font-medium">{totalItems}</span> {itemLabel}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Première page */}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Première page"
            >
              ≪
            </button>

            {/* Page précédente */}
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Page précédente"
            >
              ‹
            </button>

            {/* Numéros de pages */}
            {renderPageNumbers()}

            {/* Page suivante */}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Page suivante"
            >
              ›
            </button>

            {/* Dernière page */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Dernière page"
            >
              ≫
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
