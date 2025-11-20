<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ZoneController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/zones",
     *     tags={"Zones"},
     *     summary="Get all zones",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="List of zones"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $perPage = $validated['per_page'] ?? 15;

        $zones = Zone::with(['parent'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($zones);
    }

    /**
     * @OA\Get(
     *     path="/api/zones/{id}",
     *     tags={"Zones"},
     *     summary="Get a specific zone",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Zone ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\Response(response=200, description="Zone details"),
     *     @OA\Response(response=404, description="Zone not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show($id)
    {
        $zone = Zone::with(['parent', 'children'])->findOrFail($id);

        return response()->json(['zone' => $zone]);
    }

    /**
     * @OA\Post(
     *     path="/api/zones",
     *     tags={"Zones"},
     *     summary="Create a new zone",
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "type"},
     *             @OA\Property(property="name", type="string", example="Île-de-France"),
     *             @OA\Property(property="type", type="string", example="REGION"),
     *             @OA\Property(property="code_postal", type="string", example="75001"),
     *             @OA\Property(property="parent_zone_id", type="string", format="uuid"),
     *             @OA\Property(property="metadata", type="object")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Zone created successfully"),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:REGION,DEPT,VILLE,CODE_POSTAL,ENTREPRISE',
            'code_postal' => 'nullable|string|max:10',
            'parent_zone_id' => 'nullable|uuid|exists:zones,id',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation error',
                'messages' => $validator->errors(),
            ], 422);
        }

        $zone = Zone::create($validator->validated());
        $zone->load('parent');

        return response()->json([
            'zone' => $zone,
            'message' => 'Zone created successfully',
        ], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/zones/{id}",
     *     tags={"Zones"},
     *     summary="Update a zone",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Zone ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="type", type="string"),
     *             @OA\Property(property="code_postal", type="string"),
     *             @OA\Property(property="parent_zone_id", type="string", format="uuid"),
     *             @OA\Property(property="metadata", type="object")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Zone updated successfully"),
     *     @OA\Response(response=404, description="Zone not found"),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function update(Request $request, $id)
    {
        $zone = Zone::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|in:REGION,DEPT,VILLE,CODE_POSTAL,ENTREPRISE',
            'code_postal' => 'nullable|string|max:10',
            'parent_zone_id' => 'nullable|uuid|exists:zones,id',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation error',
                'messages' => $validator->errors(),
            ], 422);
        }

        $zone->update($validator->validated());
        $zone->load('parent');

        return response()->json([
            'zone' => $zone,
            'message' => 'Zone updated successfully',
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/zones/{id}",
     *     tags={"Zones"},
     *     summary="Delete a zone",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Zone ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\Response(response=200, description="Zone deleted successfully"),
     *     @OA\Response(response=404, description="Zone not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy($id)
    {
        $zone = Zone::findOrFail($id);
        $zone->delete();

        return response()->json([
            'message' => 'Zone deleted successfully',
        ]);
    }
}
