<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = auth('api')->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Suppose que user->roles relation exists and returns array of role names
        $roleNames = $user->roles()->pluck('name')->toArray();

        foreach ($roles as $r) {
            if (in_array($r, $roleNames)) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }
}
