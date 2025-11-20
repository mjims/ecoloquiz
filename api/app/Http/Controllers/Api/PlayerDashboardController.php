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
}
