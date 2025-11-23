<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class GiftController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/gifts",
     *     tags={"Gifts"},
     *     summary="Get all gifts with optional filters",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(name="page", in="query", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="level_id", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="zone_id", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="company_name", in="query", @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="List of gifts"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'level_id' => 'nullable|array',
            'level_id.*' => 'nullable|integer|exists:levels,id',
            'zone_id' => 'nullable|uuid',
            'company_name' => 'nullable|string',
        ]);

        $perPage = $validated['per_page'] ?? 15;

        $query = Gift::with(['level', 'allocations']);

        // Filtre par niveau(x)
        if (!empty($validated['level_id']) && count(array_filter($validated['level_id'])) > 0) {
            $query->whereIn('level_id', array_filter($validated['level_id']));
        }

        // Filtre par entreprise
        if (!empty($validated['company_name'])) {
            $query->where('company_name', 'like', '%' . $validated['company_name'] . '%');
        }

        // Filtre par zone (dans metadata)
        if (!empty($validated['zone_id'])) {
            $query->whereJsonContains('metadata->zones', function($q) use ($validated) {
                return ['zone_id' => $validated['zone_id']];
            });
        }

        $gifts = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Add allocation counts to each gift
        $gifts->getCollection()->transform(function ($gift) {
            $gift->won_count = $gift->won_count;
            $gift->remaining_count = $gift->remaining_count;
            return $gift;
        });

        return response()->json($gifts);
    }

    /**
     * @OA\Get(
     *     path="/api/gifts/next-code",
     *     tags={"Gifts"},
     *     summary="Get next available gift code",
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(response=200, description="Next gift code")
     * )
     */
    public function getNextCode()
    {
        // Get the last gift code that follows the pattern C{number}
        $lastGift = Gift::where('code', 'REGEXP', '^C[0-9]+$')
            ->orderByRaw('CAST(SUBSTRING(code, 2) AS UNSIGNED) DESC')
            ->first();

        $nextNumber = 1;
        if ($lastGift) {
            $currentNumber = intval(substr($lastGift->code, 1));
            $nextNumber = $currentNumber + 1;
        }

        return response()->json(['code' => 'C' . $nextNumber]);
    }

    /**
     * @OA\Get(
     *     path="/api/gifts/{id}",
     *     tags={"Gifts"},
     *     summary="Get a specific gift",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *     @OA\Response(response=200, description="Gift details"),
     *     @OA\Response(response=404, description="Gift not found")
     * )
     */
    public function show($id)
    {
        $gift = Gift::with(['level'])->findOrFail($id);

        return response()->json(['gift' => $gift]);
    }

    /**
     * @OA\Post(
     *     path="/api/gifts",
     *     tags={"Gifts"},
     *     summary="Create a new gift",
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(response=201, description="Gift created successfully"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'nullable|string|max:10|unique:gifts,code',
            'name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'siret' => 'nullable|string|max:14',
            'contact_name' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'level_id' => 'nullable|uuid|exists:levels,id',
            'image_url' => 'nullable|string', // Pas de limite pour supporter base64
            'description' => 'nullable|string',
            'total_quantity' => 'required|integer|min:0',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation error',
                'messages' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // Auto-generate code if not provided
        if (empty($data['code'])) {
            $lastGift = Gift::where('code', 'REGEXP', '^C[0-9]+$')
                ->orderByRaw('CAST(SUBSTRING(code, 2) AS UNSIGNED) DESC')
                ->first();

            $nextNumber = 1;
            if ($lastGift) {
                $currentNumber = intval(substr($lastGift->code, 1));
                $nextNumber = $currentNumber + 1;
            }

            $data['code'] = 'C' . $nextNumber;
        }

        $gift = Gift::create($data);
        $gift->load('level');

        return response()->json([
            'gift' => $gift,
            'message' => 'Gift created successfully',
        ], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/gifts/{id}",
     *     tags={"Gifts"},
     *     summary="Update a gift",
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(response=200, description="Gift updated successfully"),
     *     @OA\Response(response=404, description="Gift not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(Request $request, $id)
    {
        $gift = Gift::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:10|unique:gifts,code,' . $id,
            'name' => 'sometimes|required|string|max:255',
            'company_name' => 'sometimes|required|string|max:255',
            'siret' => 'nullable|string|max:14',
            'contact_name' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'level_id' => 'nullable|uuid|exists:levels,id',
            'image_url' => 'nullable|string', // Pas de limite pour supporter base64
            'description' => 'nullable|string',
            'total_quantity' => 'sometimes|required|integer|min:0',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation error',
                'messages' => $validator->errors(),
            ], 422);
        }

        $gift->update($validator->validated());
        $gift->load('level');

        return response()->json([
            'gift' => $gift,
            'message' => 'Gift updated successfully',
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/gifts/{id}",
     *     tags={"Gifts"},
     *     summary="Delete a gift",
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(response=200, description="Gift deleted successfully"),
     *     @OA\Response(response=404, description="Gift not found")
     * )
     */
    public function destroy($id)
    {
        $gift = Gift::findOrFail($id);
        $gift->delete();

        return response()->json([
            'message' => 'Gift deleted successfully',
        ]);
    }
}
