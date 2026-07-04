<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PrepAnswerController extends Controller
{
    public function save(Request $request)
    {
        $studentId = $request->input('student_id') ?? session('student_id');
        if (!$studentId) return response()->json(['success' => false, 'message' => 'Login dulu']);

        $request->validate(['question_id' => 'required', 'answer' => 'required']);

        DB::table('preparation_answers')->updateOrInsert(
            ['student_id' => $studentId, 'question_id' => $request->question_id],
            ['answer' => $request->answer, 'updated_at' => now()]
        );

        return response()->json(['success' => true]);
    }

    public function myAnswers(Request $request)
    {
        $studentId = $request->query('student_id') ?? session('student_id');
        if (!$studentId) return response()->json(['success' => false]);

        $answers = DB::table('preparation_answers')->where('student_id', $studentId)->get();

        return response()->json(['success' => true, 'data' => $answers]);
    }
}
