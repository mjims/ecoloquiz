<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreRoleRequest;
use App\Http\Requests\Api\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RoleController extends Controller
{
    /**
     * Get all roles.
     *
     * @OA\Get(
     *   path="/api/roles",
     *   tags={"Roles"},
     *   summary="Get all roles with permissions",
     *   description="Retrieve a list of all roles. Requires roles.view or roles.edit permission",
     *   security={{"bearerAuth":{}}},
     *
     *   @OA\Response(
     *     response=200,
     *     description="Roles retrieved successfully",
     *
     *     @OA\JsonContent(type="array", @OA\Items(
     *
     *         @OA\Property(property="id", type="string", format="uuid"),
     *         @OA\Property(property="name", type="string", example="admin"),
     *         @OA\Property(property="description", type="string", example="Administrator role"),
     *         @OA\Property(property="permissions", type="array", @OA\Items(type="object")),
     *         @OA\Property(property="permissions_count", type="integer"),
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
        $roles = Role::query()
            ->withCount('permissions')
            ->with('permissions')
            ->orderBy('name')
            ->get();

        return RoleResource::collection($roles);
    }

    /**
     * Create a new role.
     *
     * @OA\Post(
     *   path="/api/roles",
     *   tags={"Roles"},
     *   summary="Create a new role",
     *   description="Create a new role with permissions. Requires roles.create permission",
     *   security={{"bearerAuth":{}}},
     *
     *   @OA\RequestBody(
     *     required=true,
     *
     *     @OA\JsonContent(
     *       required={"name"},
     *
     *       @OA\Property(property="name", type="string", example="moderator"),
     *       @OA\Property(property="description", type="string", example="Moderator role"),
     *       @OA\Property(property="permissions", type="array", @OA\Items(type="string", format="uuid"))
     *     )
     *   ),
     *
     *   @OA\Response(
     *     response=201,
     *     description="Role created successfully",
     *
     *     @OA\JsonContent(
     *
     *       @OA\Property(property="message", type="string"),
     *       @OA\Property(property="data", type="object")
     *     )
     *   ),
     *
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $data = $request->validated();

        $role = Role::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        if (! empty($data['permissions'])) {
            $role->permissions()->sync($data['permissions']);
        }

        $role->load('permissions');

        return response()->json([
            'message' => 'Rôle créé avec succès.',
            'data' => new RoleResource($role),
        ], 201);
    }

    /**
     * Get a specific role.
     *
     * @OA\Get(
     *   path="/api/roles/{id}",
     *   tags={"Roles"},
     *   summary="Get a specific role with permissions",
     *   description="Retrieve details of a specific role. Requires roles.view or roles.edit permission",
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
     *     description="Role retrieved successfully",
     *
     *     @OA\JsonContent(
     *
     *       @OA\Property(property="id", type="string", format="uuid"),
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="description", type="string"),
     *       @OA\Property(property="permissions", type="array", @OA\Items(type="object"))
     *     )
     *   ),
     *
     *   @OA\Response(response=404, description="Role not found"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function show(Role $role): RoleResource
    {
        $role->load('permissions');

        return new RoleResource($role);
    }

    /**
     * Update a role.
     *
     * @OA\Put(
     *   path="/api/roles/{id}",
     *   tags={"Roles"},
     *   summary="Update a role",
     *   description="Update an existing role and its permissions. Requires roles.edit permission",
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
     *       @OA\Property(property="name", type="string", example="moderator"),
     *       @OA\Property(property="description", type="string", example="Updated description"),
     *       @OA\Property(property="permissions", type="array", @OA\Items(type="string", format="uuid"))
     *     )
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Role updated successfully",
     *
     *     @OA\JsonContent(
     *
     *       @OA\Property(property="message", type="string"),
     *       @OA\Property(property="data", type="object")
     *     )
     *   ),
     *
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=404, description="Role not found"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $data = $request->validated();

        $role->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        if (isset($data['permissions'])) {
            $role->permissions()->sync($data['permissions']);
        }

        $role->load('permissions');

        return response()->json([
            'message' => 'Rôle mis à jour avec succès.',
            'data' => new RoleResource($role),
        ]);
    }

    /**
     * Delete a role.
     *
     * @OA\Delete(
     *   path="/api/roles/{id}",
     *   tags={"Roles"},
     *   summary="Delete a role",
     *   description="Delete an existing role. Requires roles.delete permission",
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
     *     description="Role deleted successfully",
     *
     *     @OA\JsonContent(
     *
     *       @OA\Property(property="message", type="string")
     *     )
     *   ),
     *
     *   @OA\Response(response=404, description="Role not found"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function destroy(Role $role): JsonResponse
    {
        $role->delete();

        return response()->json([
            'message' => 'Rôle supprimé avec succès.',
        ], 200);
    }
}
