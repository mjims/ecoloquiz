<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdatePasswordRequest;
use App\Http\Requests\Api\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * @OA\Tag(
 *     name="User Management",
 *     description="Gestion des utilisateurs (admin et joueurs)"
 * )
 */
class UserManagementController extends Controller
{
    /**
     * @OA\Put(
     *     path="/api/users/{id}",
     *     summary="Mettre à jour un utilisateur",
     *     description="Un joueur peut mettre à jour ses propres informations. Un admin peut mettre à jour n'importe quel utilisateur s'il a la permission.",
     *     tags={"User Management"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'utilisateur",
     *
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="first_name", type="string", example="Jean"),
     *             @OA\Property(property="last_name", type="string", example="Dupont"),
     *             @OA\Property(property="email", type="string", format="email", example="jean.dupont@example.com"),
     *             @OA\Property(property="status", type="string", enum={"active", "inactive", "suspended"}, example="active"),
     *             @OA\Property(property="meta", type="object", example={"phone": "0123456789"})
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Utilisateur mis à jour avec succès",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Utilisateur mis à jour avec succès"),
     *             @OA\Property(property="user", type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=403, description="Non autorisé"),
     *     @OA\Response(response=404, description="Utilisateur non trouvé")
     * )
     */
    public function update(UpdateUserRequest $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $authUser = auth()->user();

        // Vérifier les permissions
        if ($authUser->id !== $user->id) {
            // Si ce n'est pas l'utilisateur lui-même, vérifier les permissions admin
            if ($user->isPlayer()) {
                // Pour modifier un joueur, il faut être admin avec la permission
                if (! $authUser->hasPermission('players.disable') && ! $authUser->hasPermission('users.edit')) {
                    return response()->json(['message' => 'Non autorisé'], 403);
                }
            } else {
                // Pour modifier un admin, il faut avoir la permission admin_users.manage
                if (! $authUser->hasPermission('admin_users.manage')) {
                    return response()->json(['message' => 'Non autorisé'], 403);
                }
            }
        }

        $user->update($request->validated());

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès',
            'user' => $user->load('roles', 'player'),
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/users/{id}/password",
     *     summary="Mettre à jour le mot de passe d'un utilisateur",
     *     description="Un utilisateur peut changer son propre mot de passe. Un admin peut changer le mot de passe d'un autre admin s'il a la permission.",
     *     tags={"User Management"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'utilisateur",
     *
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"password", "password_confirmation"},
     *
     *             @OA\Property(property="password", type="string", format="password", example="newpassword123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="newpassword123")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Mot de passe mis à jour avec succès",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Mot de passe mis à jour avec succès")
     *         )
     *     ),
     *
     *     @OA\Response(response=403, description="Non autorisé"),
     *     @OA\Response(response=404, description="Utilisateur non trouvé")
     * )
     */
    public function updatePassword(UpdatePasswordRequest $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $authUser = auth()->user();

        // Vérifier les permissions
        if ($authUser->id !== $user->id) {
            // Seul un admin avec la permission peut changer le mot de passe d'un autre utilisateur
            if ($user->isPlayer()) {
                return response()->json(['message' => 'Non autorisé - impossible de changer le mot de passe d\'un joueur'], 403);
            }

            if (! $authUser->hasPermission('admin_users.update_password')) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Mot de passe mis à jour avec succès',
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/users/{id}/disable",
     *     summary="Désactiver un utilisateur",
     *     description="Un admin peut désactiver un compte joueur s'il a la permission.",
     *     tags={"User Management"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'utilisateur",
     *
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Utilisateur désactivé avec succès",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Utilisateur désactivé avec succès")
     *         )
     *     ),
     *
     *     @OA\Response(response=403, description="Non autorisé"),
     *     @OA\Response(response=404, description="Utilisateur non trouvé")
     * )
     */
    public function disable(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $authUser = auth()->user();

        // Vérifier que c'est un joueur
        if (! $user->isPlayer()) {
            return response()->json(['message' => 'Seuls les comptes joueurs peuvent être désactivés via cette route'], 400);
        }

        // Vérifier les permissions
        if (! $authUser->hasPermission('players.disable')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $user->update(['status' => 'inactive']);

        return response()->json([
            'message' => 'Utilisateur désactivé avec succès',
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/users/{id}",
     *     summary="Supprimer un utilisateur",
     *     description="Un joueur peut supprimer son propre compte. Un admin peut supprimer un joueur ou un autre admin s'il a la permission.",
     *     tags={"User Management"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'utilisateur",
     *
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Utilisateur supprimé avec succès",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Utilisateur supprimé avec succès")
     *         )
     *     ),
     *
     *     @OA\Response(response=403, description="Non autorisé"),
     *     @OA\Response(response=404, description="Utilisateur non trouvé")
     * )
     */
    public function destroy(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $authUser = auth()->user();

        // Vérifier les permissions
        if ($authUser->id !== $user->id) {
            // Si ce n'est pas l'utilisateur lui-même
            if ($user->isPlayer()) {
                // Pour supprimer un joueur, il faut la permission
                if (! $authUser->hasPermission('players.delete')) {
                    return response()->json(['message' => 'Non autorisé'], 403);
                }
            } else {
                // Pour supprimer un admin, il faut la permission admin_users.manage
                if (! $authUser->hasPermission('admin_users.manage')) {
                    return response()->json(['message' => 'Non autorisé'], 403);
                }
            }
        }

        DB::transaction(function () use ($user) {
            // Supprimer les relations associées si nécessaire
            if ($user->player) {
                $user->player->delete();
            }

            // Détacher les rôles
            $user->roles()->detach();

            // Supprimer l'utilisateur
            $user->delete();
        });

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès',
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/users/me",
     *     summary="Obtenir les informations de l'utilisateur connecté",
     *     description="Retourne les informations complètes de l'utilisateur authentifié",
     *     tags={"User Management"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Informations de l'utilisateur",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="user", type="object")
     *         )
     *     )
     * )
     */
    public function me(): JsonResponse
    {
        $user = auth()->user()->load('roles.permissions', 'player');

        return response()->json([
            'user' => $user,
        ]);
    }
}
