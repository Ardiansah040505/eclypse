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
            'absen'  => 'required',
            'kelas'  => 'required',
            'school' => 'required',
        ]);

        // Create or find user based on name + school (since NIS is not unique across schools)
        $user = User::where('name', $request->name)
            ->where('school', $request->school)
            ->first();

        if (!$user) {
            // Create new user
            $user = User::create([
                'name' => $request->name,
                'absen' => $request->absen,
                'kelas' => $request->kelas,
                'school' => $request->school,
                'role' => 'student',
            ]);
        } else {
            // Update absen and kelas if changed
            $user->absen = $request->absen;
            $user->kelas = $request->kelas;
            $user->save();
        }

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
                'absen' => $user->absen,
                'kelas' => $user->kelas,
                'school' => $user->school,
                'role' => $user->role,
                'eco_role' => $user->eco_role,
            ],
            'token' => $token,
        ]);
    }
}
