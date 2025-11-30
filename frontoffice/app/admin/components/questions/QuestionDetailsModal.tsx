'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@admin/lib/api-client';
import Modal from '@admin/components/common/Modal';

interface QuestionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
}

interface AnswerOption {
  id: string;
  text: string;
  is_correct: boolean;
  extra?: string;
}

interface Quiz {
  id: string;
  title: string;
  theme?: {
    title: string;
  };
  level?: {
    name: string;
  };
}

interface QuestionDetails {
  id: string;
  text: string;
  type: string;
  explanation?: string;
  image_url?: string;
  created_at: string;
  quiz?: Quiz;
  options: AnswerOption[];
  // Statistiques
  total_answers?: number;
  correct_answers?: number;
  incorrect_answers?: number;
  good_answers_percentage?: number;
  bad_answers_percentage?: number;
}

export default function QuestionDetailsModal({
  isOpen,
  onClose,
  questionId,
}: QuestionDetailsModalProps) {
  const [question, setQuestion] = useState<QuestionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && questionId) {
      loadQuestionDetails();
    }
  }, [isOpen, questionId]);

  const loadQuestionDetails = async () => {
    setIsLoading(true);
    setError('');

    const response = await apiClient.getQuestion(questionId);

    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      // L'API retourne {question: {...}}
      const questionData = response.data.question || response.data;
      setQuestion(questionData);
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setQuestion(null);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Détails de la question" size="xl">
      <div className="space-y-6">
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
        ) : question ? (
          <>
            {/* En-tête avec informations du quiz */}
            {question.quiz && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Thème</p>
                    <p className="text-gray-900 dark:text-gray-100 mt-1">
                      {question.quiz.theme?.title || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Niveau</p>
                    <p className="text-gray-900 dark:text-gray-100 mt-1">
                      {question.quiz.level?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Type</p>
                    <p className="text-gray-900 dark:text-gray-100 mt-1">{question.type}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Question */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Question
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                {question.text}
              </p>
            </div>

            {/* Image si présente */}
            {question.image_url && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Image
                </h3>
                <img
                  src={question.image_url}
                  alt="Question"
                  className="w-full max-h-64 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
              </div>
            )}

            {/* Réponses */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Réponses
              </h3>
              <div className="space-y-3">
                {question.options && question.options.length > 0 ? question.options.map((option, index) => (
                  <div
                    key={option.id}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      option.is_correct
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${
                              option.is_correct
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </span>
                          <p
                            className={`font-medium ${
                              option.is_correct
                                ? 'text-green-800 dark:text-green-300'
                                : 'text-red-800 dark:text-red-300'
                            }`}
                          >
                            {option.text}
                          </p>
                        </div>
                        {option.extra && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 ml-8">
                            {option.extra}
                          </p>
                        )}
                      </div>
                      {option.is_correct && (
                        <svg
                          className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Aucune réponse disponible
                  </p>
                )}
              </div>
            </div>

            {/* Explication */}
            {question.explanation && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Explication
                </h3>
                <p className="text-blue-800 dark:text-blue-400 text-sm leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            )}

            {/* Section Statistiques */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Statistiques
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total de réponses */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Total de réponses
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {question.total_answers || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <svg
                        className="w-6 h-6 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bonnes réponses */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                        Bonnes réponses
                      </p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-300 mt-1">
                        {question.good_answers_percentage || 0}%
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                        {question.correct_answers || 0} réponses
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Mauvaises réponses */}
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                        Mauvaises réponses
                      </p>
                      <p className="text-2xl font-bold text-red-900 dark:text-red-300 mt-1">
                        {question.bad_answers_percentage || 0}%
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                        {question.incorrect_answers || 0} réponses
                      </p>
                    </div>
                    <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                      <svg
                        className="w-6 h-6 text-red-600 dark:text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Date de création */}
            <div className="text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
              Créée le {new Date(question.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </>
        ) : null}

        {/* Bouton de fermeture */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
