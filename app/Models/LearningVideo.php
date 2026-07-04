<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearningVideo extends Model
{
    protected $fillable = [
        'title',
        'youtube_url',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];
}
