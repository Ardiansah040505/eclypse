<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StudentAuthController extends Controller
{
    public function showLogin()
    {
        return view('app');
    }

    public function login(Request $request)
    {
        $request->validate([
            'name'   => 'required',
            'nis'    => 'required',
            'school' => 'required',
        ]);

        // Create or find user
        $user = User::firstOrCreate(
            [
                'nis' => $request->nis,
            ],
            [
                'name' => $request->name,
                'school' => $request->school,
                'role' => 'student',
            ]
        );

        // Update last_seen to mark user as online
        $user->last_seen = now()->toDateTimeString();
        $user->save();

        // Generate a simple token for authentication
        $token = Str::random(64);

        // Store token in user record (simple approach)
        $user->api_token = $token;
        $user->save();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'nis' => $user->nis,
                'school' => $user->school,
                'role' => $user->role,
                'eco_role' => $user->eco_role,
            ],
            'token' => $token,
        ]);
    }
}
