<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use App\Models\User;
use App\Models\Gift;
use App\Models\Allocation;
use App\Models\Level;
use App\Models\Zone;
use App\Models\Theme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatsController extends Controller
{
    /**
     * Get dashboard overview statistics
     */
    public function dashboard()
    {
        $totalPlayers = Player::count();
        $totalActivePlayers = Player::whereNotNull('last_played')
            ->where('last_played', '>=', now()->subDays(30))
            ->count();
        $totalQuestionsAnswered = DB::table('player_answers')->count();
        $totalGiftsAllocated = Allocation::count();
        $totalPointsEarned = Player::sum('points');
        $averageScore = round(Player::avg('points'));
        $growthLastMonth = Player::where('created_at', '>=', now()->subMonth())->count();

        return response()->json([
            'total_players' => $totalPlayers,
            'total_active_players' => $totalActivePlayers,
            'total_questions_answered' => $totalQuestionsAnswered,
            'total_gifts_allocated' => $totalGiftsAllocated,
            'total_points_earned' => $totalPointsEarned,
            'average_score' => $averageScore,
            'growth_last_month' => $growthLastMonth,
        ]);
    }

    /**
     * Get statistics with filters
     */
    public function index(Request $request)
    {
        $zoneId = $request->input('zone_id');
        $themeId = $request->input('theme_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $levels = $request->input('levels', []); // Array of level IDs or 'all'

        // Base query for players
        $playersQuery = Player::query();

        // Apply zone filter
        if ($zoneId && $zoneId !== 'all') {
            $playersQuery->where('zone_id', $zoneId);
        }

        // Apply date filter on creation
        if ($startDate) {
            $playersQuery->where('created_at', '>=', Carbon::parse($startDate)->startOfDay());
        }
        if ($endDate) {
            $playersQuery->where('created_at', '<=', Carbon::parse($endDate)->endOfDay());
        }

        // Total subscriptions (abonnements)
        $totalSubscriptions = $playersQuery->count();

        // Connexions (users who have played - based on last_played)
        $totalConnections = (clone $playersQuery)->whereNotNull('last_played')->count();

        // Participation rate
        $participationRate = $totalSubscriptions > 0
            ? round(($totalConnections / $totalSubscriptions) * 100)
            : 0;

        // Get all levels
        $levelsData = Level::orderBy('order')->get();

        // Statistics by level
        $levelStats = [];
        foreach ($levelsData as $level) {
            // Skip level if filters are applied and this level is not selected
            if (!empty($levels) && !in_array('all', $levels) && !in_array($level->id, $levels)) {
                continue;
            }

            $levelPlayersQuery = (clone $playersQuery)->whereHas('theme_progress', function($q) use ($level) {
                $q->where('current_level_id', $level->id);
            });
            $levelPlayersCount = $levelPlayersQuery->count();

            // % of players at this level
            $percentSubscribers = $totalSubscriptions > 0
                ? round(($levelPlayersCount / $totalSubscriptions) * 100)
                : 0;

            // Get players with gifts allocated for this level
            $playersWithGifts = $levelPlayersQuery->whereHas('allocations', function ($query) use ($level) {
                $query->whereHas('gift', function ($q) use ($level) {
                    $q->where('level_id', $level->id);
                });
            })->count();

            // % gain cadeau (% of players who got a gift at this level)
            $percentGiftWinners = $levelPlayersCount > 0
                ? round(($playersWithGifts / $levelPlayersCount) * 100)
                : 0;

            // Average time on game (REAL calculation based on timestamps)
            // Calculate time between first and last answer for each player
            $playerIds = $levelPlayersQuery->pluck('id')->toArray();
            
            if (count($playerIds) > 0) {
                $avgPlayTimeSeconds = DB::table('player_answers')
                    ->whereIn('player_id', $playerIds)
                    ->selectRaw('
                        player_id, 
                        TIMESTAMPDIFF(SECOND, MIN(created_at), MAX(created_at)) as seconds_played
                    ')
                    ->groupBy('player_id')
                    ->get()
                    ->avg('seconds_played') ?? 0;
                
                // Convert to minutes and round
                $avgTime = round($avgPlayTimeSeconds / 60);
            } else {
                $avgTime = 0;
            }

            $levelStats[] = [
                'level' => $level->order,
                'level_name' => $level->name,
                'level_id' => $level->id,
                'percent_subscribers' => $percentSubscribers,
                'percent_gift_winners' => $percentGiftWinners,
                'avg_time_minutes' => $avgTime,
            ];
        }

        // New partners (gifts created in the period)
        $newPartnersQuery = Gift::query();
        if ($startDate) {
            $newPartnersQuery->where('created_at', '>=', Carbon::parse($startDate)->startOfDay());
        }
        if ($endDate) {
            $newPartnersQuery->where('created_at', '<=', Carbon::parse($endDate)->endOfDay());
        }
        $newPartners = $newPartnersQuery->count();

        return response()->json([
            'total_subscriptions' => $totalSubscriptions,
            'total_connections' => $totalConnections,
            'participation_rate' => $participationRate,
            'level_stats' => $levelStats,
            'new_partners' => $newPartners,
        ]);
    }

    /**
     * Get available filters data
     */
    public function filters()
    {
        $zones = Zone::select('id', 'name', 'type')->orderBy('name')->get();
        $themes = Theme::select('id', 'title as name')->orderBy('title')->get();
        $levels = Level::select('id', 'name', 'order')->orderBy('order')->get();

        return response()->json([
            'zones' => $zones,
            'themes' => $themes,
            'levels' => $levels,
        ]);
    }

    /**
     * Get question performance statistics
     */
    public function questionPerformance()
    {
        $questions = DB::table('questions')
            ->leftJoin('player_answers', 'questions.id', '=', 'player_answers.question_id')
            ->select(
                'questions.id as question_id',
                'questions.text as question_text',
                DB::raw('COUNT(player_answers.id) as total_attempts'),
                DB::raw('SUM(CASE WHEN player_answers.is_correct THEN 1 ELSE 0 END) as correct_answers')
            )
            ->whereNull('questions.deleted_at')
            ->groupBy('questions.id', 'questions.text')
            ->having('total_attempts', '>', 0)
            ->get();

        $stats = $questions->map(function($question) {
            $total = $question->total_attempts;
            $correct = $question->correct_answers ?? 0;
            $successRate = $total > 0 ? round(($correct / $total) * 100) : 0;
            
            return [
                'question_id' => $question->question_id,
                'question_text' => $question->question_text,
                'total_attempts' => $total,
                'success_rate' => $successRate,
                'difficulty' => $successRate > 70 ? 'Facile' : ($successRate > 40 ? 'Moyen' : 'Difficile'),
            ];
        });

        return response()->json($stats);
    }
}
