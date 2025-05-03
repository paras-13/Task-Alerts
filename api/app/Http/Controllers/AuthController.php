<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{
    //
    public function register(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'username' => 'required|string|max:255|unique:users,username',
                'email' => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:6',
                'confirm_password' => 'required|same:password',
            ]);

            $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Fire Registered event to send verification email
            event(new Registered($user));

            return response()->json([
                'message' => 'User registered successfully. Please check your email to verify your account.',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' =>  'required|string',
        ]);

        $user = User::where('username', $request->username)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(["error" => "Invalid Credentials"], 401);
        }
        $cookie = cookie('access_token', $user->id, 60 * 24, null, null, false, true, false, 'Strict');
        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name
            ]
        ])->withCookie($cookie);
    }
}
