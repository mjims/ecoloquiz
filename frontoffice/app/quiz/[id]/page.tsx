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
    }
  }, [currentQuestionIndex, quiz, answers]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleValidate = () => {
    if (!quiz || !selectedOption) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];

    // Save the answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedOption
    }));

    // Move to next question
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Submit quiz
      submitQuiz();
    }
  };

  const handleSkip = () => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
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
                {currentQuestionIndex + 1}/{quiz.questions.length}
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
              <h2 className="text-lg font-semibold text-gray-800">{quiz.title}</h2>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
            {/* Question Image */}
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-6xl lg:text-7xl">🗑️</span>
              </div>
            </div>

            {/* Question Text */}
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 text-center mb-8">
              {currentQuestion.text}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedOption === option.id
                      ? 'bg-blue-50 border-blue-500 shadow-md'
                      : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm lg:text-base text-gray-800">{option.text}</span>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
