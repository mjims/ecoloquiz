<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Level;

class LevelController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/levels",
     *     tags={"Levels"},
     *     summary="Get all levels",
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(response=200, description="List of levels"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index()
    {
        $levels = Level::orderBy('order', 'asc')->get();
        return response()->json($levels);
    }
}
