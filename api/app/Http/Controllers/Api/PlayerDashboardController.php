<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Level;
use App\Models\Player;
use App\Models\Quiz;
use Illuminate\Http\Request;

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

        // Get the first level (Niveau 1)
        $firstLevel = Level::orderBy('order', 'asc')->first();

        if (!$firstLevel) {
            return response()->json(['error' => 'No levels available'], 404);
        }

        // Get a random quiz from level 1
        $quiz = Quiz::with(['theme', 'level'])
            ->where('level_id', $firstLevel->id)
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

        // Get all levels
        $levels = Level::orderBy('order', 'asc')->get();

        // TODO: Calculate real progression based on quiz attempts
        // For now, we'll return mock data based on player points

        // Simple logic: every 100 points = 1 quiz completed
        $quizCompleted = (int) floor($player->points / 100);

        // Calculate progression for each level
        $levelProgress = [];
        foreach ($levels as $index => $level) {
            $levelNumber = $index + 1;

            // Mock calculation:
            // Level 1: based on points 0-500 (0-100%)
            // Level 2: based on points 500-1500 (0-100%)
            // Level 3: based on points 1500+ (0-100%)

            $minPoints = $index * 500;
            $maxPoints = ($index + 1) * 500;

            if ($player->points >= $maxPoints) {
                $percentage = 100;
            } elseif ($player->points <= $minPoints) {
                $percentage = 0;
            } else {
                $percentage = (int) (($player->points - $minPoints) / ($maxPoints - $minPoints) * 100);
            }

            $levelProgress[] = [
                'level' => $levelNumber,
                'name' => $level->name,
                'percentage' => $percentage,
                'stars' => $levelNumber // Number of stars = level number
            ];
        }

        return response()->json([
            'quizCompleted' => $quizCompleted,
            'levels' => $levelProgress
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
     * Validate a single answer
     *
     * @OA\Post(
     *   path="/api/player/quiz/{quizId}/validate-answer",
     *   tags={"Player Dashboard"},
     *   summary="Validate a single quiz answer",
     *   description="Validates a single answer and returns feedback",
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
     *       @OA\Property(property="answer_id", type="string", format="uuid")
     *     )
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Answer validated successfully",
     *     @OA\JsonContent(
     *       @OA\Property(property="is_correct", type="boolean", example=true),
     *       @OA\Property(property="points_earned", type="integer", example=5),
     *       @OA\Property(property="correct_answer_id", type="string", format="uuid"),
     *       @OA\Property(property="correct_answer_text", type="string"),
     *       @OA\Property(property="explanation", type="string")
     *     )
     *   ),
     *   @OA\Response(response=404, description="Question or answer not found"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function validateAnswer(Request $request, $quizId)
    {
        $questionId = $request->input('question_id');
        $answerId = $request->input('answer_id');

        // Find the question
        $question = Question::with('options')
            ->where('id', $questionId)
            ->where('quiz_id', $quizId)
            ->firstOrFail();

        // Find the correct option
        $correctOption = $question->options->where('is_correct', true)->first();

        if (!$correctOption) {
            return response()->json(['error' => 'No correct answer found for this question'], 400);
        }

        // Check if user's answer is correct
        $isCorrect = $answerId === $correctOption->id;
        $pointsEarned = $isCorrect ? 5 : -10;

        return response()->json([
            'is_correct' => $isCorrect,
            'points_earned' => $pointsEarned,
            'correct_answer_id' => $correctOption->id,
            'correct_answer_text' => $correctOption->text,
            'explanation' => $question->explanation
        ]);
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
}
