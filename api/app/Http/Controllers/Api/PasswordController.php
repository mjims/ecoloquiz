<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordController extends Controller
{
    public function forgot(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Créer un token de réinitialisation
        $token = Str::random(64);

        // Stocker le token dans la base de données
        \DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'email' => $request->email,
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        // Envoyer l'email via notre service
        $emailService = new EmailService();
        $resetUrl = config('app.frontend_url', config('app.url')) . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);

        $emailService->sendPasswordResetEmail(
            $user->email,
            $user->first_name ?? 'Utilisateur',
            $user->last_name ?? '',
            $resetUrl
        );

        return response()->json(['message' => 'Un email de réinitialisation a été envoyé à votre adresse']);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|min:8|confirmed',
        ]);

        // Vérifier le token
        $resetRecord = \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json(['error' => 'Token invalide ou expiré'], 400);
        }

        // Vérifier que le token correspond
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json(['error' => 'Token invalide'], 400);
        }

        // Vérifier que le token n'a pas expiré (60 minutes)
        if (now()->diffInMinutes($resetRecord->created_at) > 60) {
            return response()->json(['error' => 'Token expiré'], 400);
        }

        // Réinitialiser le mot de passe
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Supprimer le token utilisé
        \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès']);
    }
}
