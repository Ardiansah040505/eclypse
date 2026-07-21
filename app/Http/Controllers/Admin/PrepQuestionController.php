<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PreparationQuestion;
use Illuminate\Http\Request;

class PrepQuestionController extends Controller
{
    /**
     * Get all questions (admin)
     */
    public function index(Request $request)
    {
        $role = $request->query('role');
        $query = PreparationQuestion::orderBy('order');

        if ($role) {
            $query->where('role', $role);
        }

        $questions = $query->get();

        // Group by role for easier display
        $grouped = $questions->groupBy('role');

        return response()->json([
            'success' => true,
            'data' => $questions,
            'grouped' => $grouped,
            'roles' => [
                'peneliti' => $grouped->get('peneliti', collect()),
                'aktivis' => $grouped->get('aktivis', collect()),
                'pedagang' => $grouped->get('pedagang', collect()),
                'all' => $grouped->get('all', collect()),
            ]
        ]);
    }

    /**
     * Create new question
     */
    public function store(Request $request)
    {
        $adminId = $request->header('X-Admin-Id')
            ?? $request->input('admin_id')
            ?? session()->get('admin_id');

        if (!$adminId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $request->validate([
            'question_text' => 'required|string|max:2000',
            'role' => 'required|in:peneliti,aktivis,pedagang,all',
            'order' => 'nullable|integer'
        ]);

        // Get max order for this role
        $maxOrder = PreparationQuestion::where('role', $request->role)
            ->max('order') ?? 0;

        $question = PreparationQuestion::create([
            'question_text' => $request->question_text,
            'role' => $request->role,
            'order' => $request->order ?? ($maxOrder + 1)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pertanyaan berhasil ditambahkan',
            'data' => $question
        ]);
    }

    /**
     * Update question
     */
    public function update(Request $request, $id)
    {
        $adminId = $request->header('X-Admin-Id')
            ?? $request->input('admin_id')
            ?? session()->get('admin_id');

        if (!$adminId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $question = PreparationQuestion::findOrFail($id);

        $request->validate([
            'question_text' => 'sometimes|required|string|max:1000',
            'role' => 'sometimes|required|in:peneliti,aktivis,pedagang,all',
            'order' => 'nullable|integer'
        ]);

        $question->update($request->only(['question_text', 'role', 'order']));

        return response()->json([
            'success' => true,
            'message' => 'Pertanyaan berhasil diperbarui',
            'data' => $question
        ]);
    }

    /**
     * Delete question
     */
    public function destroy(Request $request, $id)
    {
        $adminId = $request->header('X-Admin-Id')
            ?? $request->input('admin_id')
            ?? session()->get('admin_id');

        if (!$adminId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $question = PreparationQuestion::findOrFail($id);
        $question->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pertanyaan berhasil dihapus'
        ]);
    }

    /**
     * Bulk create questions
     */
    public function bulkStore(Request $request)
    {
        $adminId = $request->header('X-Admin-Id')
            ?? $request->input('admin_id')
            ?? session()->get('admin_id');

        if (!$adminId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $request->validate([
            'questions' => 'required|array',
            'questions.*.question_text' => 'required|string|max:1000',
            'questions.*.role' => 'required|in:peneliti,aktivis,pedagang,all'
        ]);

        $created = [];
        foreach ($request->questions as $q) {
            $maxOrder = PreparationQuestion::where('role', $q['role'])->max('order') ?? 0;
            $created[] = PreparationQuestion::create([
                'question_text' => $q['question_text'],
                'role' => $q['role'],
                'order' => $maxOrder + 1
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => count($created) . ' pertanyaan berhasil ditambahkan',
            'data' => $created
        ]);
    }
}
