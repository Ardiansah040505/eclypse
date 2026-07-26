<?php

namespace App\Http\Controllers;

use App\Models\LiterasiMaterial;
use App\Models\MateriQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LiterasiController extends Controller
{
    // ═══════════════ MATERIALS ═══════════════

    public function materials()
    {
        $materials = LiterasiMaterial::orderBy('order')->get();
        return response()->json(['success' => true, 'data' => $materials]);
    }

    public function storeMaterial(Request $request)
    {
        $adminId = $request->header('X-Admin-Id') ?: $request->input('admin_id');
        if (!$adminId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $maxOrder = LiterasiMaterial::max('order') ?? 0;

        $material = LiterasiMaterial::create([
            'title' => $request->title,
            'subtitle' => $request->subtitle,
            'content' => $request->content,
            'order' => $maxOrder + 1,
            'icon' => $request->icon ?: '📦',
            'border_color' => $request->border_color ?: '#1B4332',
        ]);

        return response()->json(['success' => true, 'data' => $material, 'message' => 'Materi berhasil ditambahkan']);
    }

    public function updateMaterial(Request $request, $id)
    {
        $adminId = $request->header('X-Admin-Id') ?: $request->input('admin_id');
        if (!$adminId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $material = LiterasiMaterial::find($id);
        if (!$material) {
            return response()->json(['success' => false, 'message' => 'Materi tidak ditemukan'], 404);
        }

        $material->update($request->only(['title', 'subtitle', 'content', 'icon', 'border_color']));

        return response()->json(['success' => true, 'data' => $material, 'message' => 'Materi berhasil diupdate']);
    }

    public function destroyMaterial($id)
    {
        $material = LiterasiMaterial::find($id);
        if (!$material) {
            return response()->json(['success' => false, 'message' => 'Materi tidak ditemukan'], 404);
        }

        $material->delete();
        return response()->json(['success' => true, 'message' => 'Materi berhasil dihapus']);
    }

    public function reorderMaterials(Request $request)
    {
        $adminId = $request->header('X-Admin-Id') ?: $request->input('admin_id');
        if (!$adminId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        foreach ($request->order as $index => $id) {
            LiterasiMaterial::where('id', $id)->update(['order' => $index + 1]);
        }

        return response()->json(['success' => true, 'message' => 'Urutan materi berhasil diupdate']);
    }

    // ═══════════════ QUESTIONS ═══════════════

    public function questions($materialId)
    {
        $questions = MateriQuestion::where('material_id', $materialId)
            ->orderBy('order')
            ->get();
        return response()->json(['success' => true, 'data' => $questions]);
    }

    public function storeQuestion(Request $request)
    {
        $adminId = $request->header('X-Admin-Id') ?: $request->input('admin_id');
        if (!$adminId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $maxOrder = MateriQuestion::where('material_id', $request->material_id)->max('order') ?? 0;

        $question = MateriQuestion::create([
            'material_id' => $request->material_id,
            'question_text' => $request->question_text,
            'order' => $maxOrder + 1,
        ]);

        return response()->json(['success' => true, 'data' => $question, 'message' => 'Pertanyaan berhasil ditambahkan']);
    }

    public function updateQuestion(Request $request, $id)
    {
        $adminId = $request->header('X-Admin-Id') ?: $request->input('admin_id');
        if (!$adminId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $question = MateriQuestion::find($id);
        if (!$question) {
            return response()->json(['success' => false, 'message' => 'Pertanyaan tidak ditemukan'], 404);
        }

        $question->update(['question_text' => $request->question_text]);

        return response()->json(['success' => true, 'data' => $question, 'message' => 'Pertanyaan berhasil diupdate']);
    }

    public function destroyQuestion($id)
    {
        $question = MateriQuestion::find($id);
        if (!$question) {
            return response()->json(['success' => false, 'message' => 'Pertanyaan tidak ditemukan'], 404);
        }

        $question->delete();
        return response()->json(['success' => true, 'message' => 'Pertanyaan berhasil dihapus']);
    }
}
