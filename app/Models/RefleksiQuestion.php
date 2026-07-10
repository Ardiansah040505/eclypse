<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefleksiQuestion extends Model
{
    protected $fillable = ['question_text', 'role', 'order'];

    // Role values: 'peneliti', 'aktivis', 'pedagang', 'all'
}
