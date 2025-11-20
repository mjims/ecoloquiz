'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { apiClient } from '@/lib/api-client';

interface AnswerOption {
  id: string;
  text: string;
  question_id: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  text: string;
  type: string;
  explanation?: string;
  image_url?: string;
  options: AnswerOption[];
}

interface Quiz {
  id: string;
  title: string;
  level?: {
    id: number;
    name: string;
  };
  questions: Question[];
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getQuizToPlay(quizId);
        if (response.data && response.data.quiz) {
          setQuiz(response.data.quiz);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    // Load the answer for the current question if it exists
    if (quiz && quiz.questions[currentQuestionIndex]) {
      const currentQuestionId = quiz.questions[currentQuestionIndex].id;
      setSelectedOption(answers[currentQuestionId] || null);
      setShowFeedback(false);
    }
  }, [currentQuestionIndex, quiz, answers]);

  const handleOptionSelect = (optionId: string) => {
    if (showFeedback) return; // Prevent selection during feedback
    setSelectedOption(optionId);
  };

  const handleValidate = () => {
    if (!quiz || !selectedOption) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedOptionData = currentQuestion.options.find(opt => opt.id === selectedOption);

    // Check if answer is correct
    const isCorrect = selectedOptionData?.is_correct || false;
    setIsCorrectAnswer(isCorrect);
    setPointsEarned(isCorrect ? 5 : -10);

    // Save the answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedOption
    }));

    // Show feedback
    setShowFeedback(true);
  };

  const handleContinue = () => {
    if (!quiz) return;

    // Move to next question or submit
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      // Submit quiz
      submitQuiz();
    }
  };

  const handleSkip = () => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      // Submit quiz even with skipped questions
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      const response = await apiClient.submitQuiz(quizId, answers);
      if (response.data) {
        // Redirect to results page or show results
        router.push(`/quiz/${quizId}/results?score=${response.data.score}&correct=${response.data.correctAnswers}&total=${response.data.totalQuestions}`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Quiz non disponible</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Retour au dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const correctOption = currentQuestion.options.find(opt => opt.is_correct);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <Header />

      <main className="flex-1 w-full px-4 py-6 lg:py-10">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xl">⭐</span>
                <span className="text-sm font-medium text-gray-700">
                  {quiz.level?.name || 'Niveau 1'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                ({currentQuestionIndex + 1}/{quiz.questions.length})
              </span>
            </div>

            {/* Multi-colored progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="mt-2 text-center">
              <h2 className="text-base lg:text-lg font-semibold text-gray-800">{quiz.title}</h2>
            </div>
          </div>

          {/* Feedback Banner (shown after validation) */}
          {showFeedback && (
            <div className={`mb-6 rounded-lg p-4 flex items-center justify-between ${
              isCorrectAnswer
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-red-50 border-2 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${
                  isCorrectAnswer ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {isCorrectAnswer ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm lg:text-base font-medium ${
                  isCorrectAnswer ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isCorrectAnswer ? 'Bonne réponse' : 'Mauvaise réponse'}
                </span>
              </div>
              <span className={`text-sm lg:text-base font-bold ${
                isCorrectAnswer ? 'text-green-700' : 'text-red-700'
              }`}>
                {pointsEarned > 0 ? '+' : ''}{pointsEarned} points
              </span>
            </div>
          )}

          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
            {showFeedback && (
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
              {currentQuestion.text}
            </h3>

            {/* Explanation (shown after validation) */}
            {showFeedback && currentQuestion.explanation && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {showFeedback && (
              <div className="mb-4">
                <p className="text-sm lg:text-base font-medium text-gray-700">
                  La bonne réponse était :
                </p>
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOption === option.id;
                const isCorrectOption = option.is_correct;

                let optionStyle = 'bg-white border-gray-300';

                if (showFeedback) {
                  if (isCorrectOption) {
                    optionStyle = 'bg-green-50 border-green-500';
                  } else if (isSelected && !isCorrectOption) {
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
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${optionStyle} ${
                      showFeedback ? 'cursor-default' : ''
                    }`}
                  >
                    {showFeedback && (
                      <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center ${
                        isCorrectOption
                          ? 'bg-green-500'
                          : isSelected
                            ? 'bg-red-500'
                            : 'bg-transparent'
                      }`}>
                        {isCorrectOption && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {isSelected && !isCorrectOption && (
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
                  disabled={!selectedOption}
                  className={`flex-1 font-medium py-3 px-6 rounded-lg transition-colors text-sm lg:text-base ${
                    selectedOption
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Valider
                </button>
              </div>
            ) : (
              <button
                onClick={handleContinue}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-sm lg:text-base"
              >
                Continuer
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
