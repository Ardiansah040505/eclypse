<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsQuestion;
use Illuminate\Http\Request;
use App\Models\NewsOption;

class NewsQuestionController extends Controller
{
    public function store(Request $request, $newsId)
{
    $type = $request->type == 'mc'
        ? 'multiple_choice'
        : 'essay';

    $question = NewsQuestion::create([
        'learning_news_id' => $newsId,
        'question' => $request->question,
        'type' => $type,
        'order' => $request->order ?? 1
    ]);

    if ($type == 'multiple_choice') {

        foreach ($request->options as $index => $option) {

            NewsOption::create([
                'news_question_id' => $question->id,
                'option_text' => $option,
                'is_correct' => ($index == $request->answer)
            ]);

        }

    }

    return response()->json([
        'success' => true
    ]);
}

    public function update(Request $request, $id)
    {
        $question = NewsQuestion::find($id);
        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Pertanyaan tidak ditemukan'
            ], 404);
        }

        $type = $request->type == 'mc'
            ? 'multiple_choice'
            : 'essay';

        $question->update([
            'question' => $request->question,
            'type' => $type,
            'order' => $request->order ?? $question->order
        ]);

        // Update options for multiple choice
        if ($type == 'multiple_choice') {
            // Delete existing options
            NewsOption::where('news_question_id', $id)->delete();

            // Create new options
            foreach ($request->options as $index => $option) {
                NewsOption::create([
                    'news_question_id' => $id,
                    'option_text' => $option,
                    'is_correct' => ($index == $request->answer)
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Pertanyaan berhasil diperbarui!'
        ]);
    }

    public function destroy($id)
    {
        NewsQuestion::destroy($id);

        return response()->json([
            'success' => true
        ]);
    }
}