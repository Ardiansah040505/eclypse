<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class PrepController extends Controller
{
    /**
     * Get questions based on student's selected role
     * Role is passed from frontend (based on eco card selection)
     */
    public function questions(\Illuminate\Http\Request $request)
    {
        $role = $request->query('role', 'all');

        // If no questions exist, create default ones with 'all' role
        if (DB::table('preparation_questions')->count() === 0) {
            $defaults = [
                ['text' => 'Menurut kamu, apa dampak terbesar perubahan iklim yang paling dirasakan masyarakat Indonesia saat ini?', 'role' => 'all'],
                ['text' => 'Siapa yang paling bertanggung jawab atas perubahan iklim — individu, industri, atau pemerintah? Jelaskan alasanmu!', 'role' => 'all'],
                ['text' => 'Jika kamu jadi pembuat kebijakan, langkah apa yang pertama kali kamu ambil untuk mengatasi krisis iklim di Indonesia?', 'role' => 'all'],
                ['text' => 'Apakah pembatasan industri adalah solusi yang adil untuk negara berkembang seperti Indonesia? Setuju atau tidak setuju?', 'role' => 'all'],
                ['text' => 'Dari eco cards yang sudah kamu buka, fakta mana yang paling mengejutkan? Bagaimana fakta itu mendukung posisi kelompokmu dalam debat?', 'role' => 'all'],
            ];
            foreach ($defaults as $i => $item) {
                DB::table('preparation_questions')->insert([
                    'question_text' => $item['text'],
                    'order' => $i + 1,
                    'role' => $item['role'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }

        // Get ALL questions (universal + role-specific) when role=all
        // Only filter by specific role if it's not 'all'
        $query = DB::table('preparation_questions');
        if ($role && $role !== 'all') {
            $query->where(function($q) use ($role) {
                $q->where('role', $role)
                  ->orWhere('role', 'all');
            });
        }
        $questions = $query->orderBy('role')
            ->orderBy('order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $questions,
            'role' => $role,
            'message' => $questions->isEmpty() ? 'Belum ada pertanyaan untuk role ini' : null
        ]);
    }
}
