<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class PrepController extends Controller
{
    public function questions()
    {
        if (DB::table('preparation_questions')->count() === 0) {
            $defaults = [
                'Menurut kamu, apa dampak terbesar perubahan iklim yang paling dirasakan masyarakat Indonesia saat ini?',
                'Siapa yang paling bertanggung jawab atas perubahan iklim — individu, industri, atau pemerintah? Jelaskan alasanmu!',
                'Jika kamu jadi pembuat kebijakan, langkah apa yang pertama kali kamu ambil untuk mengatasi krisis iklim di Indonesia?',
                'Apakah pembatasan industri adalah solusi yang adil untuk negara berkembang seperti Indonesia? Setuju atau tidak setuju?',
                'Dari eco cards yang sudah kamu buka, fakta mana yang paling mengejutkan? Bagaimana fakta itu mendukung posisi kelompokmu dalam debat?'
            ];
            foreach ($defaults as $i => $text) {
                DB::table('preparation_questions')->insert([
                    'question_text' => $text,
                    'order' => $i + 1,
                    'created_at' => now(), 'updated_at' => now()
                ]);
            }
        }
        return response()->json(['success' => true, 'data' => DB::table('preparation_questions')->orderBy('order')->get()]);
    }
}
