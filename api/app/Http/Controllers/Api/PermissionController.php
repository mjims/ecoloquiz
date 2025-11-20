<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StorePermissionRequest;
use App\Http\Requests\Api\UpdatePermissionRequest;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PermissionController extends Controller
{
    /**
     * Get all permissions.
     *
     * @OA\Get(
     *   path="/api/permissions",
     *   tags={"Permissions"},
     *   summary="Get all permissions",
     *   description="Retrieve a list of all permissions. Requires permissions.view or permissions.edit permission",
     *   security={{"bearerAuth":{}}},
     *
     *   @OA\Response(
     *     response=200,
     *     description="Permissions retrieved successfully",
     *
     *     @OA\JsonContent(type="array", @OA\Items(
     *
     *         @OA\Property(property="id", type="string", format="uuid"),
     *         @OA\Property(property="name", type="string", example="users.view"),
     *         @OA\Property(property="description", type="string", example="Voir les utilisateurs"),
     *         @OA\Property(property="created_at", type="string", format="date-time"),
     *         @OA\Property(property="updated_at", type="string", format="date-time")
     *     ))
     *   ),
     *
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function index(): AnonymousResourceCollection
    {
        $permissions = Permission::query()
            ->orderBy('name')
            ->get();

        return PermissionResource::collection($permissions);
    }

    /**
     * Create a new permission.
     *
     * @OA\Post(
     *   path="/api/permissions",
     *   tags={"Permissions"},
     *   summary="Create a new permission",
     *   description="Create a new permission. Requires permissions.create permission",
     *   security={{"bearerAuth":{}}},
     *
     *   @OA\RequestBody(
     *     required=true,
     *
     *     @OA\JsonContent(
     *       required={"name"},
     *
     *       @OA\Property(property="name", type="string", example="products.view"),
     *       @OA\Property(property="description", type="string", example="Voir les produits")
     *     )
     *   ),
     *
     *   @OA\Response(
     *     response=201,
     *     description="Permission created successfully",
     *
     *     @OA\JsonContent(
     *
     *       @OA\Property(property="message", type="string"),
     *       @OA\Property(property="data", type="object",
     *         @OA\Property(property="id", type="string", format="uuid"),
     *         @OA\Property(property="name", type="string"),
     *         @OA\Property(property="description", type="string")
     *       )
     *     )
     *   ),
     *
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function store(StorePermissionRequest $request): JsonResponse
    {
        $permission = Permission::create($request->validated());

        return response()->json([
            'message' => 'Permission créée avec succès.',
            'data' => new PermissionResource($permission),
        ], 201);
    }

    /**
     * Get a specific permission.
     *
     * @OA\Get(
     *   path="/api/permissions/{id}",
     *   tags={"Permissions"},
     *   summary="Get a specific permission",
     *   description="Retrieve details of a specific permission. Requires permissions.view or permissions.edit permission",
     *   security={{"bearerAuth":{}}},
     *
     *   @OA\Parameter(
     *     name="id",
     *     in="path",
     *     required=true,
     *
     *     @OA\Schema(type="string", format="uuid")
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Permission retrieved successfully",
     *
     *     @OA\JsonContent(
     *
     *       @OA\Property(property="id", type="string", format="uuid"),
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="description", type="string"),
     *       @OA\Property(property="created_at", type="string", format="date-time"),
     *       @OA\Property(property="updated_at", type="string", format="date-time")
     *     )
     *   ),
     *
     *   @OA\Response(response=404, description="Permission not found"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function show(Permission $permission): PermissionResource
    {
        return new PermissionResource($permission);
    }

    /**
     * Update a permission.
     *
     * @OA\Put(
     *   path="/api/permissions/{id}",
     *   tags={"Permissions"},
     *   summary="Update a permission",
     *   description="Update an existing permission. Requires permissions.edit permission",
     *   security={{"bearerAuth":{}}},
     *
     *   @OA\Parameter(
     *     name="id",
     *     in="path",
     *     required=true,
     *
     *     @OA\Schema(type="string", format="uuid")
     *   ),
     *
     *   @OA\RequestBody(
     *     required=true,
     *
     *     @OA\JsonContent(
     *       required={"name"},
     *
     *       @OA\Property(property="name", type="string", example="products.edit"),
     *       @OA\Property(property="description", type="string", example="Modifier les produits")
     *     )
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Permission updated successfully",
     *
     *     @OA\JsonContent(
     *
     *       @OA\Property(property="message", type="string"),
     *       @OA\Property(property="data", type="object")
     *     )
     *   ),
     *
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=404, description="Permission not found"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function update(UpdatePermissionRequest $request, Permission $permission): JsonResponse
    {
        $permission->update($request->validated());

        return response()->json([
            'message' => 'Permission mise à jour avec succès.',
            'data' => new PermissionResource($permission),
        ]);
    }

    /**
     * Delete a permission.
     *
     * @OA\Delete(
     *   path="/api/permissions/{id}",
     *   tags={"Permissions"},
     *   summary="Delete a permission",
     *   description="Delete an existing permission. Requires permissions.delete permission",
     *   security={{"bearerAuth":{}}},
     *
     *   @OA\Parameter(
     *     name="id",
     *     in="path",
     *     required=true,
     *
     *     @OA\Schema(type="string", format="uuid")
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Permission deleted successfully",
     *
     *     @OA\JsonContent(
     *
     *       @OA\Property(property="message", type="string")
     *     )
     *   ),
     *
     *   @OA\Response(response=404, description="Permission not found"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function destroy(Permission $permission): JsonResponse
    {
        $permission->delete();

        return response()->json([
            'message' => 'Permission supprimée avec succès.',
        ], 200);
    }
}
