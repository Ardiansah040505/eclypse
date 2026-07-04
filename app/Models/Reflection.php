<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reflection extends Model
{
    protected $fillable = [
        'user_id',
        'question',
        'answer',
        'answered_by',
        'answered_at'
    ];

    protected $casts = [
        'answered_at' => 'datetime'
    ];

    /**
     * Get the user who asked the question
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the admin who answered the question
     */
    public function answeredByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'answered_by');
    }

    /**
     * Check if question has been answered
     */
    public function isAnswered(): bool
    {
        return !empty($this->answer);
    }
}
