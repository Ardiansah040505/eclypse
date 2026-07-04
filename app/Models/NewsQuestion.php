<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\NewsOption;

class NewsQuestion extends Model
{
    protected $fillable = [

        'learning_news_id',

        'question',

        'type',

        'order'

    ];

    public function news()
    {
        return $this->belongsTo(LearningNews::class);
    }

    public function options()
    {
    return $this->hasMany(NewsOption::class);
    }

}