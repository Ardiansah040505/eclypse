<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RefleksiQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RefleksiQuestionController extends Controller
{
    // GET /api/refleksi-questions - List all questions for admin
    public function index(Request $request)
    {
        $role = $request->query('role', 'all');

        $questions = DB::table('refleksi_questions')
            ->when($role !== 'all', function($q) use ($role) {
                return $q->where('role', $role)->orWhere('role', 'all');
            })
            ->orderBy('role')
            ->orderBy('order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $questions,
            'role' => $role
        ]);
    }

    // GET /api/refleksi-questions/student - Get questions for student based on their role
    public function forStudent(Request $request)
    {
        $role = $request->query('role', 'all');

        $questions = DB::table('refleksi_questions')
            ->where('role', $role)
            ->orWhere('role', 'all')
            ->orderBy('role')
            ->orderBy('order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $questions,
            'role' => $role
        ]);
    }

    // POST /api/refleksi-questions - Create new question
    public function store(Request $request)
    {
        $validated = $request->validate([
            'question_text' => 'required|string',
            'role' => 'required|string|in:peneliti,aktivis,pedagang,all',
            'order' => 'nullable|integer'
        ]);

        $question = RefleksiQuestion::create([
            'question_text' => $validated['question_text'],
            'role' => $validated['role'],
            'order' => $validated['order'] ?? 0
        ]);

        return response()->json([
            'success' => true,
            'data' => $question,
            'message' => 'Pertanyaan refleksi berhasil ditambahkan!'
        ]);
    }

    // PUT /api/refleksi-questions/{id} - Update question
    public function update(Request $request, $id)
    {
        $question = RefleksiQuestion::find($id);
        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Pertanyaan tidak ditemukan'
            ], 404);
        }

        $validated = $request->validate([
            'question_text' => 'required|string',
            'role' => 'required|string|in:peneliti,aktivis,pedagang,all',
            'order' => 'nullable|integer'
        ]);

        $question->update([
            'question_text' => $validated['question_text'],
            'role' => $validated['role'],
            'order' => $validated['order'] ?? $question->order
        ]);

        return response()->json([
            'success' => true,
            'data' => $question,
            'message' => 'Pertanyaan refleksi berhasil diperbarui!'
        ]);
    }

    // DELETE /api/refleksi-questions/{id} - Delete question
    public function destroy($id)
    {
        $question = RefleksiQuestion::find($id);
        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Pertanyaan tidak ditemukan'
            ], 404);
        }

        $question->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pertanyaan refleksi berhasil dihapus!'
        ]);
    }
}
