<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearningNews extends Model
{
    protected $fillable = [

        'title',
        'slug',
        'thumbnail',
        'content',
        'status',
        'created_by'

    ];


    public function questions()
    {
        return $this->hasMany(NewsQuestion::class);
    }

}
