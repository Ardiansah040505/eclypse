<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RefleksiAnswerController extends Controller
{
    // POST /api/student/refleksi-answer - Save student's refleksi answer
    public function save(Request $request)
    {
        $validated = $request->validate([
            'question_id' => 'required|integer',
            'answer' => 'required|string',
            'student_id' => 'required|integer'
        ]);

        // Check if answer already exists, update or create
        $existing = DB::table('refleksi_answers')
            ->where('question_id', $validated['question_id'])
            ->where('student_id', $validated['student_id'])
            ->first();

        if ($existing) {
            DB::table('refleksi_answers')
                ->where('id', $existing->id)
                ->update([
                    'answer' => $validated['answer'],
                    'updated_at' => now()
                ]);
        } else {
            DB::table('refleksi_answers')->insert([
                'question_id' => $validated['question_id'],
                'student_id' => $validated['student_id'],
                'answer' => $validated['answer'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Jawaban refleksi berhasil disimpan!'
        ]);
    }
}
