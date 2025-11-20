<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    /**
     * Get paginated list of players
     *
     * @OA\Get(
     *   path="/api/players",
     *   tags={"Players"},
     *   summary="Get paginated list of players",
     *   description="Returns a paginated list of all players with their user information, zone, and statistics",
     *   security={{"token":{}}},
     *
     *   @OA\Parameter(
     *     name="page",
     *     in="query",
     *     description="Page number",
     *     required=false,
     *
     *     @OA\Schema(type="integer", example=1)
     *   ),
     *
     *   @OA\Parameter(
     *     name="per_page",
     *     in="query",
     *     description="Number of items per page (max 100)",
     *     required=false,
     *
     *     @OA\Schema(type="integer", example=15)
     *   ),
     *
     *   @OA\Parameter(
     *     name="sort_by",
     *     in="query",
     *     description="Field to sort by",
     *     required=false,
     *
     *     @OA\Schema(type="string", enum={"points", "created_at", "last_played"}, example="points")
     *   ),
     *
     *   @OA\Parameter(
     *     name="sort_order",
     *     in="query",
     *     description="Sort order",
     *     required=false,
     *
     *     @OA\Schema(type="string", enum={"asc", "desc"}, example="desc")
     *   ),
     *
     *   @OA\Parameter(
     *     name="level",
     *     in="query",
     *     description="Filter by current level",
     *     required=false,
     *
     *     @OA\Schema(type="string", example="DECOUVERTE")
     *   ),
     *
     *   @OA\Parameter(
     *     name="zone_id",
     *     in="query",
     *     description="Filter by zone ID",
     *     required=false,
     *
     *     @OA\Schema(type="string", format="uuid")
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Players retrieved successfully",
     *
     *     @OA\JsonContent(
     *
     *       @OA\Property(property="current_page", type="integer", example=1),
     *       @OA\Property(property="data", type="array",
     *
     *         @OA\Items(
     *
     *           @OA\Property(property="id", type="string", format="uuid"),
     *           @OA\Property(property="user_id", type="string", format="uuid"),
     *           @OA\Property(property="points", type="integer", example=150),
     *           @OA\Property(property="current_level", type="string", example="DECOUVERTE"),
     *           @OA\Property(property="last_played", type="string", format="date-time", nullable=true),
     *           @OA\Property(property="zone_id", type="string", format="uuid", nullable=true),
     *           @OA\Property(property="created_at", type="string", format="date-time"),
     *           @OA\Property(property="updated_at", type="string", format="date-time"),
     *           @OA\Property(property="user", type="object",
     *             @OA\Property(property="id", type="string", format="uuid"),
     *             @OA\Property(property="email", type="string"),
     *             @OA\Property(property="first_name", type="string"),
     *             @OA\Property(property="last_name", type="string"),
     *             @OA\Property(property="status", type="string")
     *           ),
     *           @OA\Property(property="zone", type="object", nullable=true,
     *             @OA\Property(property="id", type="string", format="uuid"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="code", type="string")
     *           )
     *         )
     *       ),
     *       @OA\Property(property="first_page_url", type="string", example="http://localhost:8000/api/players?page=1"),
     *       @OA\Property(property="from", type="integer", example=1),
     *       @OA\Property(property="last_page", type="integer", example=5),
     *       @OA\Property(property="last_page_url", type="string", example="http://localhost:8000/api/players?page=5"),
     *       @OA\Property(property="links", type="array",
     *
     *         @OA\Items(
     *
     *           @OA\Property(property="url", type="string", nullable=true),
     *           @OA\Property(property="label", type="string"),
     *           @OA\Property(property="active", type="boolean")
     *         )
     *       ),
     *       @OA\Property(property="next_page_url", type="string", nullable=true, example="http://localhost:8000/api/players?page=2"),
     *       @OA\Property(property="path", type="string", example="http://localhost:8000/api/players"),
     *       @OA\Property(property="per_page", type="integer", example=15),
     *       @OA\Property(property="prev_page_url", type="string", nullable=true),
     *       @OA\Property(property="to", type="integer", example=15),
     *       @OA\Property(property="total", type="integer", example=67)
     *     )
     *   ),
     *
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function index(Request $request)
    {
        // Validation des paramètres de requête
        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|in:points,created_at,last_played',
            'sort_order' => 'nullable|in:asc,desc',
            'level' => 'nullable|string',
            'zone_id' => 'nullable|uuid',
        ]);

        // Paramètres de pagination
        $perPage = $validated['per_page'] ?? 15;
        $sortBy = $validated['sort_by'] ?? 'created_at';
        $sortOrder = $validated['sort_order'] ?? 'desc';

        // Construction de la requête
        $query = Player::with(['user:id,email,first_name,last_name,status', 'zone:id,name,code']);

        // Filtres optionnels
        if (isset($validated['level'])) {
            $query->where('current_level', $validated['level']);
        }

        if (isset($validated['zone_id'])) {
            $query->where('zone_id', $validated['zone_id']);
        }

        // Tri
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $players = $query->paginate($perPage);

        return response()->json($players);
    }

    /**
     * Get a specific player by ID
     *
     * @OA\Get(
     *   path="/api/players/{id}",
     *   tags={"Players"},
     *   summary="Get a specific player",
     *   description="Returns detailed information about a specific player",
     *   security={{"token":{}}},
     *
     *   @OA\Parameter(
     *     name="id",
     *     in="path",
     *     description="Player ID",
     *     required=true,
     *
     *     @OA\Schema(type="string", format="uuid")
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Player retrieved successfully",
     *
     *     @OA\JsonContent(
     *
     *       @OA\Property(property="player", type="object",
     *         @OA\Property(property="id", type="string", format="uuid"),
     *         @OA\Property(property="user_id", type="string", format="uuid"),
     *         @OA\Property(property="points", type="integer", example=150),
     *         @OA\Property(property="current_level", type="string", example="DECOUVERTE"),
     *         @OA\Property(property="last_played", type="string", format="date-time", nullable=true),
     *         @OA\Property(property="zone_id", type="string", format="uuid", nullable=true),
     *         @OA\Property(property="created_at", type="string", format="date-time"),
     *         @OA\Property(property="updated_at", type="string", format="date-time"),
     *         @OA\Property(property="user", type="object",
     *           @OA\Property(property="id", type="string", format="uuid"),
     *           @OA\Property(property="email", type="string"),
     *           @OA\Property(property="first_name", type="string"),
     *           @OA\Property(property="last_name", type="string"),
     *           @OA\Property(property="status", type="string")
     *         ),
     *         @OA\Property(property="zone", type="object", nullable=true,
     *           @OA\Property(property="id", type="string", format="uuid"),
     *           @OA\Property(property="name", type="string"),
     *           @OA\Property(property="code", type="string")
     *         ),
     *         @OA\Property(property="allocations", type="array",
     *
     *           @OA\Items(type="object")
     *         )
     *       )
     *     )
     *   ),
     *
     *   @OA\Response(response=404, description="Player not found"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show($id)
    {
        $player = Player::with(['user', 'zone', 'allocations'])->findOrFail($id);

        return response()->json(['player' => $player]);
    }
}
