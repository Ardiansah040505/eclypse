<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class DebateGroup extends Model
{
    protected $fillable = [
        'name',
        'side',
        'icon',
        'kancing_count'
    ];

    protected $casts = [
        'kancing_count' => 'integer'
    ];

    /**
     * Get the members of this debate group
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_members', 'debate_group_id', 'student_id')
            ->withTimestamps();
    }

    /**
     * Get arguments from this debate group
     */
    public function arguments(): HasMany
    {
        return $this->hasMany(DebateArgument::class, 'debate_group_id');
    }

    /**
     * Get kancing change logs for this group
     */
    public function kancingLogs(): HasMany
    {
        return $this->hasMany(DebateKancingLog::class, 'debate_group_id');
    }

    /**
     * Reduce kancing by 1
     */
    public function reduceKancing(User $reducedBy = null, string $reason = 'argument_submitted', ?int $sessionId = null): bool
    {
        if ($this->kancing_count <= 0) {
            return false;
        }

        $before = $this->kancing_count;
        $this->kancing_count--;
        $this->save();

        // Log the change
        DebateKancingLog::create([
            'debate_session_id' => $sessionId,
            'debate_group_id' => $this->id,
            'reduced_by' => $reducedBy?->id,
            'kancing_before' => $before,
            'kancing_after' => $this->kancing_count,
            'reason' => $reason
        ]);

        return true;
    }

    /**
     * Reset kancing to number of groups
     */
    public function resetKancing(?int $sessionId = null, ?int $groupCount = null): void
    {
        $before = $this->kancing_count;
        $kancingValue = $groupCount ?? 5;
        $this->kancing_count = $kancingValue;
        $this->save();

        DebateKancingLog::create([
            'debate_session_id' => $sessionId,
            'debate_group_id' => $this->id,
            'reduced_by' => null,
            'kancing_before' => $before,
            'kancing_after' => $kancingValue,
            'reason' => 'reset'
        ]);
    }
}
