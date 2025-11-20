<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\AdminCreateUserRequest;
use App\Models\Admin;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AdminUserController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/admin/users",
     *     tags={"Admin Users"},
     *     summary="Get all admin users",
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
     *     @OA\Response(response=200, description="List of admin users"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $perPage = $validated['per_page'] ?? 15;

        // Récupérer uniquement les utilisateurs avec des rôles admin (qui ont un enregistrement dans la table admins)
        $admins = Admin::with(['user.roles.permissions'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // Transformer les données pour inclure les infos utilisateur
        $admins->getCollection()->transform(function ($admin) {
            return [
                'id' => $admin->id,
                'user_id' => $admin->user_id,
                'email' => $admin->user->email ?? null,
                'first_name' => $admin->user->first_name ?? null,
                'last_name' => $admin->user->last_name ?? null,
                'role' => $admin->role,
                'status' => $admin->user->status ?? null,
                'created_at' => $admin->created_at,
                'updated_at' => $admin->updated_at,
            ];
        });

        return response()->json($admins);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/users/{id}",
     *     tags={"Admin Users"},
     *     summary="Get a specific admin user",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Admin ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\Response(response=200, description="Admin user details"),
     *     @OA\Response(response=404, description="Admin not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show($id)
    {
        $admin = Admin::with(['user.roles.permissions'])->findOrFail($id);

        // Collecter toutes les permissions depuis les rôles
        $permissions = [];
        if ($admin->user && $admin->user->roles) {
            foreach ($admin->user->roles as $role) {
                foreach ($role->permissions as $permission) {
                    if (!isset($permissions[$permission->id])) {
                        $permissions[$permission->id] = [
                            'id' => $permission->id,
                            'name' => $permission->name,
                            'description' => $permission->description,
                        ];
                    }
                }
            }
        }

        return response()->json([
            'admin' => [
                'id' => $admin->id,
                'user_id' => $admin->user_id,
                'email' => $admin->user->email ?? null,
                'first_name' => $admin->user->first_name ?? null,
                'last_name' => $admin->user->last_name ?? null,
                'role' => $admin->role,
                'status' => $admin->user->status ?? null,
                'created_at' => $admin->created_at,
                'updated_at' => $admin->updated_at,
                'roles' => $admin->user->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'description' => $role->description,
                    ];
                }),
                'permissions' => array_values($permissions),
            ]
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/users",
     *     tags={"Admin Users"},
     *     summary="Create a new admin user",
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "password", "first_name", "last_name", "role"},
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password"),
     *             @OA\Property(property="first_name", type="string"),
     *             @OA\Property(property="last_name", type="string"),
     *             @OA\Property(property="role", type="string", enum={"superadmin", "partner_mayor", "partner_sponsor"}),
     *             @OA\Property(property="status", type="string", enum={"ACTIVE", "INACTIVE"})
     *         )
     *     ),
     *     @OA\Response(response=201, description="Admin user created successfully"),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(AdminCreateUserRequest $request)
    {
        $data = $request->validated();

        // Only admin can call (middleware ensures)
        // Create user
        $user = User::create([
            'id' => $data['id'] ?? null,
            'email' => $data['email'],
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'password' => Hash::make($data['password']),
            'status' => $data['status'] ?? 'ACTIVE',
        ]);

        // attach role
        if (! empty($data['role'])) {
            $role = \App\Models\Role::where('name', $data['role'])->first();
            if ($role) {
                $user->roles()->attach($role->id);
            }
        }

        // If admin-type requested, create admins entry
        if (in_array($data['role'] ?? null, ['superadmin', 'partner_mayor', 'partner_sponsor'])) {
            Admin::create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'role' => $data['role'],
            ]);
        } else {
            // create player profile if normal player
            \App\Models\Player::create([
                'user_id' => $user->id,
                'points' => 0,
                'current_level' => 'DECOUVERTE',
            ]);
        }

        return response()->json(['user' => $user], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/admin/users/{id}",
     *     tags={"Admin Users"},
     *     summary="Update an admin user",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Admin ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="first_name", type="string"),
     *             @OA\Property(property="last_name", type="string"),
     *             @OA\Property(property="status", type="string", enum={"ACTIVE", "INACTIVE"})
     *         )
     *     ),
     *     @OA\Response(response=200, description="Admin user updated successfully"),
     *     @OA\Response(response=404, description="Admin not found"),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function update(Request $request, $id)
    {
        $admin = Admin::findOrFail($id);
        $user = $admin->user;

        $validator = Validator::make($request->all(), [
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|string|in:ACTIVE,INACTIVE',
            'password' => 'sometimes|nullable|string|min:8|confirmed',
            'password_confirmation' => 'sometimes|nullable|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation error',
                'messages' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // Remove password_confirmation from data (not a User field)
        unset($data['password_confirmation']);

        // Hash password if provided
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);
        $user->load('roles');

        return response()->json([
            'user' => $user,
            'message' => 'Utilisateur mis à jour avec succès',
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/users/{id}",
     *     tags={"Admin Users"},
     *     summary="Delete an admin user",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Admin ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\Response(response=200, description="Admin user deleted successfully"),
     *     @OA\Response(response=404, description="Admin not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy($id)
    {
        $admin = Admin::findOrFail($id);
        $user = $admin->user;

        // Supprimer l'enregistrement admin
        $admin->delete();

        // Supprimer l'utilisateur
        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès',
        ]);
    }
}
