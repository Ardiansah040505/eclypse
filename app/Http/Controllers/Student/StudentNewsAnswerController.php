<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentNewsAnswerController extends Controller
{
    public function show(Request $request, $newsId)
    {
        $studentId = $request->query('student_id') ?? session('student_id');
        if (!$studentId) {
            return response()->json(['success' => true, 'data' => ['answers' => [], 'answered_count' => 0, 'total_questions' => 0, 'is_completed' => false]]);
        }

        $answer = DB::table('student_news_answers')
            ->where('student_id', $studentId)
            ->where('news_id', $newsId)
            ->first();

        if (!$answer) {
            return response()->json(['success' => true, 'data' => ['answers' => [], 'answered_count' => 0, 'total_questions' => 0, 'is_completed' => false]]);
        }

        // Decode JSON answers
        $decodedAnswers = [];
        if (!empty($answer->answers)) {
            $decodedAnswers = is_string($answer->answers) ? json_decode($answer->answers, true) : $answer->answers;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'answers' => $decodedAnswers,
                'answered_count' => $answer->answered_count ?? 0,
                'total_questions' => $answer->total_questions ?? 0,
                'is_completed' => (bool)($answer->is_completed ?? false)
            ]
        ]);
    }

    public function save(Request $request, $newsId)
    {
        $studentId = $request->input('student_id') ?? session('student_id');
        if (!$studentId) {
            return response()->json(['success' => false, 'message' => 'Login dulu']);
        }

        $answers = $request->input('answers', []);

        // Get total questions count from database
        $totalQuestions = DB::table('news_questions')
            ->where('learning_news_id', $newsId)
            ->count();

        // Count answered
        $answeredCount = 0;
        foreach ($answers as $v) {
            if ($v !== null && $v !== '') $answeredCount++;
        }

        // Check if all questions are answered
        $isCompleted = $totalQuestions > 0 && $answeredCount >= $totalQuestions;

        // JSON encode answers for storage
        $answersJson = json_encode($answers);

        DB::table('student_news_answers')->updateOrInsert(
            ['student_id' => $studentId, 'news_id' => $newsId],
            [
                'answers' => $answersJson,
                'answered_count' => $answeredCount,
                'total_questions' => $totalQuestions,
                'is_completed' => $isCompleted,
                'updated_at' => now()
            ]
        );

        return response()->json([
            'success' => true,
            'data' => [
                'answered_count' => $answeredCount,
                'total_questions' => $totalQuestions,
                'is_completed' => $isCompleted
            ]
        ]);
    }
}
