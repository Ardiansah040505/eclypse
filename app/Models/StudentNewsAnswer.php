<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentNewsAnswer extends Model
{
    protected $fillable = [
        'student_id',
        'news_id',
        'answers',
        'answered_count',
        'total_questions',
        'is_completed'
    ];

    protected $casts = [
        'answers' => 'array',
        'is_completed' => 'boolean'
    ];

    // Relasi ke student
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // Relasi ke berita
    public function news(): BelongsTo
    {
        return $this->belongsTo(LearningNews::class, 'news_id');
    }

    // Cek apakah semua soal sudah dijawab
    public function checkCompletion(): bool
    {
        return $this->answered_count >= $this->total_questions;
    }
}
