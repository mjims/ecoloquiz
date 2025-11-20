<?php

namespace App\Services;

use App\Models\Admin;
use App\Models\Company;
use App\Models\Player;
use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Inscription JOUEUR (public)
     */
    public function registerPlayer(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // Créer User
            $user = User::create([
                'email' => $data['email'],
                'password' => $data['password'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'status' => 'active',
            ]);

            // Attacher rôle JOUEUR
            $playerRole = Role::where('name', 'joueur')->firstOrFail();
            $user->roles()->attach($playerRole->id);

            // Créer profil Player
            $player = Player::create([
                'user_id' => $user->id,
                'zone_id' => $data['zone_id'] ?? null,
                'points' => 0,
                'current_level' => 'débutant',
            ]);

            // Générer token
            $token = $user->createToken('auth_token')->plainTextToken;

            return [
                'user' => $user->load('roles', 'player'),
                'token' => $token,
            ];
        });
    }

    /**
     * Créer PARTNER_CITY (admin only)
     */
    public function createPartnerCity(array $data, User $creator): array
    {
        $this->ensureIsAdmin($creator);

        return DB::transaction(function () use ($data) {
            // Créer User
            $user = User::create([
                'email' => $data['email'],
                'password' => $data['password'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'status' => 'active',
            ]);

            // Attacher rôle PARTNER_CITY
            $role = Role::where('name', 'partner_city')->firstOrFail();
            $user->roles()->attach($role->id);

            // Créer Company
            $company = Company::create([
                'name' => $data['company_name'],
                'type' => 'city',
                'director_first_name' => $data['director_first_name'] ?? null,
                'director_last_name' => $data['director_last_name'] ?? null,
                'employee_count' => $data['employee_count'] ?? null,
                'legal_info' => $data['legal_info'] ?? null,
                'unique_identifier' => $data['siret'] ?? null,
                'main_contact_user_id' => $user->id,
            ]);

            return [
                'user' => $user->load('roles', 'company'),
                'company' => $company,
            ];
        });
    }

    /**
     * Créer PARTNER_SPONSOR (admin only)
     */
    public function createPartnerSponsor(array $data, User $creator): array
    {
        $this->ensureIsAdmin($creator);

        return DB::transaction(function () use ($data) {
            $user = User::create([
                'email' => $data['email'],
                'password' => $data['password'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'status' => 'active',
            ]);

            $role = Role::where('name', 'partner_sponsor')->firstOrFail();
            $user->roles()->attach($role->id);

            $company = Company::create([
                'name' => $data['company_name'],
                'type' => 'sponsor',
                'director_first_name' => $data['director_first_name'] ?? null,
                'director_last_name' => $data['director_last_name'] ?? null,
                'employee_count' => $data['employee_count'] ?? null,
                'legal_info' => $data['legal_info'] ?? null,
                'unique_identifier' => $data['siret'] ?? null,
                'main_contact_user_id' => $user->id,
            ]);

            return [
                'user' => $user->load('roles', 'company'),
                'company' => $company,
            ];
        });
    }

    /**
     * Créer ADMIN (super admin only)
     */
    public function createAdmin(array $data, User $creator): array
    {
        $this->ensureIsSuperAdmin($creator);

        return DB::transaction(function () use ($data) {
            $user = User::create([
                'email' => $data['email'],
                'password' => $data['password'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'status' => 'active',
            ]);

            $role = Role::where('name', $data['role'])->firstOrFail();
            $user->roles()->attach($role->id);

            Admin::create([
                'user_id' => $user->id,
                'role' => $data['role'],
            ]);

            return [
                'user' => $user->load('roles', 'admin'),
            ];
        });
    }

    /**
     * Connexion
     */
    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        if (! $user->isActive()) {
            throw ValidationException::withMessages([
                'email' => ['Votre compte est désactivé.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->load('roles', 'player', 'admin', 'company'),
            'token' => $token,
        ];
    }

    /**
     * Déconnexion
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    /**
     * Refresh token
     */
    public function refreshToken(User $user): string
    {
        $user->tokens()->delete();

        return $user->createToken('auth_token')->plainTextToken;
    }

    /**
     * Mot de passe oublié
     */
    public function forgotPassword(string $email): string
    {
        return Password::sendResetLink(['email' => $email]);
    }

    /**
     * Réinitialiser mot de passe
     */
    public function resetPassword(array $credentials): string
    {
        return Password::reset($credentials, function (User $user, string $password) {
            $user->forceFill([
                'password' => $password,
                'remember_token' => Str::random(60),
            ])->save();

            event(new PasswordReset($user));
        });
    }

    /**
     * Vérifier si admin
     */
    private function ensureIsAdmin(User $user): void
    {
        if (! $user->hasAnyRole(['admin', 'super_admin'])) {
            throw ValidationException::withMessages([
                'authorization' => ['Action réservée aux administrateurs.'],
            ]);
        }
    }

    /**
     * Vérifier si super admin
     */
    private function ensureIsSuperAdmin(User $user): void
    {
        if (! $user->hasRole('super_admin')) {
            throw ValidationException::withMessages([
                'authorization' => ['Action réservée aux super administrateurs.'],
            ]);
        }
    }
}
