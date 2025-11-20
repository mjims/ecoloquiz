'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  questionId: string;
}

interface Theme {
  id: string;
  title: string;
  description: string;
}

interface Level {
  id: number;
  name: string;
  slug: string;
  order: number;
}

interface AnswerOption {
  id?: string;
  text: string;
  is_correct: boolean;
  extra?: string;
}

interface QuestionData {
  quiz_id: string;
  text: string;
  type: 'QCM' | 'VRAI_FAUX';
  explanation: string;
  image_url: string;
  options: AnswerOption[];
  quiz?: {
    theme_id: string;
    level_id: number;
  };
}

export default function EditQuestionModal({
  isOpen,
  onClose,
  onSuccess,
  questionId,
}: EditQuestionModalProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');
  const [questionType, setQuestionType] = useState<'QCM' | 'VRAI_FAUX'>('QCM');

  const [questionData, setQuestionData] = useState({
    question_text: '',
    explanation: '',
    image_url: '',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [options, setOptions] = useState<AnswerOption[]>([
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ]);

  const [trueFalseAnswer, setTrueFalseAnswer] = useState<'true' | 'false'>('true');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && questionId) {
      loadThemes();
      loadLevels();
      loadQuestion();
    }
  }, [isOpen, questionId]);

  const loadThemes = async () => {
    const response = await apiClient.getThemes();
    if (response.data) {
      const themesData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setThemes(themesData);
    }
  };

  const loadLevels = async () => {
    const response = await apiClient.getLevels();
    if (response.data) {
      const levelsData = Array.isArray(response.data) ? response.data : [];
      setLevels(levelsData);
    }
  };

  const loadQuestion = async () => {
    setIsLoading(true);
    setError('');

    const response = await apiClient.getQuestion(questionId);

    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      const question: QuestionData = response.data.question || response.data;

      setQuestionData({
        question_text: question.text,
        explanation: question.explanation || '',
        image_url: question.image_url || '',
      });

      setQuestionType(question.type);

      if (question.image_url) {
        setImagePreview(question.image_url);
      }

      if (question.quiz) {
        setSelectedThemeId(question.quiz.theme_id);
        setSelectedLevelId(question.quiz.level_id.toString());
      }

      if (question.options && question.options.length > 0) {
        if (question.type === 'VRAI_FAUX') {
          const trueOption = question.options.find((opt) => opt.text.toLowerCase() === 'vrai');
          setTrueFalseAnswer(trueOption?.is_correct ? 'true' : 'false');
        } else {
          setOptions(question.options);
        }
      }
    }

    setIsLoading(false);
  };

  const handleAddOption = () => {
    setOptions([...options, { text: '', is_correct: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, field: keyof AnswerOption, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image valide');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setQuestionData({ ...questionData, image_url: '' });
  };

  const handleSubmit = async () => {
    setError('');

    if (!questionData.question_text) {
      setError('Veuillez saisir le texte de la question');
      return;
    }

    let finalOptions: AnswerOption[] = [];

    if (questionType === 'QCM') {
      const validOptions = options.filter((opt) => opt.text.trim() !== '');
      if (validOptions.length < 2) {
        setError('Veuillez saisir au moins 2 réponses');
        return;
      }

      const hasCorrectAnswer = validOptions.some((opt) => opt.is_correct);
      if (!hasCorrectAnswer) {
        setError('Veuillez marquer au moins une réponse comme correcte');
        return;
      }

      finalOptions = validOptions;
    } else {
      finalOptions = [
        { text: 'Vrai', is_correct: trueFalseAnswer === 'true' },
        { text: 'Faux', is_correct: trueFalseAnswer === 'false' },
      ];
    }

    setIsSubmitting(true);

    // Upload de l'image si une nouvelle a été sélectionnée
    let imageUrl = questionData.image_url;
    if (selectedImage) {
      setIsUploadingImage(true);
      const uploadResponse = await apiClient.uploadImage(selectedImage);
      setIsUploadingImage(false);

      if (uploadResponse.error) {
        setIsSubmitting(false);
        setError(uploadResponse.error);
        return;
      }

      imageUrl = uploadResponse.data.url;
    }

    // Mettre à jour la question
    const response = await apiClient.updateQuestion(questionId, {
      text: questionData.question_text,
      type: questionType,
      explanation: questionData.explanation || null,
      image_url: imageUrl,
      options: finalOptions,
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
    setSelectedThemeId('');
    setSelectedLevelId('');
    setQuestionType('QCM');
    setQuestionData({ question_text: '', explanation: '', image_url: '' });
    setSelectedImage(null);
    setImagePreview('');
    setOptions([
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ]);
    setTrueFalseAnswer('true');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Modifier la question" size="xl">
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Sélection du type de question */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Type de question *
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as 'QCM' | 'VRAI_FAUX')}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="QCM">QCM (Questions à choix multiples)</option>
                <option value="VRAI_FAUX">Vrai ou Faux</option>
              </select>
            </div>

            {/* Texte de la question */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Question *
              </label>
              <textarea
                value={questionData.question_text}
                onChange={(e) =>
                  setQuestionData({ ...questionData, question_text: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Saisissez votre question..."
                required
              />
            </div>

            {/* Options pour QCM */}
            {questionType === 'QCM' && (
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Réponses (cochez la ou les bonnes réponses)
                </label>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={option.is_correct}
                        onChange={(e) =>
                          handleOptionChange(index, 'is_correct', e.target.checked)
                        }
                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder={`Réponse ${index + 1}`}
                      />
                      {options.length > 1 && (
                        <button
                          onClick={() => handleRemoveOption(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                          title="Supprimer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddOption}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter une réponse
                </button>
              </div>
            )}

            {/* Options pour VRAI/FAUX */}
            {questionType === 'VRAI_FAUX' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Bonne réponse *
                </label>
                <select
                  value={trueFalseAnswer}
                  onChange={(e) => setTrueFalseAnswer(e.target.value as 'true' | 'false')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="true">Vrai</option>
                  <option value="false">Faux</option>
                </select>
              </div>
            )}

            {/* Explication */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Explication (Le saviez-vous ?)
              </label>
              <textarea
                value={questionData.explanation}
                onChange={(e) =>
                  setQuestionData({ ...questionData, explanation: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="À vous d'écrire la réponse le saviez-vous..."
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Image (optionnel)
              </label>

              {!imagePreview ? (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Cliquez pour télécharger</span> ou
                        glissez-déposez
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF, WEBP (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    title="Supprimer l'image"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={handleClose} variant="secondary" className="flex-1">
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            className="flex-1"
            isLoading={isSubmitting || isUploadingImage}
            disabled={isLoading}
          >
            {isUploadingImage ? 'Upload en cours...' : 'Mettre à jour'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
