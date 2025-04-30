<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;

class CheckUserLoggedIn
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $userId = $request->cookie('access_token');
        if (!$userId) {
            return response()->json(['error' => "Unauthorized User"], 401);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized User'], 401);
        }
        $request->merge(['authenticated_user' => $user]);
        return $next($request);
    }
}
