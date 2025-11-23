'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { usePagination } from '@/hooks/usePagination';
import PaginationControls from '@/components/common/PaginationControls';
import CreateQuestionModal from '@/components/questions/CreateQuestionModal';
import CreateThemeModal from '@/components/questions/CreateThemeModal';
import QuestionDetailsModal from '@/components/questions/QuestionDetailsModal';
import EditQuestionModal from '@/components/questions/EditQuestionModal';

interface Question {
  id: string;
  text: string;
  created_at: string;
  good_answers_percentage: number;
  bad_answers_percentage: number;
  total_answers?: number;
  quiz?: {
    theme?: {
      id: string;
      title: string;
    };
  };
}

interface Theme {
  id: string;
  title: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentPage, perPage, totalPages, totalItems, setCurrentPage, setPerPage, setTotalPages, setTotalItems } = usePagination();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateThemeModalOpen, setIsCreateThemeModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');

  useEffect(() => {
    loadThemes();
    loadQuestions(currentPage);
  }, [currentPage, selectedThemeId]);

  const loadThemes = async () => {
    const response = await apiClient.getThemes();
    if (response.data) {
      const themesData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setThemes(themesData);
    }
  };

  const loadQuestions = async (page: number, itemsPerPage?: number) => {
    setIsLoading(true);
    setError('');

    const response = await apiClient.getQuestions(
      page,
      itemsPerPage || perPage,
      selectedThemeId || undefined
    );

    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      const questionsData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setQuestions(questionsData);

      // Gestion de la pagination
      if (response.data.last_page) {
        setTotalPages(response.data.last_page);
      }
      if (response.data.total) {
        setTotalItems(response.data.total);
      }
    }

    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce questionnaire ?')) {
      return;
    }

    const response = await apiClient.deleteQuestion(id);

    if (response.error) {
      alert('Erreur lors de la suppression : ' + response.error);
    } else {
      // Recharger la liste
      loadQuestions(currentPage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des questions...</p>
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

  let num = 1;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des Questions
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Liste des questionnaires publiés
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreateThemeModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Créer un thème</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Créer une question</span>
          </button>
          <button
            onClick={() => loadQuestions(currentPage)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Barre d'outils et filtres */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow">
        <div className="flex items-center gap-4">
          {/* Theme filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="themeFilter" className="text-sm text-gray-700 dark:text-gray-300">
              Thème:
            </label>
            <select
              id="themeFilter"
              value={selectedThemeId}
              onChange={(e) => {
                setSelectedThemeId(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tous les thèmes</option>
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des questions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Question
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Date de publication
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Bonnes réponses
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Mauvaises réponses
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {questions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  Aucune question trouvée
                </td>
              </tr>
            ) : (
              questions.map((question) => (
                <tr
                  key={question.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedQuestionId(question.id);
                    setIsDetailsModalOpen(true);
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {num++}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {question.text}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {new Date(question.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center space-x-2">
                      {/* Bouton Voir détails */}
                      <button
                        onClick={() => {
                          setSelectedQuestionId(question.id);
                          setIsDetailsModalOpen(true);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                        title="Voir les détails"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>

                      {/* Bouton Éditer */}
                      <button
                        onClick={() => {
                          setSelectedQuestionId(question.id);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="Éditer"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>

                      {/* Bouton Supprimer */}
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Supprimer"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {question.total_answers && question.total_answers > 0 ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {question.good_answers_percentage}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {question.total_answers && question.total_answers > 0 ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          {question.bad_answers_percentage}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                    )}
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
          itemLabel="questions"
        />
      )}

      {/* Modal de création de thème */}
      <CreateThemeModal
        isOpen={isCreateThemeModalOpen}
        onClose={() => setIsCreateThemeModalOpen(false)}
        onSuccess={() => {
          // Optionnel: recharger les thèmes si nécessaire
          setIsCreateThemeModalOpen(false);
        }}
      />

      {/* Modal de création de question */}
      <CreateQuestionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          loadQuestions(currentPage);
        }}
      />

      {/* Modal de détails de question */}
      {selectedQuestionId && (
        <QuestionDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedQuestionId('');
          }}
          questionId={selectedQuestionId}
        />
      )}

      {/* Modal d'édition de question */}
      {selectedQuestionId && (
        <EditQuestionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedQuestionId('');
          }}
          onSuccess={() => {
            loadQuestions(currentPage);
            setIsEditModalOpen(false);
            setSelectedQuestionId('');
          }}
          questionId={selectedQuestionId}
        />
      )}
    </div>
  );
}
