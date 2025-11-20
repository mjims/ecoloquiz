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
        $levelsData = Level::orderBy('level_number')->get();

        // Statistics by level
        $levelStats = [];
        foreach ($levelsData as $level) {
            // Skip level if filters are applied and this level is not selected
            if (!empty($levels) && !in_array('all', $levels) && !in_array($level->id, $levels)) {
                continue;
            }

            $levelPlayersQuery = (clone $playersQuery)->where('current_level', $level->level_number);
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

            // Average time on game (simulated for now - would need session tracking)
            // For now, we'll use a placeholder based on points or last_played
            $avgTime = $levelPlayersQuery->avg(
                DB::raw('TIMESTAMPDIFF(MINUTE, created_at, COALESCE(last_played, NOW()))')
            ) ?? 0;
            $avgTime = round($avgTime);

            $levelStats[] = [
                'level' => $level->level_number,
                'level_name' => $level->name,
                'level_id' => $level->id,
                'percent_subscribers' => $percentSubscribers,
                'percent_gift_winners' => $percentGiftWinners,
                'avg_time_minutes' => $avgTime > 0 ? $avgTime : rand(25, 40), // Temporary random for demo
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
        $themes = Theme::select('id', 'name')->orderBy('name')->get();
        $levels = Level::select('id', 'name', 'level_number')->orderBy('level_number')->get();

        return response()->json([
            'zones' => $zones,
            'themes' => $themes,
            'levels' => $levels,
        ]);
    }
}
