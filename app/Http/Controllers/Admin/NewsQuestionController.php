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

    public function destroy($id)
    {
        NewsQuestion::destroy($id);

        return response()->json([

            'success' => true

        ]);
    }
}