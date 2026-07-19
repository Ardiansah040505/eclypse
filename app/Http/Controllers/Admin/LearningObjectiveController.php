<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LearningObjective;
use Illuminate\Http\Request;

class LearningObjectiveController extends Controller
{
    /**
     * Get all learning objectives
     * GET /api/learning-objectives
     */
    public function index()
    {
        $objectives = LearningObjective::orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $objectives
        ]);
    }

    /**
     * Store a new learning objective
     * POST /api/admin/learning-objectives
     */
    public function store(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
        ]);

        $objective = LearningObjective::create([
            'text' => $request->text,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tujuan pembelajaran berhasil ditambahkan',
            'data' => $objective
        ]);
    }

    /**
     * Update an existing learning objective
     * PUT /api/admin/learning-objectives/{id}
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'text' => 'required|string',
        ]);

        $objective = LearningObjective::findOrFail($id);
        $objective->update([
            'text' => $request->text,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tujuan pembelajaran berhasil diubah',
            'data' => $objective
        ]);
    }

    /**
     * Delete a learning objective
     * DELETE /api/admin/learning-objectives/{id}
     */
    public function destroy($id)
    {
        $objective = LearningObjective::findOrFail($id);
        $objective->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tujuan pembelajaran berhasil dihapus'
        ]);
    }
}
