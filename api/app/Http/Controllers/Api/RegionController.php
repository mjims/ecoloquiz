<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Region;

class RegionController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/regions",
     *     tags={"Regions"},
     *     summary="Get all regions with their departments",
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(response=200, description="List of regions"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index()
    {
        $regions = Region::with('departements')->orderBy('name')->get();

        return response()->json(['regions' => $regions]);
    }

    /**
     * @OA\Get(
     *     path="/api/regions/{id}",
     *     tags={"Regions"},
     *     summary="Get a specific region with its departments",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Region ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Region details"),
     *     @OA\Response(response=404, description="Region not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show($id)
    {
        $region = Region::with('departements')->findOrFail($id);

        return response()->json(['region' => $region]);
    }
}
