<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Allocation;
use App\Models\AnswerOption;
use App\Models\Gift;
use App\Models\Level;
use App\Models\Player;
use App\Models\PlayerAnswer;
use App\Models\PlayerThemeProgress;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\Theme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlayerDashboardController extends Controller
{
    /**
     * Get suggested quiz for the authenticated player
     *
     * @OA\Get(
     *   path="/api/player/suggested-quiz",
     *   tags={"Player Dashboard"},
     *   summary="Get a suggested quiz for the authenticated player",
     *   description="Returns a suggested quiz based on the player's current level",
     *   security={{"bearerAuth":{}}},
     *
     *   @OA\Response(
     *     response=200,
     *     description="Suggested quiz retrieved successfully",
     *     @OA\JsonContent(
     *       @OA\Property(property="quiz", type="object",
     *         @OA\Property(property="id", type="string", format="uuid"),
     *         @OA\Property(property="title", type="string", example="Cycle de vie des déchets"),
     *         @OA\Property(property="theme_id", type="string", format="uuid"),
     *         @OA\Property(property="level_id", type="integer", example=1),
     *         @OA\Property(property="max_score", type="integer", example=100),
     *         @OA\Property(property="theme", type="object"),
     *         @OA\Property(property="level", type="object")
     *       )
     *     )
     *   ),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=404, description="No quiz available")
     * )
     */
    public function suggestedQuiz(Request $request)
    {
        $user = $request->user();

        // Get or create player
        $player = Player::firstOrCreate(
            ['user_id' => $user->id],
            [
                'points' => 0,
                'current_level' => 'decouverte',
                'last_played' => null,
                'zone_id' => null
            ]
        );

        // Get first level
        $firstLevel = Level::orderBy('order', 'asc')->first();

        if (!$firstLevel) {
            return response()->json(['error' => 'No levels available'], 404);
        }

        // Get all themes
        $allThemes = Theme::all();
        
        // Filter out completed themes
        $incompleteThemesIds = [];
        foreach ($allThemes as $theme) {
            // Check if theme is completed
            $totalQuestions = Question::whereHas('quiz', function($q) use ($theme) {
                $q->where('theme_id', $theme->id);
            })->count();
            
            if ($totalQuestions === 0) {
                continue; // Skip themes with no questions
            }
            
            $answeredQuestions = PlayerAnswer::where('player_id', $player->id)
                ->whereHas('question.quiz', function($q) use ($theme) {
                    $q->where('theme_id', $theme->id);
                })->count();
            
            // Theme is incomplete if not all questions are answered
            if ($answeredQuestions < $totalQuestions) {
                $incompleteThemesIds[] = $theme->id;
            }
        }
        
        if (empty($incompleteThemesIds)) {
            return response()->json(['message' => 'All themes completed!'], 200);
        }

        // Get a random quiz from incomplete themes at level 1
        $quiz = Quiz::with(['theme', 'level'])
            ->where('level_id', $firstLevel->id)
            ->whereIn('theme_id', $incompleteThemesIds)
            ->inRandomOrder()
            ->first();

        if (!$quiz) {
            return response()->json(['error' => 'No quiz available'], 404);
        }

        return response()->json(['quiz' => $quiz]);
    }

    /**
     * Get progression statistics for the authenticated player
     *
     * @OA\Get(
     *   path="/api/player/progression",
     *   tags={"Player Dashboard"},
     *   summary="Get progression statistics for the authenticated player",
     *   description="Returns progression statistics including quiz completed count and level progress",
     *   security={{"bearerAuth":{}}},
     *
     *   @OA\Response(
     *     response=200,
     *     description="Progression statistics retrieved successfully",
     *     @OA\JsonContent(
     *       @OA\Property(property="quizCompleted", type="integer", example=45),
     *       @OA\Property(property="levels", type="array",
     *         @OA\Items(
     *           @OA\Property(property="level", type="integer", example=1),
     *           @OA\Property(property="name", type="string", example="Niveau 1"),
     *           @OA\Property(property="percentage", type="integer", example=100),
     *           @OA\Property(property="stars", type="integer", example=1)
     *         )
     *       )
     *     )
     *   ),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function progression(Request $request)
    {
        $user = $request->user();

        // Get or create player for this user
        $player = Player::firstOrCreate(
            ['user_id' => $user->id],
            [
                'points' => 0,
                'current_level' => 'DECOUVERTE',
                'last_played' => null,
                'zone_id' => null
            ]
        );

        // Calculate completed quizzes
        // A quiz is completed if the player has answered all its questions
        $quizzes = Quiz::withCount('questions')->get();
        $quizCompleted = 0;

        // Get all player answers grouped by quiz_id to optimize
        // We need to join questions to get quiz_id
        $playerAnswersCounts = PlayerAnswer::where('player_id', $player->id)
            ->join('questions', 'player_answers.question_id', '=', 'questions.id')
            ->selectRaw('questions.quiz_id, count(*) as count')
            ->groupBy('questions.quiz_id')
            ->pluck('count', 'quiz_id');

        foreach ($quizzes as $quiz) {
            $answeredCount = $playerAnswersCounts[$quiz->id] ?? 0;
            if ($quiz->questions_count > 0 && $answeredCount >= $quiz->questions_count) {
                $quizCompleted++;
            }
        }

        // Get all levels
        $levels = Level::orderBy('order', 'asc')->get();

        // Calculate progression for each level
        $levelProgress = [];
        foreach ($levels as $index => $level) {
            $levelNumber = $index + 1;

            // Total questions in this level
            $totalQuestions = Question::whereHas('quiz', function($q) use ($level) {
                $q->where('level_id', $level->id);
            })->count();

            // Answered questions in this level
            $answeredQuestions = PlayerAnswer::where('player_id', $player->id)
                ->whereHas('question.quiz', function($q) use ($level) {
                    $q->where('level_id', $level->id);
                })->count();

            $percentage = $totalQuestions > 0 ? round(($answeredQuestions / $totalQuestions) * 100) : 0;
            // Cap at 100%
            $percentage = min(100, $percentage);

            $levelProgress[] = [
                'level' => $levelNumber,
                'name' => $level->name,
                'percentage' => $percentage,
                'stars' => $levelNumber // Number of stars represents the level difficulty/rank
            ];
        }

        return response()->json([
            'quizCompleted' => $quizCompleted,
            'levels' => $levelProgress,
            'totalPoints' => $player->points
        ]);
    }

    /**
     * Get current game in progress
     *
     * @OA\Get(
     *   path="/api/player/current-game",
     *   tags={"Player Dashboard"},
     *   summary="Get current game in progress",
     *   description="Returns the theme ID if player has a game in progress",
     *   security={{"bearerAuth":{}}},
     *
     *   @OA\Response(
     *     response=200,
     *     description="Current game retrieved successfully",
     *     @OA\JsonContent(
     *       @OA\Property(property="has_game_in_progress", type="boolean"),
     *       @OA\Property(property="theme_id", type="string", format="uuid", nullable=true),
     *       @OA\Property(property="theme_name", type="string", nullable=true)
     *     )
     *   ),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function getCurrentGame(Request $request)
    {
        $user = $request->user();

        // Get or create player
        $player = Player::firstOrCreate(
            ['user_id' => $user->id],
            [
                'points' => 0,
                'current_level' => 'decouverte',
                'last_played' => null,
                'zone_id' => null
            ]
        );

        // Get the most recently played theme from PlayerThemeProgress
        $themeProgress = PlayerThemeProgress::where('player_id', $player->id)
            ->with(['theme', 'currentLevel'])
            ->orderBy('last_played_at', 'desc')
            ->first();

        if (!$themeProgress) {
            return response()->json([
                'has_game_in_progress' => false,
                'theme_id' => null,
                'theme_name' => null
            ]);
        }

        $themeId = $themeProgress->theme_id;
        $themeName = $themeProgress->theme->name;
        $currentLevel = $themeProgress->currentLevel;

        // Check if there are unanswered questions in this theme starting from current level
        $levels = Level::where('order', '>=', $currentLevel->order)
            ->orderBy('order', 'asc')
            ->get();

        $hasUnansweredQuestions = false;
        foreach ($levels as $lvl) {
            $quizzes = Quiz::where('theme_id', $themeId)
                ->where('level_id', $lvl->id)
                ->with(['questions'])
                ->get();

            foreach ($quizzes as $quiz) {
                $answeredQuestionIds = PlayerAnswer::where('player_id', $player->id)
                    ->whereIn('question_id', $quiz->questions->pluck('id'))
                    ->pluck('question_id')
                    ->toArray();

                $unansweredQuestion = $quiz->questions->whereNotIn('id', $answeredQuestionIds)->first();

                if ($unansweredQuestion) {
                    $hasUnansweredQuestions = true;
                    break 2;
                }
            }
        }

        if (!$hasUnansweredQuestions) {
            return response()->json([
                'has_game_in_progress' => false,
                'theme_id' => null,
                'theme_name' => null
            ]);
        }

        return response()->json([
            'has_game_in_progress' => true,
            'theme_id' => $themeId,
            'theme_name' => $themeName
        ]);
    }

    /**
     * Get next unanswered question for a theme
     *
     * @OA\Get(
     *   path="/api/player/theme/{themeId}/next-question",
     *   tags={"Player Dashboard"},
     *   summary="Get next unanswered question for a theme",
     *   description="Returns the next unanswered question based on player's current level",
     *   security={{"bearerAuth":{}}},
     *
     *   @OA\Parameter(
     *     name="themeId",
     *     in="path",
     *     description="Theme ID",
     *     required=true,
     *     @OA\Schema(type="string", format="uuid")
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Question retrieved successfully",
     *     @OA\JsonContent(
     *       @OA\Property(property="question", type="object"),
     *       @OA\Property(property="quiz", type="object"),
     *       @OA\Property(property="theme", type="object"),
     *       @OA\Property(property="level", type="object"),
     *       @OA\Property(property="progress", type="object")
     *     )
     *   ),
     *   @OA\Response(response=404, description="No more questions available"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function getNextQuestion(Request $request, $themeId)
    {
        $user = $request->user();

        // Get or create player
        $player = Player::firstOrCreate(
            ['user_id' => $user->id],
            [
                'points' => 0,
                'current_level' => 'decouverte',
                'last_played' => null,
                'zone_id' => null
            ]
        );

        // Get the theme
        $theme = Theme::findOrFail($themeId);

        // Get or create player theme progress
        $levels = Level::orderBy('order', 'asc')->get();
        $firstLevel = $levels->first();
        
        $themeProgress = PlayerThemeProgress::firstOrCreate(
            [
                'player_id' => $player->id,
                'theme_id' => $themeId
            ],
            [
                'current_level_id' => $firstLevel->id,
                'last_played_at' => now()
            ]
        );

        // Update last_played_at
        $themeProgress->last_played_at = now();
        $themeProgress->save();

        // Check if there are any questions at all for this theme
        $totalQuestionsCount = Question::whereHas('quiz', function($q) use ($themeId) {
            $q->where('theme_id', $themeId);
        })->count();

        if ($totalQuestionsCount === 0) {
             return response()->json([
                'message' => 'Aucune question disponible pour ce thème pour le moment.',
                'theme_completed' => false,
                'no_questions' => true,
                'other_themes' => Theme::where('id', '!=', $themeId)->get()
            ], 200);
        }

        // Get current level from theme progress
        $currentLevel = $themeProgress->currentLevel;

        // Try to find an unanswered question starting from current level
        $question = null;
        $quiz = null;
        $level = null;

        foreach ($levels as $lvl) {
            // Skip levels before current level
            if ($lvl->order < $currentLevel->order) {
                continue;
            }

            // Get all quizzes for this theme and level
            $quizzes = Quiz::where('theme_id', $themeId)
                ->where('level_id', $lvl->id)
                ->with(['questions.options'])
                ->get();

            // For each quiz, check if there are unanswered questions
            foreach ($quizzes as $q) {
                // Get all questions for this quiz
                $questions = $q->questions;

                // Get answered question IDs for this player
                $answeredQuestionIds = PlayerAnswer::where('player_id', $player->id)
                    ->whereIn('question_id', $questions->pluck('id'))
                    ->pluck('question_id')
                    ->toArray();

                // Find first unanswered question
                $unansweredQuestion = $questions->whereNotIn('id', $answeredQuestionIds)->first();

                if ($unansweredQuestion) {
                    $question = $unansweredQuestion;
                    $quiz = $q;
                    $level = $lvl;
                    break 2; // Break out of both loops
                }
            }
        }

        if (!$question) {
            // No more questions available for this theme
            // Get other themes with available questions
            $otherThemes = Theme::where('id', '!=', $themeId)->get();

            return response()->json([
                'message' => 'Vous avez terminé tous les niveaux de ce thème !',
                'theme_completed' => true,
                'other_themes' => $otherThemes
            ], 200);
        }

        // Update theme progress current level if we've advanced
        if ($level->id !== $themeProgress->current_level_id) {
            $themeProgress->current_level_id = $level->id;
            $themeProgress->save();
        }

        // Remove is_correct from options and check for multiple answers
        $questionData = $question->toArray();
        $isMultipleAnswers = false;

        if (isset($questionData['options'])) {
            $correctCount = 0;
            // We need to check the original options collection because toArray might have already processed them if not careful, 
            // but here we are working with the array from the model which includes is_correct.
            foreach ($questionData['options'] as &$option) {
                if (isset($option['is_correct']) && $option['is_correct']) {
                    $correctCount++;
                }
                unset($option['is_correct']);
            }
            $isMultipleAnswers = $correctCount > 1;
        }

        // Calculate progress for this level
        // Get all quizzes for this theme and level to ensure consistent ordering
        $quizzesInLevel = Quiz::where('theme_id', $themeId)
            ->where('level_id', $level->id)
            ->with(['questions'])
            ->get();
            
        $allQuestions = collect();
        foreach ($quizzesInLevel as $q) {
            $allQuestions = $allQuestions->concat($q->questions);
        }
        
        $totalQuestionsInLevel = $allQuestions->count();
        
        $playerAnswers = PlayerAnswer::where('player_id', $player->id)
            ->whereIn('question_id', $allQuestions->pluck('id'))
            ->get()
            ->keyBy('question_id');
            
        $history = [];
        $answeredQuestionsInLevel = 0;
        
        foreach ($allQuestions as $q) {
            if (isset($playerAnswers[$q->id])) {
                $history[] = $playerAnswers[$q->id]->is_correct ? 'correct' : 'wrong';
                $answeredQuestionsInLevel++;
            } else {
                $history[] = 'pending';
            }
        }

        return response()->json([
            'question' => $questionData,
            'is_multiple_answers' => $isMultipleAnswers,
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title
            ],
            'theme' => $theme,
            'level' => $level,
            'progress' => [
                'answered' => $answeredQuestionsInLevel,
                'total' => $totalQuestionsInLevel,
                'percentage' => $totalQuestionsInLevel > 0 ? round(($answeredQuestionsInLevel / $totalQuestionsInLevel) * 100) : 0,
                'history' => $history
            ]
        ]);
    }

    /**
     * Get quiz to play with questions and answer options
     *
     * @OA\Get(
     *   path="/api/player/quiz/{id}/play",
     *   tags={"Player Dashboard"},
     *   summary="Get a quiz to play with all questions and options",
     *   description="Returns a quiz with questions and answer options (without revealing correct answers)",
     *   security={{"bearerAuth":{}}},
     *
     *   @OA\Parameter(
     *     name="id",
     *     in="path",
     *     description="Quiz ID",
     *     required=true,
     *     @OA\Schema(type="string", format="uuid")
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Quiz retrieved successfully",
     *     @OA\JsonContent(
     *       @OA\Property(property="quiz", type="object")
     *     )
     *   ),
     *   @OA\Response(response=404, description="Quiz not found"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function getQuizToPlay($id)
    {
        $quiz = Quiz::with(['theme', 'level', 'questions.options'])->findOrFail($id);

        // Transform the quiz to hide is_correct field from options
        $quizData = $quiz->toArray();

        // Remove is_correct from all answer options
        if (isset($quizData['questions'])) {
            foreach ($quizData['questions'] as &$question) {
                if (isset($question['options'])) {
                    foreach ($question['options'] as &$option) {
                        unset($option['is_correct']);
                    }
                }
            }
        }

        return response()->json(['quiz' => $quizData]);
    }

    /**
     * Validate answer(s) for a quiz question
     *
     * @OA\Post(
     *   path="/api/player/quiz/{quizId}/validate-answer",
     *   tags={"Player Dashboard"},
     *   summary="Validate quiz answer(s)",
     *   description="Validates single or multiple answers and returns feedback",
     *   security={{"bearerAuth":{}}},
     *
     *   @OA\Parameter(
     *     name="quizId",
     *     in="path",
     *     description="Quiz ID",
     *     required=true,
     *     @OA\Schema(type="string", format="uuid")
     *   ),
     *
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       @OA\Property(property="question_id", type="string", format="uuid"),
     *       @OA\Property(property="answer_id", type="string", format="uuid", description="Single answer (mutually exclusive with answer_ids)"),
     *       @OA\Property(property="answer_ids", type="array", @OA\Items(type="string", format="uuid"), description="Multiple answers (mutually exclusive with answer_id)")
     *     )
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Answer validated successfully",
     *     @OA\JsonContent(
     *       @OA\Property(property="is_correct", type="boolean", example=true),
     *       @OA\Property(property="points_earned", type="integer", example=5),
     *       @OA\Property(property="correct_answer_ids", type="array", @OA\Items(type="string")),
     *       @OA\Property(property="correct_answer_texts", type="array", @OA\Items(type="string")),
     *       @OA\Property(property="explanation", type="string"),
     *       @OA\Property(property="is_multiple_answers", type="boolean")
     *     )
     *   ),
     *   @OA\Response(response=404, description="Question or answer not found"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function validateAnswer(Request $request, $quizId)
    {
        $user = $request->user();
        $questionId = $request->input('question_id');
        // Normalize input: we always want an array of answer IDs
        $answerIds = $request->input('answer_ids'); 
        $answerId = $request->input('answer_id');

        if (is_null($answerIds) && !is_null($answerId)) {
            $answerIds = [$answerId];
        }
        
        if (!is_array($answerIds)) {
             $answerIds = [];
        }

        // Get or create player
        $player = Player::firstOrCreate(
            ['user_id' => $user->id],
            [
                'points' => 0,
                'current_level' => 'decouverte',
                'last_played' => null,
                'zone_id' => null
            ]
        );

        // Find the question with options
        $question = Question::with('options')
            ->where('id', $questionId)
            ->where('quiz_id', $quizId)
            ->firstOrFail();

        // Check if player already answered this question
        $existingAnswer = PlayerAnswer::where('player_id', $player->id)
            ->where('question_id', $questionId)
            ->first();

        if ($existingAnswer) {
            return response()->json(['error' => 'You have already answered this question'], 400);
        }

        // Get all correct option IDs
        $correctOptions = $question->options->where('is_correct', true);
        $correctIds = $correctOptions->pluck('id')->toArray();

        // Strict validation: User answers must match exactly correct answers
        // 1. Count must be equal
        // 2. Intersection must have same count (meaning all user answers are in correct answers)
        
        $isCorrect = false;
        if (count($answerIds) === count($correctIds)) {
             $intersection = array_intersect($answerIds, $correctIds);
             if (count($intersection) === count($correctIds)) {
                 $isCorrect = true;
             }
        }

        $pointsEarned = $isCorrect ? 5 : -10;

        // Save player answer
        PlayerAnswer::create([
            'player_id' => $player->id,
            'question_id' => $question->id,
            'answer_id' => null, // We store everything in answer_ids now or we could keep backward compat if needed but let's stick to answer_ids for consistency in this logic
            'answer_ids' => $answerIds,
            'is_correct' => $isCorrect,
            'points_earned' => $pointsEarned,
            'answered_at' => now()
        ]);

        // Update player points
        $player->points += $pointsEarned;
        $player->last_played = now();
        $player->save();

        // Check if player reached a new milestone and allocate gift
        $wonGifts = $this->checkAndAllocateMilestoneGift($player);

        $response = [
            'is_correct' => $isCorrect,
            'points_earned' => $pointsEarned,
            'correct_answer_ids' => array_values($correctIds), // Ensure array is indexed
            'correct_answer_texts' => array_values($correctOptions->pluck('text')->toArray()),
            'explanation' => $question->explanation,
            'new_total_points' => $player->points,
            'is_multiple_answers' => count($correctIds) > 1
        ];

        // Include won gift if milestone reached
        if (!empty($wonGifts)) {
            $response['won_gift'] = $wonGifts[0]; // Return the first gift won
        }

        return response()->json($response);
    }

    /**
     * Submit quiz answers and get results
     *
     * @OA\Post(
     *   path="/api/player/quiz/{id}/submit",
     *   tags={"Player Dashboard"},
     *   summary="Submit quiz answers and get results",
     *   description="Submit answers for a quiz and receive score and feedback",
     *   security={{"bearerAuth":{}}},
     *
     *   @OA\Parameter(
     *     name="id",
     *     in="path",
     *     description="Quiz ID",
     *     required=true,
     *     @OA\Schema(type="string", format="uuid")
     *   ),
     *
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       @OA\Property(property="answers", type="object", example={"question-id-1": "option-id-1", "question-id-2": "option-id-2"})
     *     )
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Quiz submitted successfully",
     *     @OA\JsonContent(
     *       @OA\Property(property="score", type="integer", example=80),
     *       @OA\Property(property="totalQuestions", type="integer", example=10),
     *       @OA\Property(property="correctAnswers", type="integer", example=8),
     *       @OA\Property(property="results", type="array",
     *         @OA\Items(type="object")
     *       )
     *     )
     *   ),
     *   @OA\Response(response=404, description="Quiz not found"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function submitQuiz(Request $request, $id)
    {
        $user = $request->user();
        $answers = $request->input('answers', []);

        // Get or create player
        $player = Player::firstOrCreate(
            ['user_id' => $user->id],
            [
                'points' => 0,
                'current_level' => 'DECOUVERTE',
                'last_played' => null,
                'zone_id' => null
            ]
        );

        // Get quiz with questions and options
        $quiz = Quiz::with(['questions.options'])->findOrFail($id);

        // Calculate score
        $totalQuestions = $quiz->questions->count();
        $correctAnswers = 0;
        $results = [];

        foreach ($quiz->questions as $question) {
            $questionId = $question->id;
            $userAnswerId = $answers[$questionId] ?? null;

            // Find the correct option
            $correctOption = $question->options->where('is_correct', true)->first();
            $userAnswer = $question->options->where('id', $userAnswerId)->first();

            $isCorrect = $userAnswerId === $correctOption->id;

            if ($isCorrect) {
                $correctAnswers++;
            }

            $results[] = [
                'question_id' => $questionId,
                'question_text' => $question->text,
                'user_answer_id' => $userAnswerId,
                'user_answer_text' => $userAnswer ? $userAnswer->text : null,
                'correct_answer_id' => $correctOption->id,
                'correct_answer_text' => $correctOption->text,
                'is_correct' => $isCorrect,
                'explanation' => $question->explanation
            ];
        }

        // Calculate points: +5 for correct, -10 for incorrect (minimum 0)
        $pointsEarned = ($correctAnswers * 5) - (($totalQuestions - $correctAnswers) * 10);
        $pointsEarned = max(0, $pointsEarned);

        // Update player points and last played
        $player->points += $pointsEarned;
        $player->last_played = now();
        $player->save();

        // TODO: Save quiz attempt in database

        return response()->json([
            'score' => $pointsEarned,
            'totalQuestions' => $totalQuestions,
            'correctAnswers' => $correctAnswers,
            'results' => $results,
            'newTotalPoints' => $player->points
        ]);
    }

    /**
     * Get player's won gifts
     *
     * @OA\Get(
     *   path="/api/player/gifts",
     *   tags={"Player Dashboard"},
     *   summary="Get player's won gifts",
     *   description="Returns list of gifts allocated to the player with progress to next milestone",
     *   security={{"bearerAuth":{}}},
     *
     *   @OA\Response(
     *     response=200,
     *     description="Gifts retrieved successfully",
     *     @OA\JsonContent(
     *       @OA\Property(property="gifts", type="array", @OA\Items(type="object")),
     *       @OA\Property(property="next_milestone", type="integer", example=200),
     *       @OA\Property(property="points_to_next", type="integer", example=35)
     *     )
     *   ),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function getPlayerGifts(Request $request)
    {
        $user = $request->user();
        
        $player = Player::where('user_id', $user->id)->first();
        
        if (!$player) {
            return response()->json([
                'gifts' => [],
                'next_milestone' => 100,
                'points_to_next' => 100
            ]);
        }
        
        $allocations = Allocation::with('gift')
            ->where('player_id', $player->id)
            ->orderBy('allocated_at', 'desc')
            ->get();
        
        $nextMilestone = (floor($player->points / 100) + 1) * 100;
        $pointsToNext = $nextMilestone - $player->points;
        
        return response()->json([
            'gifts' => $allocations,
            'next_milestone' => $nextMilestone,
            'points_to_next' => $pointsToNext,
            'current_points' => $player->points
        ]);
    }

    /**
     * Get player statistics
     */
    public function playerStats(Request $request)
    {
        $user = $request->user();
        $player = Player::where('user_id', $user->id)->first();
        
        if (!$player) {
            return response()->json(['error' => 'Player not found'], 404);
        }
        
        $totalAnswers = $player->answers()->count();
        $correctAnswers = $player->answers()->where('is_correct', true)->count();
        $accuracy = $totalAnswers > 0 
            ? round(($correctAnswers / $totalAnswers) * 100) 
            : 0;
        
        // Répartition par thème
        $themeStats = DB::table('player_answers')
            ->join('questions', 'player_answers.question_id', '=', 'questions.id')
            ->join('quizzes', 'questions.quiz_id', '=', 'quizzes.id')
            ->join('themes', 'quizzes.theme_id', '=', 'themes.id')
            ->where('player_answers.player_id', $player->id)
            ->select(
                'themes.name',
                DB::raw('COUNT(*) as total_answers'),
                DB::raw('SUM(CASE WHEN player_answers.is_correct THEN 1 ELSE 0 END) as correct_answers')
            )
            ->groupBy('themes.id', 'themes.name')
            ->get();
        
        // Progression temporelle (7 derniers jours)
        $progressionData = DB::table('player_answers')
            ->where('player_id', $player->id)
            ->where('answered_at', '>=', now()->subDays(7))
            ->select(
                DB::raw('DATE(answered_at) as date'),
                DB::raw('SUM(points_earned) as points_earned'),
                DB::raw('COUNT(*) as questions_answered')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        
        return response()->json([
            'player' => [
                'points' => $player->points,
                'current_level' => $player->current_level,
                'last_milestone' => $player->last_milestone,
            ],
            'performance' => [
                'total_answers' => $totalAnswers,
                'correct_answers' => $correctAnswers,
                'wrong_answers' => $totalAnswers - $correctAnswers,
                'accuracy' => $accuracy,
            ],
            'by_theme' => $themeStats,
            'progression_7_days' => $progressionData,
            'gifts_won' => $player->allocations()->count(),
        ]);
    }

    /**
     * Check if player reached a new 100-point milestone and allocate gift(s)
     * Returns array of won gifts with their details
     */
    private function checkAndAllocateMilestoneGift($player)
    {
        $currentMilestone = floor($player->points / 100) * 100;
        $wonGifts = [];
        
        // Check if a new milestone was reached
        if ($currentMilestone > $player->last_milestone && $currentMilestone >= 100) {
            // Update last milestone
            $oldMilestone = $player->last_milestone;
            $player->last_milestone = $currentMilestone;
            $player->save();
            
            // Handle multiple milestones crossed at once
            for ($milestone = $oldMilestone + 100; $milestone <= $currentMilestone; $milestone += 100) {
                $allocation = $this->drawAndAllocateGift($player, $milestone);
                if ($allocation) {
                    $wonGifts[] = [
                        'id' => $allocation->gift->id,
                        'name' => $allocation->gift->name,
                        'description' => $allocation->gift->description,
                        'image_url' => $allocation->gift->image_url,
                        'company_name' => $allocation->gift->company_name,
                        'milestone' => $milestone
                    ];
                }
            }
        }
        
        return $wonGifts;
    }

    /**
     * Draw a random gift and allocate it to the player
     */
    private function drawAndAllocateGift($player, $milestone)
    {
        // Get available gifts for this player
        $availableGifts = Gift::where(function($query) use ($player) {
            // Filter by zone if player has one
            if ($player->zone_id) {
                $query->whereJsonContains('metadata->zones', $player->zone_id)
                      ->orWhereJsonLength('metadata->zones', 0)
                      ->orWhereNull('metadata');
            }
        })
        ->where(function($query) {
            // Filter by date validity
            $today = now()->toDateString();
            $query->where(function($q) use ($today) {
                $q->whereNull('start_date')
                  ->orWhere('start_date', '<=', $today);
            })
            ->where(function($q) use ($today) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', $today);
            });
        })
        ->get();
        
        // Filter gifts that still have available quantity
        $eligibleGifts = $availableGifts->filter(function($gift) {
            $allocatedCount = $gift->allocations()->count();
            return $allocatedCount < $gift->total_quantity;
        });
        
        if ($eligibleGifts->isEmpty()) {
            // No gifts available - log warning
            Log::warning("No gifts available for player {$player->id} at milestone {$milestone}");
            return null;
        }
        
        // Random draw
        $selectedGift = $eligibleGifts->random();
        
        // Create allocation
        $allocation = Allocation::create([
            'gift_id' => $selectedGift->id,
            'player_id' => $player->id,
            'allocated_at' => now(),
            'status' => 'PENDING'
        ]);
        
        // Load the gift relationship
        $allocation->load('gift');
        
        // Send email notification
        $this->sendGiftNotificationEmail($player, $selectedGift, $milestone);
        
        Log::info("Gift allocated to player {$player->id}: {$selectedGift->name} at milestone {$milestone}");
        
        return $allocation;
    }

    /**
     * Send email notification when a gift is won
     */
    private function sendGiftNotificationEmail($player, $gift, $milestone)
    {
        try {
            $user = $player->user;
            
            // Construire l'URL de la page des cadeaux
            $giftsUrl = config('app.frontend_url', 'http://localhost:3000') . '/gifts';
            
            // Utiliser l'EmailService pour envoyer via le template GIFT_WON
            $emailService = app(\App\Services\EmailService::class);
            $emailService->sendGiftWonEmail(
                $user->email,
                $user->name ?? 'Joueur', // prénom
                '', // nom (si disponible)
                $gift->name,
                $gift->description ?? 'Vous avez gagné un cadeau !',
                $giftsUrl
            );
            
            Log::info("Gift won email sent to {$user->email} for gift: {$gift->name} at milestone {$milestone}");
            
        } catch (\Exception $e) {
            Log::error("Failed to send gift notification email: " . $e->getMessage());
        }
    }
}
