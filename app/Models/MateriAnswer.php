<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MateriAnswer extends Model
{
    protected $fillable = [
        'question_id',
        'student_id',
        'answer',
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(MateriQuestion::class, 'question_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
