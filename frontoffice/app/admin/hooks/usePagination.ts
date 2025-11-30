import { useState, useEffect } from 'react';
import { getGlobalPreference } from '@admin/lib/pagination-preferences';

interface UsePaginationOptions {
  defaultPerPage?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setTotalPages: (total: number) => void;
  setTotalItems: (total: number) => void;
  resetPagination: () => void;
}

/**
 * Hook personnalisé pour gérer la pagination
 * Utilise la préférence globale sauvegardée dans localStorage
 *
 * @example
 * const pagination = usePagination();
 *
 * // Dans useEffect
 * useEffect(() => {
 *   loadData(pagination.currentPage, pagination.perPage);
 * }, [pagination.currentPage, pagination.perPage]);
 *
 * // Après fetch
 * pagination.setTotalPages(response.last_page);
 * pagination.setTotalItems(response.total);
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { defaultPerPage = 15 } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(() => getGlobalPreference() || defaultPerPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Synchroniser perPage avec la préférence globale au montage
  useEffect(() => {
    const globalPref = getGlobalPreference();
    if (globalPref && globalPref !== perPage) {
      setPerPage(globalPref);
    }
  }, []);

  const resetPagination = () => {
    setCurrentPage(1);
    setTotalPages(1);
    setTotalItems(0);
  };

  const handleSetPerPage = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Revenir à la première page quand on change le nombre d'items
  };

  return {
    currentPage,
    perPage,
    totalPages,
    totalItems,
    setCurrentPage,
    setPerPage: handleSetPerPage,
    setTotalPages,
    setTotalItems,
    resetPagination
  };
}
