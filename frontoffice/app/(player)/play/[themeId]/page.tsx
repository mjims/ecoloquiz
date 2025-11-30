'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, Star } from 'lucide-react';
import GiftAnimation from '@/components/GiftAnimation';

interface AnswerOption {
  id: string;
  text: string;
  question_id: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  explanation?: string;
  image_url?: string;
  options: AnswerOption[];
}

interface ValidationResult {
  is_correct: boolean;
  points_earned: number;
  correct_answer_ids: string[];
  correct_answer_texts: string[];
  explanation?: string;
  new_total_points?: number;
  is_multiple_answers?: boolean;
  won_gift?: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    company_name: string;
    milestone: number;
  };
}

interface QuestionData {
  question: Question;
  quiz: {
    id: string;
    title: string;
  };
  theme: {
    id: string;
    name: string;
  };
  level: {
    id: number;
    name: string;
    slug: string;
  };
  progress: {
    answered: number;
    total: number;
    percentage: number;
    history: string[];
  };
}

function PlayPageContent() {
  const params = useParams();
  const router = useRouter();
  const themeId = params.themeId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [themeCompleted, setThemeCompleted] = useState(false);
  const [otherThemes, setOtherThemes] = useState<any[]>([]);
  const [wonGift, setWonGift] = useState<ValidationResult['won_gift'] | null>(null);
  const [isWaitingForGiftAnimation, setIsWaitingForGiftAnimation] = useState(false);

  const [noQuestions, setNoQuestions] = useState(false);

  const fetchNextQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getNextQuestion(themeId);

      if (response.data) {
        if (response.data.no_questions) {
          setNoQuestions(true);
          setOtherThemes(response.data.other_themes || []);
        } else if (response.data.theme_completed) {
          // Theme completed, show other themes
          setThemeCompleted(true);
          setOtherThemes(response.data.other_themes || []);
        } else {
          // Got next question
          setQuestionData(response.data);
          setSelectedOptions([]);
          // Show checkboxes for QCM (multiple_choice), radio for VRAI_FAUX
          // User wants checkboxes for all QCMs to allow multiple selections even if only one is correct (strict validation)
          setAllowMultipleAnswers(response.data.question?.type !== 'VRAI_FAUX');
          setShowFeedback(false);
          setValidationResult(null);
        }
      }
    } catch (error) {
      console.error('Error fetching next question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId]);

  // ... (handlers)
  const handleOptionSelect = (optionId: string) => {
    if (showFeedback) return; // Prevent selection during feedback

    if (allowMultipleAnswers) {
      // Checkbox mode: toggle selection
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      // Radio mode: replace selection
      setSelectedOptions([optionId]);
    }
  };

  const handleValidate = async () => {
    if (!questionData || selectedOptions.length === 0 || isValidating) return;

    setIsValidating(true);
    try {
      // Call API to validate answer (send array or single string)
      const response = await apiClient.validateAnswer(
        questionData.quiz.id,
        questionData.question.id,
        allowMultipleAnswers ? selectedOptions : selectedOptions[0]
      );

      if (response.data) {
        console.log('Validation response:', response.data);
        setValidationResult(response.data);
        setShowFeedback(true);

        // Check if gift was won - delay animation by 5 seconds to show feedback first
        if (response.data.won_gift) {
          console.log('🎁 Gift won! Will show animation in 5 seconds...', response.data.won_gift);
          const giftData = response.data.won_gift;
          setIsWaitingForGiftAnimation(true);
          setTimeout(() => {
            setWonGift(giftData);
            setIsWaitingForGiftAnimation(false);
          }, 5000); // 5 second delay
        } else {
          console.log('No gift won, current points:', response.data.new_total_points);
        }
      } else if (response.error) {
        console.error('Error validating answer:', response.error);
        alert(response.error);
      }
    } catch (error) {
      console.error('Error validating answer:', error);
    } finally {
      setIsValidating(false);
    }
  };


  const handleCloseGiftAnimation = () => {
    // Just close the gift animation modal
    setWonGift(null);
    // Keep feedback visible so user can see their answer result
  };

  const handleContinue = () => {
    // Fetch next question (called from feedback screen)
    fetchNextQuestion();
  };

  const handleSkip = () => {
    // Fetch next question without answering
    fetchNextQuestion();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (noQuestions) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🚧</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Oups !</h1>
            <p className="text-lg text-gray-600 mb-8">
              Il n'y a pas encore de questions pour ce thème.
            </p>

            {otherThemes.length > 0 && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Essayez un autre thème :
                </h2>
                <div className="grid gap-4 mb-6">
                  {otherThemes.map((theme: any) => (
                    <button
                      key={theme.id}
                      onClick={() => router.push(`/play/${theme.id}`)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      {theme.title}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Retour au dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (themeCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Félicitations !</h1>
            <p className="text-lg text-gray-600 mb-8">
              Vous avez terminé tous les niveaux de ce thème !
            </p>

            {otherThemes.length > 0 && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Découvrez d'autres thèmes :
                </h2>
                <div className="grid gap-4 mb-6">
                  {otherThemes.map((theme: any) => (
                    <button
                      key={theme.id}
                      onClick={() => router.push(`/play/${theme.id}`)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      {theme.title}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Retour au dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!questionData) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Aucune question disponible</h1>
            <div className="flex flex-col gap-3 justify-center items-center">
              <button
                onClick={() => router.push('/quiz')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Choisir un autre thème
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Retour au dashboard
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const progress = questionData.progress;
  const progressPercentage = (progress.answered / progress.total) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <Header />

      <main className="flex-1 w-full px-4 py-6 lg:py-10">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            {/* Progress Bar Section */}
            <div className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              {/* Header: Star + Level Name */}
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-medium text-gray-800">{questionData.level.name}</span>
              </div>

              {/* Segments */}
              <div className="flex gap-1 h-3 mb-4">
                {(questionData.progress.history || []).map((status: string, index: number) => {
                  let colorClass = 'bg-gray-100';
                  const firstPendingIndex = (questionData.progress.history || []).indexOf('pending');
                  const isCurrent = index === firstPendingIndex;

                  if (status === 'correct') colorClass = 'bg-emerald-400';
                  else if (status === 'wrong') colorClass = 'bg-red-400';
                  else if (isCurrent) colorClass = 'bg-yellow-400';

                  return (
                    <div key={index} className={`flex-1 ${colorClass} first:rounded-l last:rounded-r transition-colors duration-300`}></div>
                  );
                })}
              </div>

              {/* Footer: Quiz Title + Count */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">{questionData.quiz.title}</h2>
                <span className="text-gray-400 text-sm font-medium">
                  ({questionData.progress.answered + (questionData.progress.answered < questionData.progress.total ? 1 : 0)}/{questionData.progress.total})
                </span>
              </div>
            </div>
            <div className="mt-2 flex justify-center">
              <button
                onClick={() => router.push('/quiz')}
                className="text-sm text-teal-600 hover:text-teal-700 underline"
              >
                Changer de thème
              </button>
            </div>
          </div>

          {/* Feedback Banner (shown after validation) */}
          {showFeedback && validationResult && (
            <div className={`mb-6 rounded-lg p-4 flex items-center justify-between ${validationResult.is_correct
              ? 'bg-green-50 border-2 border-green-200'
              : 'bg-red-50 border-2 border-red-200'
              }`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${validationResult.is_correct ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                  {validationResult.is_correct ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm lg:text-base font-medium ${validationResult.is_correct ? 'text-green-800' : 'text-red-800'
                  }`}>
                  {validationResult.is_correct ? 'Bonne réponse' : 'Mauvaise réponse'}
                </span>
              </div>
              <span className={`text-sm lg:text-base font-bold ${validationResult.is_correct ? 'text-green-700' : 'text-red-700'
                }`}>
                {validationResult.points_earned > 0 ? '+' : ''}{validationResult.points_earned} points
              </span>
            </div>
          )}

          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
            {showFeedback && validationResult && (
              <div className="mb-6 flex items-center gap-2 text-gray-600">
                <span className="text-2xl">🤔</span>
                <span className="text-sm lg:text-base">Le savais-tu ?</span>
              </div>
            )}

            {/* Question Image */}
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-6xl lg:text-7xl">🗑️</span>
              </div>
            </div>

            {/* Question Text */}
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6">
              {questionData.question.text}
            </h3>

            {/* Explanation (shown after validation) */}
            {showFeedback && validationResult && validationResult.explanation && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
                  {validationResult.explanation}
                </p>
              </div>
            )}

            {showFeedback && validationResult && (
              <div className="mb-4">
                <p className="text-sm lg:text-base font-medium text-gray-700">
                  {allowMultipleAnswers
                    ? 'Les bonnes réponses étaient :'
                    : 'La bonne réponse était :'}
                </p>
                {validationResult.correct_answer_texts.map((text, index) => (
                  <p key={index} className="text-sm text-gray-600">• {text}</p>
                ))}
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3 mb-8">
              {questionData.question.options.map((option) => {
                const isSelected = selectedOptions.includes(option.id);
                const isCorrectOption = showFeedback && validationResult &&
                  validationResult.correct_answer_ids.includes(option.id);
                const isIncorrectSelection = showFeedback && isSelected &&
                  !validationResult?.correct_answer_ids.includes(option.id);

                let optionStyle = 'bg-white border-gray-300';

                if (showFeedback) {
                  if (isCorrectOption) {
                    optionStyle = 'bg-green-50 border-green-500';
                  } else if (isIncorrectSelection) {
                    optionStyle = 'bg-red-50 border-red-500';
                  }
                } else {
                  if (isSelected) {
                    optionStyle = 'bg-blue-50 border-blue-500 shadow-md';
                  } else {
                    optionStyle = 'hover:border-gray-400 hover:bg-gray-50';
                  }
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={showFeedback}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${optionStyle} ${showFeedback ? 'cursor-default' : ''
                      }`}
                  >
                    {/* Selection indicator (checkbox or radio) */}
                    {!showFeedback && (
                      <div className={`flex-shrink-0 w-5 h-5 border-2 ${allowMultipleAnswers ? 'rounded' : 'rounded-full'
                        } ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                        } flex items-center justify-center`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    )}

                    {/* Feedback indicator (after validation) */}
                    {showFeedback && validationResult && (
                      <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center ${isCorrectOption
                        ? 'bg-green-500'
                        : isIncorrectSelection
                          ? 'bg-red-500'
                          : 'bg-transparent'
                        }`}>
                        {isCorrectOption && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {isIncorrectSelection && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    )}
                    <span className="text-sm lg:text-base text-gray-800">{option.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            {!showFeedback ? (
              <div className="flex gap-4">
                <button
                  onClick={handleSkip}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors text-sm lg:text-base"
                >
                  Passer
                </button>
                <button
                  onClick={handleValidate}
                  disabled={selectedOptions.length === 0 || isValidating}
                  className={`flex-1 font-medium py-3 px-6 rounded-lg transition-colors text-sm lg:text-base ${selectedOptions.length > 0 && !isValidating
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {isValidating ? 'Validation...' : 'Valider'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleContinue}
                disabled={isWaitingForGiftAnimation}
                className={`w-full font-medium py-3 px-6 rounded-lg transition-colors text-sm lg:text-base ${isWaitingForGiftAnimation
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
              >
                {isWaitingForGiftAnimation ? '🎁 Cadeau en préparation...' : 'Continuer'}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Gift Animation Modal */}
      {wonGift && (
        <GiftAnimation
          gift={wonGift}
          onContinue={handleCloseGiftAnimation}
        />
      )}
    </div>
  );
}

export default function PlayPage() {
  return (
    <ProtectedRoute>
      <PlayPageContent />
    </ProtectedRoute>
  );
}
