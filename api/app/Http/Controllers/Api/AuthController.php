<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Models\Player;
use App\Models\User;
use App\Services\EmailService;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    /**
     * Register a new player (public).
     *
     * @OA\Post(
     *   path="/api/auth/register",
     *   tags={"Auth"},
     *   summary="Register a new player",
     *   description="Create a new user account and player profile",
     *
     *   @OA\RequestBody(
     *     required=true,
     *
     *     @OA\JsonContent(
     *        required={"email","password"},
     *
     *        @OA\Property(property="id", type="string", format="uuid", description="Optional UUID for the user"),
     *        @OA\Property(property="email", type="string", format="email", example="player@example.com"),
     *        @OA\Property(property="first_name", type="string", example="John"),
     *        @OA\Property(property="last_name", type="string", example="Doe"),
     *        @OA\Property(property="password", type="string", format="password", example="password123"),
     *        @OA\Property(property="password_confirmation", type="string", format="password", example="password123")
     *     )
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="User registered successfully",
     *
     *     @OA\JsonContent(
     *
     *       @OA\Property(property="access_token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGc..."),
     *       @OA\Property(property="token_type", type="string", example="bearer"),
     *       @OA\Property(property="expires_in", type="integer", example=3600),
     *       @OA\Property(property="user", type="object",
     *         @OA\Property(property="id", type="string", format="uuid"),
     *         @OA\Property(property="email", type="string"),
     *         @OA\Property(property="first_name", type="string"),
     *         @OA\Property(property="last_name", type="string"),
     *         @OA\Property(property="status", type="string", example="ACTIVE")
     *       )
     *     )
     *   ),
     *
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        // create user
        $user = User::create([
            'id' => $data['id'] ?? null, // UsesUuid trait will set if null
            'email' => $data['email'],
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'password' => Hash::make($data['password']),
            'status' => 'ACTIVE',
        ]);

        // create player profile
        $player = Player::create([
            'user_id' => $user->id,
            'points' => 0,
            'current_level' => 'DECOUVERTE',
        ]);

        // Envoyer l'email de bienvenue (puisque le statut est directement ACTIVE)
        $emailService = new EmailService();
        $quizUrl = config('app.frontend_url') . '/quiz';
        $emailService->sendWelcomeEmail(
            $user->email,
            $user->first_name ?? 'Joueur',
            $user->last_name ?? '',
            $quizUrl
        );

        // issue token
        $token = auth('api')->login($user);

        return $this->respondWithToken($token, $user);
    }

    /**
     * Login user
     *
     * @OA\Post(
     *   path="/api/auth/login",
     *   tags={"Auth"},
     *   summary="Login user",
     *   description="Authenticate user and return JWT token",
     *
     *   @OA\RequestBody(
     *     required=true,
     *
     *     @OA\JsonContent(
     *        required={"email","password"},
     *
     *        @OA\Property(property="email", type="string", format="email", example="player@example.com"),
     *        @OA\Property(property="password", type="string", format="password", example="password123")
     *     )
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Login successful",
     *
     *     @OA\JsonContent(
     *
     *       @OA\Property(property="access_token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGc..."),
     *       @OA\Property(property="token_type", type="string", example="bearer"),
     *       @OA\Property(property="expires_in", type="integer", example=3600),
     *       @OA\Property(property="user", type="object",
     *         @OA\Property(property="id", type="string", format="uuid"),
     *         @OA\Property(property="email", type="string"),
     *         @OA\Property(property="first_name", type="string"),
     *         @OA\Property(property="last_name", type="string"),
     *         @OA\Property(property="status", type="string")
     *       )
     *     )
     *   ),
     *
     *   @OA\Response(response=401, description="Invalid credentials"),
     *   @OA\Response(response=500, description="Could not create token")
     * )
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->only(['email', 'password']);

        try {
            if (! $token = auth('api')->attempt($credentials)) {
                return response()->json(['message' => 'Invalid credentials'], 401);
            }
        } catch (JWTException $e) {
            return response()->json(['message' => 'Could not create token', 'erreur' => $e], 500);
        }

        $user = auth('api')->user();

        return $this->respondWithToken($token, $user);
    }

    /**
     * Get current authenticated user
     *
     * @OA\Get(
     *   path="/api/auth/me",
     *   tags={"Auth"},
     *   summary="Get current user",
     *   description="Return the currently authenticated user with roles and player profile",
     *   security={{"token":{}}},
     *
     *   @OA\Response(
     *     response=200,
     *     description="User retrieved successfully",
     *
     *     @OA\JsonContent(
     *
     *       @OA\Property(property="user", type="object",
     *         @OA\Property(property="id", type="string", format="uuid"),
     *         @OA\Property(property="email", type="string"),
     *         @OA\Property(property="first_name", type="string"),
     *         @OA\Property(property="last_name", type="string"),
     *         @OA\Property(property="status", type="string"),
     *         @OA\Property(property="roles", type="array", @OA\Items(type="object")),
     *         @OA\Property(property="player", type="object",
     *           @OA\Property(property="id", type="string", format="uuid"),
     *           @OA\Property(property="points", type="integer"),
     *           @OA\Property(property="current_level", type="string")
     *         )
     *       )
     *     )
     *   ),
     *
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function me()
    {
        $user = auth('api')->user();
        // eager load relations useful for client
        $user->load(['roles', 'player']);

        return response()->json(['user' => $user]);
    }

    /**
     * Logout user
     *
     * @OA\Post(
     *   path="/api/auth/logout",
     *   tags={"Auth"},
     *   summary="Logout user",
     *   description="Invalidate the current JWT token",
     *   security={{"token":{}}},
     *
     *   @OA\Response(
     *     response=200,
     *     description="Logout successful",
     *
     *     @OA\JsonContent(
     *
     *       @OA\Property(property="message", type="string", example="Successfully logged out")
     *     )
     *   ),
     *
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function logout()
    {
        auth('api')->logout(true);

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh JWT token
     *
     * @OA\Post(
     *   path="/api/auth/refresh",
     *   tags={"Auth"},
     *   summary="Refresh JWT token",
     *   description="Invalidate the current token and return a new one",
     *   security={{"token":{}}},
     *
     *   @OA\Response(
     *     response=200,
     *     description="Token refreshed successfully",
     *
     *     @OA\JsonContent(
     *
     *       @OA\Property(property="access_token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGc..."),
     *       @OA\Property(property="token_type", type="string", example="bearer"),
     *       @OA\Property(property="expires_in", type="integer", example=3600),
     *       @OA\Property(property="user", type="object",
     *         @OA\Property(property="id", type="string", format="uuid"),
     *         @OA\Property(property="email", type="string"),
     *         @OA\Property(property="first_name", type="string"),
     *         @OA\Property(property="last_name", type="string"),
     *         @OA\Property(property="status", type="string")
     *       )
     *     )
     *   ),
     *
     *   @OA\Response(response=401, description="Could not refresh token")
     * )
     */
    public function refresh()
    {
        try {
            $newToken = auth('api')->refresh(true, false); // invalidate old token (true)
            $user = auth('api')->user();

            return $this->respondWithToken($newToken, $user);
        } catch (JWTException $e) {
            return response()->json(['message' => 'Could not refresh token'], 401);
        }
    }

    /**
     * Update user profile
     */
    public function updateProfile(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . auth('api')->id(),
            'zone_id' => 'nullable|exists:zones,id',
        ]);

        $user = auth('api')->user();
        $user->update([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
        ]);

        // Update player's zone if provided
        if ($user->player && isset($validated['zone_id'])) {
            $user->player->update([
                'zone_id' => $validated['zone_id']
            ]);
        }

        // Reload relationships
        $user->load(['roles', 'player', 'player.zone']);

        return response()->json($user);
    }

    /**
     * Change user password
     */
    public function changePassword(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = auth('api')->user();

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Le mot de passe actuel est incorrect'
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['new_password'])
        ]);

        return response()->json([
            'message' => 'Mot de passe changé avec succès'
        ]);
    }

    protected function respondWithToken($token, $user)
    {
        $ttl = (int) config('jwt.ttl'); // minutes

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $ttl * 60,
            'user' => $user,
        ]);
    }
}
