'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ImportView from '@/components/common/ImportView';

interface CreateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
  text: string;
  is_correct: boolean;
  extra?: string;
}

export default function CreateQuestionModal({ isOpen, onClose, onSuccess }: CreateQuestionModalProps) {
  const [showImport, setShowImport] = useState(false);
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
  const [error, setError] = useState('');

  // Charger les thèmes et niveaux au montage du composant
  useEffect(() => {
    if (isOpen) {
      loadThemes();
      loadLevels();
    }
  }, [isOpen]);

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

  const handleAddOption = () => {
    setOptions([...options, { text: '', is_correct: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
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
      // Vérifier le type et la taille
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image valide');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('L\'image ne doit pas dépasser 5MB');
        return;
      }

      setSelectedImage(file);

      // Créer un aperçu
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

    // Validation
    if (!selectedThemeId || !selectedLevelId) {
      setError('Veuillez sélectionner un thème et un niveau');
      return;
    }

    if (!questionData.question_text) {
      setError('Veuillez saisir le texte de la question');
      return;
    }

    // Validation des options selon le type
    let finalOptions: AnswerOption[];

    if (questionType === 'QCM') {
      // Vérifier que toutes les options ont du texte
      if (options.some(opt => !opt.text.trim())) {
        setError('Veuillez remplir toutes les options');
        return;
      }

      // Vérifier qu'au moins une option est correcte
      if (!options.some(opt => opt.is_correct)) {
        setError('Veuillez cocher au moins une bonne réponse');
        return;
      }

      finalOptions = options;
    } else {
      // Type VRAI_FAUX
      finalOptions = [
        { text: 'Vrai', is_correct: trueFalseAnswer === 'true' },
        { text: 'Faux', is_correct: trueFalseAnswer === 'false' },
      ];
    }

    setIsSubmitting(true);

    // Upload de l'image si présente
    let imageUrl = null;
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

    // Créer ou récupérer le quiz pour ce thème/niveau
    const selectedLevel = levels.find(l => l.id === parseInt(selectedLevelId));
    const quizTitle = `Quiz ${themes.find(t => t.id === selectedThemeId)?.title || ''} - ${selectedLevel?.name || ''}`;

    const quizResponse = await apiClient.createQuiz({
      title: quizTitle,
      theme_id: selectedThemeId,
      level_id: parseInt(selectedLevelId),
    });

    if (quizResponse.error) {
      setIsSubmitting(false);
      setError(quizResponse.error);
      return;
    }

    const quizId = quizResponse.data.id;

    // Créer la question
    const response = await apiClient.createQuestion({
      quiz_id: quizId,
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
    setShowImport(false);
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

  const isFormDisabled = !selectedThemeId || !selectedLevelId;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={
      <div className="flex items-center justify-between w-full">
        <span>Créer une question</span>
        <button
          onClick={() => setShowImport(!showImport)}
          className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
        >
          {showImport ? 'Formulaire' : 'Importer'}
        </button>
      </div>
    } size="xl">
      {showImport ? (
        <ImportView
          type="questions"
          onSuccess={() => {
            onSuccess();
            handleClose();
          }}
          onCancel={() => setShowImport(false)}
        />
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Sélection du thème et du niveau */}
          <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Thème *
                </label>
                <select
                  value={selectedThemeId}
                  onChange={(e) => setSelectedThemeId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Sélectionnez un thème</option>
                  {themes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Niveau *
                </label>
                <select
                  value={selectedLevelId}
                  onChange={(e) => setSelectedLevelId(e.target.value)}
                  disabled={!selectedThemeId}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Sélectionnez un niveau</option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!selectedThemeId && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Veuillez d'abord sélectionner un thème pour pouvoir choisir un niveau
              </p>
            )}
          </div>

          {/* Formulaire de question */}
          <div className={`space-y-4 ${isFormDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Type de question */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Type de question *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="QCM"
                    checked={questionType === 'QCM'}
                    onChange={(e) => setQuestionType(e.target.value as 'QCM' | 'VRAI_FAUX')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">QCM (Choix multiples)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="VRAI_FAUX"
                    checked={questionType === 'VRAI_FAUX'}
                    onChange={(e) => setQuestionType(e.target.value as 'QCM' | 'VRAI_FAUX')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Vrai ou Faux</span>
                </label>
              </div>
            </div>

            {/* Question */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Question *
              </label>
              <textarea
                value={questionData.question_text}
                onChange={(e) => setQuestionData({ ...questionData, question_text: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Où faut-il jeter le carton ?"
                required
              />
            </div>

            {/* Options selon le type */}
            {questionType === 'QCM' ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Options de réponse *
                </label>

                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={option.is_correct}
                      onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      title="Bonne réponse"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-20">
                      Option {index + 1}
                    </span>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Texte de l'option"
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => handleRemoveOption(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={handleAddOption}
                  className="flex items-center space-x-2 px-4 py-2 text-green-600 border border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Ajouter une option</span>
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Cochez la ou les cases pour indiquer la/les bonne(s) réponse(s)
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Bonne réponse *
                </label>
                <select
                  value={trueFalseAnswer}
                  onChange={(e) => setTrueFalseAnswer(e.target.value as 'true' | 'false')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="true">Vrai</option>
                  <option value="false">Faux</option>
                </select>
              </div>
            )}

            {/* Section Le Saviez-Vous */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-2xl">💡</span>
                <h5 className="font-bold text-yellow-900 dark:text-yellow-200">
                  Le Saviez-Vous ?
                </h5>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Explication à afficher lorsque l'utilisateur répond correctement
              </p>
              <textarea
                value={questionData.explanation}
                onChange={(e) => setQuestionData({ ...questionData, explanation: e.target.value })}
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
                        <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF, WEBP (MAX. 5MB)</p>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

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
              disabled={isFormDisabled}
            >
              {isUploadingImage ? 'Upload en cours...' : 'Publier la question'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
