<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\LiterasiMaterial;
use App\Models\MateriAnswer;
use App\Models\MateriQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentMateriController extends Controller
{
    public function index()
    {
        $materials = LiterasiMaterial::with(['questions' => function ($q) {
            $q->orderBy('order');
        }])->orderBy('order')->get();

        return response()->json(['success' => true, 'data' => $materials]);
    }

    public function submitAnswers(Request $request)
    {
        // Get student_id from query param (token=xxx), header (Bearer token), or input
        $studentId = $request->query('student_id')
            ?? $request->input('student_id')
            ?? null;

        // If we have a token, look up the user
        $token = $request->query('token') ?? $request->header('Authorization');
        if (!$studentId && $token) {
            $token = str_replace('Bearer ', '', $token);
            $user = \App\Models\User::where('api_token', $token)->first();
            $studentId = $user ? $user->id : null;
        }

        if (!$studentId) {
            return response()->json(['success' => false, 'message' => 'Login dulu'], 401);
        }

        $answers = $request->input('answers', []);
        $saved = 0;

        DB::transaction(function () use ($answers, $studentId, &$saved) {
            foreach ($answers as $item) {
                if (empty($item['answer'])) continue;

                MateriAnswer::updateOrCreate(
                    [
                        'question_id' => $item['question_id'],
                        'student_id' => $studentId,
                    ],
                    [
                        'answer' => $item['answer'],
                    ]
                );
                $saved++;
            }
        });

        return response()->json([
            'success' => true,
            'message' => " {$saved} jawaban berhasil disimpan",
            'saved_count' => $saved,
        ]);
    }

    public function getMyAnswers(Request $request)
    {
        // Get student_id from query param, header, or input
        $studentId = $request->query('student_id')
            ?? $request->input('student_id')
            ?? null;

        // If we have a token, look up the user
        $token = $request->query('token') ?? $request->header('Authorization');
        if (!$studentId && $token) {
            $token = str_replace('Bearer ', '', $token);
            $user = \App\Models\User::where('api_token', $token)->first();
            $studentId = $user ? $user->id : null;
        }

        if (!$studentId) {
            return response()->json(['success' => false, 'message' => 'Login dulu'], 401);
        }

        $answers = MateriAnswer::where('student_id', $studentId)
            ->get()
            ->keyBy('question_id');

        return response()->json(['success' => true, 'data' => $answers]);
    }
}
