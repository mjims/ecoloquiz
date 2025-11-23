'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

interface ImportViewProps {
    type: 'questions' | 'themes' | 'unified';
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ImportView({ type, onSuccess, onCancel }: ImportViewProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [preview, setPreview] = useState<any>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [mode, setMode] = useState<'questions' | 'unified'>(
        type === 'themes' ? 'questions' : 'unified'
    );

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.csv'))) {
            setFile(droppedFile);
            validateFile(droppedFile);
        } else {
            alert('Veuillez sélectionner un fichier Excel (.xlsx) ou CSV (.csv)');
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            validateFile(selectedFile);
        }
    };

    const validateFile = async (fileToValidate: File) => {
        setIsValidating(true);
        setPreview(null);
        setErrors([]);

        try {
            let response;
            if (type === 'themes') {
                response = await apiClient.validateThemeImport(fileToValidate);
            } else {
                response = await apiClient.validateQuestionImport(fileToValidate, mode);
            }

            if (response.data) {
                setPreview(response.data.preview);
                setErrors(response.data.errors || []);
            } else if (response.error) {
                setErrors([response.error]);
            }
        } catch (error: any) {
            setErrors(['Erreur lors de la validation du fichier']);
        } finally {
            setIsValidating(false);
        }
    };

    const handleImport = async () => {
        if (!preview) return;

        setIsImporting(true);

        try {
            let response;
            if (type === 'themes') {
                response = await apiClient.executeThemeImport(preview);
            } else {
                response = await apiClient.executeQuestionImport(preview, mode);
            }

            if (response.data && response.data.success) {
                alert('Importation réussie !');
                onSuccess();
            } else {
                alert('Erreur lors de l\'importation : ' + (response.error || 'Erreur inconnue'));
            }
        } catch (error: any) {
            alert('Erreur lors de l\'importation');
        } finally {
            setIsImporting(false);
        }
    };

    const downloadTemplate = () => {
        if (type === 'themes') {
            apiClient.downloadThemeTemplate();
        } else {
            apiClient.downloadQuestionTemplate(mode);
        }
    };

    return (
        <div className="space-y-6">
            {/* Mode selector for questions */}
            {type === 'questions' && (
                <div className="flex gap-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="questions"
                            checked={mode === 'questions'}
                            onChange={() => setMode('questions')}
                            className="mr-2"
                        />
                        <span className="text-sm">Questions seules (avec quiz_id)</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="unified"
                            checked={mode === 'unified'}
                            onChange={() => setMode('unified')}
                            className="mr-2"
                        />
                        <span className="text-sm">Thèmes + Questions (unifié)</span>
                    </label>
                </div>
            )}

            {/* Download template button */}
            <div className="flex justify-between items-center">
                <button
                    onClick={downloadTemplate}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Télécharger le modèle</span>
                </button>
            </div>

            {/* Drag & Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                    }`}
            >
                <div className="space-y-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                            <span>Cliquez pour sélectionner</span>
                            <input
                                id="file-upload"
                                type="file"
                                className="sr-only"
                                accept=".xlsx,.csv"
                                onChange={handleFileSelect}
                            />
                        </label>
                        <p className="pl-1">ou glissez-déposez un fichier</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        Excel (.xlsx) ou CSV jusqu'à 10MB
                    </p>
                </div>
            </div>

            {/* Selected File */}
            {file && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setFile(null);
                                setPreview(null);
                                setErrors([]);
                            }}
                            className="text-red-600 hover:text-red-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Validation Loading */}
            {isValidating && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Validation en cours...</p>
                </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Erreurs de validation :</h3>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Preview Summary */}
            {preview && errors.length === 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                        ✓ Fichier valide
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                        {type === 'themes'
                            ? `${Array.isArray(preview) ? preview.length : 0} thèmes prêts à être importés`
                            : type === 'unified'
                                ? `${Array.isArray(preview) ? preview.length : 0} thèmes et ${preview.reduce((sum: number, t: any) => sum + Object.values(t.levels || {}).reduce((s: number, l: any) => s + (l.questions?.length || 0), 0), 0)} questions prêts`
                                : `${Array.isArray(preview) ? preview.length : 0} questions prêtes à être importées`
                        }
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                    Annuler
                </button>
                <button
                    onClick={handleImport}
                    disabled={!preview || errors.length > 0 || isImporting}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isImporting ? 'Importation...' : 'Importer'}
                </button>
            </div>
        </div>
    );
}
