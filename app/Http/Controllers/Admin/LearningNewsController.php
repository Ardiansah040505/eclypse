<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LearningNews;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LearningNewsController extends Controller
{
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

        'created_by' => 1,//session('admin_id')

    ]);

    return response()->json([
        'success' => true,
        'news' => $news
    ]);
}

public function update(Request $request, $id)
{
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

public function destroy($id)
{
    LearningNews::findOrFail($id)->delete();

    return response()->json([

        'success'=>true

    ]);
}
}