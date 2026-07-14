<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DebateRule;
use Illuminate\Http\Request;

class DebateRuleController extends Controller
{
    // GET /api/debate-rules - Get all rules
    public function index()
    {
        $rules = DebateRule::where('is_active', true)
            ->orderBy('order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rules
        ]);
    }

    // POST /api/debate-rules - Create new rule
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'description' => 'required|string',
            'order' => 'nullable|integer'
        ]);

        $rule = DebateRule::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'order' => $validated['order'] ?? 0,
            'is_active' => true
        ]);

        return response()->json([
            'success' => true,
            'data' => $rule,
            'message' => 'Aturan berhasil ditambahkan!'
        ]);
    }

    // PUT /api/debate-rules/{id} - Update rule
    public function update(Request $request, $id)
    {
        $rule = DebateRule::find($id);
        if (!$rule) {
            return response()->json([
                'success' => false,
                'message' => 'Aturan tidak ditemukan'
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'description' => 'required|string',
            'order' => 'nullable|integer'
        ]);

        $rule->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'order' => $validated['order'] ?? $rule->order
        ]);

        return response()->json([
            'success' => true,
            'data' => $rule,
            'message' => 'Aturan berhasil diperbarui!'
        ]);
    }

    // DELETE /api/debate-rules/{id} - Delete rule
    public function destroy($id)
    {
        $rule = DebateRule::find($id);
        if (!$rule) {
            return response()->json([
                'success' => false,
                'message' => 'Aturan tidak ditemukan'
            ], 404);
        }

        $rule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Aturan berhasil dihapus!'
        ]);
    }
}
