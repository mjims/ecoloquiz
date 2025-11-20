<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class EmailTypeController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/email-types",
     *     tags={"Email Types"},
     *     summary="Get all email types",
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(response=200, description="List of email types"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index()
    {
        $types = EmailType::with(['emailTemplate'])->orderBy('is_system', 'desc')->orderBy('name')->get();

        return response()->json(['types' => $types]);
    }

    /**
     * @OA\Get(
     *     path="/api/email-types/{id}",
     *     tags={"Email Types"},
     *     summary="Get a specific email type",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Email Type ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\Response(response=200, description="Email type details"),
     *     @OA\Response(response=404, description="Email type not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show($id)
    {
        $type = EmailType::with(['emailTemplate'])->findOrFail($id);

        return response()->json(['type' => $type]);
    }

    /**
     * @OA\Post(
     *     path="/api/email-types",
     *     tags={"Email Types"},
     *     summary="Create a new email type",
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="Newsletter mensuelle"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="is_active", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Email type created successfully"),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation error',
                'messages' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // Générer un code unique à partir du nom
        $data['code'] = Str::upper(Str::slug($data['name'], '_'));

        // S'assurer de l'unicité du code
        $counter = 1;
        $originalCode = $data['code'];
        while (EmailType::where('code', $data['code'])->exists()) {
            $data['code'] = $originalCode . '_' . $counter;
            $counter++;
        }

        // Les types créés manuellement ne sont pas des types système
        $data['is_system'] = false;

        $type = EmailType::create($data);

        return response()->json([
            'type' => $type,
            'message' => 'Email type created successfully',
        ], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/email-types/{id}",
     *     tags={"Email Types"},
     *     summary="Update an email type",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Email Type ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="is_active", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Email type updated successfully"),
     *     @OA\Response(response=404, description="Email type not found"),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function update(Request $request, $id)
    {
        $type = EmailType::findOrFail($id);

        // Ne pas permettre la modification des types système (sauf is_active)
        if ($type->is_system && $request->has('name')) {
            return response()->json([
                'error' => 'Cannot modify system email types',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation error',
                'messages' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // Mettre à jour le code si le nom change (seulement pour les types non-système)
        if (isset($data['name']) && !$type->is_system) {
            $data['code'] = Str::upper(Str::slug($data['name'], '_'));

            // S'assurer de l'unicité du code
            $counter = 1;
            $originalCode = $data['code'];
            while (EmailType::where('code', $data['code'])->where('id', '!=', $id)->exists()) {
                $data['code'] = $originalCode . '_' . $counter;
                $counter++;
            }
        }

        $type->update($data);
        $type->load('emailTemplate');

        return response()->json([
            'type' => $type,
            'message' => 'Email type updated successfully',
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/email-types/{id}",
     *     tags={"Email Types"},
     *     summary="Delete an email type",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Email Type ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\Response(response=200, description="Email type deleted successfully"),
     *     @OA\Response(response=404, description="Email type not found"),
     *     @OA\Response(response=403, description="Cannot delete system types"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy($id)
    {
        $type = EmailType::findOrFail($id);

        // Ne pas permettre la suppression des types système
        if ($type->is_system) {
            return response()->json([
                'error' => 'Cannot delete system email types',
            ], 403);
        }

        $type->delete();

        return response()->json([
            'message' => 'Email type deleted successfully',
        ]);
    }
}
