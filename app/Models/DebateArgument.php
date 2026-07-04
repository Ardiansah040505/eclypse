<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DebateArgument extends Model
{
    protected $fillable = [
        'debate_session_id',
        'user_id',
        'debate_group_id',
        'content',
        'side'
    ];

    /**
     * Get the debate session
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(DebateSession::class, 'debate_session_id');
    }

    /**
     * Get the user who made this argument
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the debate group
     */
    public function debateGroup(): BelongsTo
    {
        return $this->belongsTo(DebateGroup::class, 'debate_group_id');
    }
}
