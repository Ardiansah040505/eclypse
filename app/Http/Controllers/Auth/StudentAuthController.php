<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

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

        // Clear ALL session data first - important for security
        session()->flush();

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

        // Set student session
        session([
            'student_id' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }
}
