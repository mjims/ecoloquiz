<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\AnswerOption;
use App\Models\Quiz;
use App\Models\Theme;
use App\Models\Level;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportQuestionController extends Controller
{
    /**
     * Download template Excel file
     */
    public function downloadTemplate(Request $request)
    {
        $type = $request->query('type', 'questions'); // 'questions', 'unified'

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        if ($type === 'unified') {
            // Template for unified import (themes + questions)
            $headers = [
                'theme_title', 'theme_description', 'theme_image_url',
                'level_order',
                'question_text', 'question_type', 'question_explanation', 'question_image_url',
                'option_1_text', 'option_1_correct',
                'option_2_text', 'option_2_correct',
                'option_3_text', 'option_3_correct',
                'option_4_text', 'option_4_correct',
            ];

            // Example data
            $sheet->fromArray($headers, null, 'A1');
            $sheet->fromArray([
                'Recyclage', 'Questions sur le recyclage', '', 1,
                'Le plastique est-il 100% recyclable ?', 'QCM', 'Tous les plastiques ne sont pas recyclables', '',
                'Oui, totalement', 'false',
                'Partiellement', 'true',
                'Non', 'false',
                '', ''
            ], null, 'A2');
        } else {
            // Template for questions only
            $headers = [
                'quiz_id',
                'question_text', 'question_type', 'question_explanation', 'question_image_url',
                'option_1_text', 'option_1_correct',
                'option_2_text', 'option_2_correct',
                'option_3_text', 'option_3_correct',
                'option_4_text', 'option_4_correct',
            ];

            $sheet->fromArray($headers, null, 'A1');
            // Example with a placeholder quiz_id
            $sheet->fromArray([
                'PASTE_QUIZ_ID_HERE',
                'Question example', 'QCM', 'Explanation here', '',
                'Option 1', 'false',
                'Option 2', 'true',
                'Option 3', 'false',
                '', ''
            ], null, 'A2');
        }

        // Style header row
        $sheet->getStyle('A1:' . $sheet->getHighestColumn() . '1')->getFont()->setBold(true);

        $fileName = $type === 'unified' ? 'template_questions_unified.xlsx' : 'template_questions.xlsx';
        
        $writer = new Xlsx($spreadsheet);
        
        // Output to browser
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="' . $fileName . '"');
        header('Cache-Control: max-age=0');
        
        $writer->save('php://output');
        exit;
    }

    /**
     * Validate imported file and return preview
     */
    public function validateImport(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv|max:10240', // 10MB max
            'type' => 'nullable|in:questions,unified',
        ]);

        $file = $request->file('file');
        $type = $request->input('type', 'questions');

        try {
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            // Remove header row
            $headers = array_shift($rows);
            
            $preview = [];
            $errors = [];

            if ($type === 'unified') {
                // Group by theme
                $groupedData = $this->parseUnifiedData($rows, $headers, $errors);
                $preview = $groupedData;
            } else {
                // Parse questions only
                $preview = $this->parseQuestionsOnly($rows, $headers, $errors);
            }

            return response()->json([
                'success' => count($errors) === 0,
                'preview' => $preview,
                'errors' => $errors,
                'total_questions' => count($rows),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la lecture du fichier : ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Execute the import
     */
    public function executeImport(Request $request)
    {
        $request->validate([
            'data' => 'required|array',
            'type' => 'required|in:questions,unified',
        ]);

        $data = $request->input('data');
        $type = $request->input('type');

        DB::beginTransaction();

        try {
            if ($type === 'unified') {
                $stats = $this->executeUnifiedImport($data);
            } else {
                $stats = $this->executeQuestionsImport($data);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Importation réussie',
                'stats' => $stats,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de l\'importation : ' . $e->getMessage(),
            ], 500);
        }
    }

    // Private helper methods

    private function parseUnifiedData($rows, $headers, &$errors)
    {
        $themeData = [];

        foreach ($rows as $index => $row) {
            $lineNumber = $index + 2; // +2 because of 0-index and header

            if (empty(array_filter($row))) {
                continue; // Skip empty rows
            }

            $theme_title = trim($row[0] ?? '');
            $level_order = intval($row[3] ?? 0);

            if (empty($theme_title)) {
                $errors[] = "Ligne $lineNumber : theme_title requis";
                continue;
            }

            if ($level_order < 1 || $level_order > 3) {
                $errors[] = "Ligne $lineNumber : level_order doit être 1, 2 ou 3";
                continue;
            }

            // Initialize theme if not exists
            if (!isset($themeData[$theme_title])) {
                $themeData[$theme_title] = [
                    'title' => $theme_title,
                    'description' => trim($row[1] ?? ''),
                    'image_url' => trim($row[2] ?? ''),
                    'levels' => [],
                ];
            }

            // Initialize level if not exists
            if (!isset($themeData[$theme_title]['levels'][$level_order])) {
                $themeData[$theme_title]['levels'][$level_order] = [
                    'order' => $level_order,
                    'questions' => [],
                ];
            }

            // Parse question
            $question = $this->parseQuestionRow($row, $lineNumber, 4, $errors);
            if ($question) {
                $themeData[$theme_title]['levels'][$level_order]['questions'][] = $question;
            }
        }

        return array_values($themeData);
    }

    private function parseQuestionsOnly($rows, $headers, &$errors)
    {
        $questions = [];

        foreach ($rows as $index => $row) {
            $lineNumber = $index + 2;

            if (empty(array_filter($row))) {
                continue;
            }

            $quiz_id = trim($row[0] ?? '');
            if (empty($quiz_id)) {
                $errors[] = "Ligne $lineNumber : quiz_id requis";
                continue;
            }

            if (!Quiz::where('id', $quiz_id)->exists()) {
                $errors[] = "Ligne $lineNumber : quiz_id invalide";
                continue;
            }

            $question = $this->parseQuestionRow($row, $lineNumber, 1, $errors);
            if ($question) {
                $question['quiz_id'] = $quiz_id;
                $questions[] = $question;
            }
        }

        return $questions;
    }

    private function parseQuestionRow($row, $lineNumber, $startCol, &$errors)
    {
        $question_text = trim($row[$startCol] ?? '');
        $question_type = strtoupper(trim($row[$startCol + 1] ?? ''));

        if (empty($question_text)) {
            $errors[] = "Ligne $lineNumber : question_text requis";
            return null;
        }

        if (!in_array($question_type, ['QCM', 'VRAI_FAUX'])) {
            $errors[] = "Ligne $lineNumber : question_type doit être QCM ou VRAI_FAUX";
            return null;
        }

        // Parse options
        $options = [];
        $hasCorrect = false;

        for ($i = 0; $i < 4; $i++) {
            $optionTextCol = $startCol + 4 + ($i * 2);
            $optionCorrectCol = $optionTextCol + 1;

            $optionText = trim($row[$optionTextCol] ?? '');
            $optionCorrect = strtolower(trim($row[$optionCorrectCol] ?? '')) === 'true';

            if (!empty($optionText)) {
                $options[] = [
                    'text' => $optionText,
                    'is_correct' => $optionCorrect,
                ];

                if ($optionCorrect) {
                    $hasCorrect = true;
                }
            }
        }

        if (!$hasCorrect) {
            $errors[] = "Ligne $lineNumber : au moins une option correcte requise";
            return null;
        }

        return [
            'text' => $question_text,
            'type' => $question_type,
            'explanation' => trim($row[$startCol + 2] ?? ''),
            'image_url' => trim($row[$startCol + 3] ?? ''),
            'options' => $options,
        ];
    }

    private function executeUnifiedImport($data)
    {
        $createdThemes = 0;
        $createdQuestions = 0;

        foreach ($data as $themeData) {
            // Find or create theme
            $theme = Theme::firstOrCreate(
                ['title' => $themeData['title']],
                [
                    'id' => Str::uuid(),
                    'description' => $themeData['description'] ?? null,
                    'image_url' => $themeData['image_url'] ?? null,
                ]
            );

            if ($theme->wasRecentlyCreated) {
                $createdThemes++;
            }

            // Process each level
            foreach ($themeData['levels'] as $levelData) {
                $level = Level::where('order', $levelData['order'])->first();
                if (!$level) {
                    continue;
                }

                // Find or create quiz
                $quiz = Quiz::firstOrCreate(
                    [
                        'theme_id' => $theme->id,
                        'level_id' => $level->id,
                    ],
                    [
                        'id' => Str::uuid(),
                        'title' => $theme->title . ' - Niveau ' . $level->order,
                    ]
                );

                // Create questions
                foreach ($levelData['questions'] as $questionData) {
                    $question = Question::create([
                        'id' => Str::uuid(),
                        'quiz_id' => $quiz->id,
                        'text' => $questionData['text'],
                        'type' => $questionData['type'],
                        'explanation' => $questionData['explanation'],
                        'image_url' => $questionData['image_url'],
                    ]);

                    foreach ($questionData['options'] as $option) {
                        AnswerOption::create([
                            'id' => Str::uuid(),
                            'question_id' => $question->id,
                            'text' => $option['text'],
                            'is_correct' => $option['is_correct'],
                        ]);
                    }

                    $createdQuestions++;
                }
            }
        }

        return [
            'themes' => $createdThemes,
            'questions' => $createdQuestions,
        ];
    }

    private function executeQuestionsImport($data)
    {
        $createdQuestions = 0;

        foreach ($data as $questionData) {
            $question = Question::create([
                'id' => Str::uuid(),
                'quiz_id' => $questionData['quiz_id'],
                'text' => $questionData['text'],
                'type' => $questionData['type'],
                'explanation' => $questionData['explanation'],
                'image_url' => $questionData['image_url'],
            ]);

            foreach ($questionData['options'] as $option) {
                AnswerOption::create([
                    'id' => Str::uuid(),
                    'question_id' => $question->id,
                    'text' => $option['text'],
                    'is_correct' => $option['is_correct'],
                ]);
            }

            $createdQuestions++;
        }

        return [
            'questions' => $createdQuestions,
        ];
    }
}
