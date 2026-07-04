<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsOption extends Model
{
    protected $fillable = [
        'news_question_id',
        'option_text',
        'is_correct'
    ];

    public function question()
    {
        return $this->belongsTo(NewsQuestion::class);
    }
}