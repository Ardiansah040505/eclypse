<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminAuthController extends Controller
{
    public function showLogin()
    {
        return view('auth.admin');
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $admin = User::where('username', $request->username)
            ->where('role', 'admin')
            ->first();

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Username tidak ditemukan'
            ]);
        }

        if (!Hash::check($request->password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password salah'
            ]);
        }

        // Clear ALL session data first - important for security
        session()->flush();

        session([
            'admin_id' => $admin->id,
        ]);

        return response()->json([
            'success' => true,
            'user' => $admin,
        ]);
    }
}
