<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class EcoRoleController extends Controller
{
    /**
     * Save student's eco_role when they select eco card pack
     */
    public function save(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|integer',
            'eco_role' => 'required|string|in:peneliti,aktivis,pedagang'
        ]);

        DB::table('users')
            ->where('id', $validated['student_id'])
            ->update(['eco_role' => $validated['eco_role']]);

        return response()->json([
            'success' => true,
            'message' => 'Eco role saved!'
        ]);
    }
}
