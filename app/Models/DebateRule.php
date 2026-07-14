<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DebateRule extends Model
{
    protected $fillable = ['title', 'description', 'order', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer'
    ];
}
