<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LearningNews;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LearningNewsController extends Controller
{
    /**
     * Check if request is from authenticated admin
     */
    private function isAdminRequest(Request $request): bool
    {
        $adminId = $request->header('X-Admin-Id') ?: $request->input('admin_id');
        return !empty($adminId);
    }

    public function index()
    {
        return response()->json(

        LearningNews::with('questions.options')

            ->latest()

            ->get()

        );
    }

    public function store(Request $request)
    {
        if (!$this->isAdminRequest($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Akses hanya untuk guru/admin.'
            ], 401);
        }

        $request->validate([
            'title' => 'required',
            'content' => 'required'
        ]);

        $news = LearningNews::create([

        'title' => $request->title,

        'slug' => Str::slug($request->title) . '-' . time(),

        'thumbnail' => $request->thumbnail,

        'content' => $request->content,

        'tag' => $request->tag,

        'status' => 'draft',

        'created_by' => $request->header('X-Admin-Id') ?: 1,

    ]);

        return response()->json([
            'success' => true,
            'news' => $news
        ]);
    }

    public function update(Request $request, $id)
    {
        if (!$this->isAdminRequest($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Akses hanya untuk guru/admin.'
            ], 401);
        }

        $request->validate([
            'title' => 'required',
            'content' => 'required'
        ]);

        $news = LearningNews::findOrFail($id);

        $news->update([

        'title' => $request->title,

        'slug' => Str::slug($request->title).'-'.time(),

        'thumbnail' => $request->thumbnail,

        'content' => $request->content,

        'tag' => $request->tag

    ]);

        return response()->json([

        'success' => true,

        'news' => $news

    ]);
    }

    public function destroy(Request $request, $id)
    {
        if (!$this->isAdminRequest($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Akses hanya untuk guru/admin.'
            ], 401);
        }

        LearningNews::findOrFail($id)->delete();

        return response()->json([

        'success'=>true

    ]);
    }
}
