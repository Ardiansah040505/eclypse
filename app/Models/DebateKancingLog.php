<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DebateKancingLog extends Model
{
    protected $fillable = [
        'debate_session_id',
        'debate_group_id',
        'reduced_by',
        'kancing_before',
        'kancing_after',
        'reason'
    ];

    protected $casts = [
        'kancing_before' => 'integer',
        'kancing_after' => 'integer'
    ];

    /**
     * Get the debate session
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(DebateSession::class, 'debate_session_id');
    }

    /**
     * Get the debate group
     */
    public function debateGroup(): BelongsTo
    {
        return $this->belongsTo(DebateGroup::class, 'debate_group_id');
    }

    /**
     * Get the user who reduced the kancing
     */
    public function reducedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reduced_by');
    }
}
