<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DebateSession extends Model
{
    protected $fillable = [
        'topic',
        'status',
        'pro_group_id',
        'con_group_id',
        'third_group_id'
    ];

    protected $casts = [
        'status' => 'string'
    ];

    /**
     * Get the PRO debate group
     */
    public function proGroup(): BelongsTo
    {
        return $this->belongsTo(DebateGroup::class, 'pro_group_id');
    }

    /**
     * Get the CON debate group
     */
    public function conGroup(): BelongsTo
    {
        return $this->belongsTo(DebateGroup::class, 'con_group_id');
    }

    /**
     * Get the THIRD debate group
     */
    public function thirdGroup(): BelongsTo
    {
        return $this->belongsTo(DebateGroup::class, 'third_group_id');
    }

    /**
     * Get all groups for this session
     */
    public function getAllGroups(): array
    {
        return array_filter([
            $this->proGroup,
            $this->conGroup,
            $this->thirdGroup
        ]);
    }

    /**
     * Get all arguments for this session
     */
    public function arguments(): HasMany
    {
        return $this->hasMany(DebateArgument::class, 'debate_session_id');
    }

    /**
     * Get PRO arguments
     */
    public function proArguments(): HasMany
    {
        return $this->hasMany(DebateArgument::class, 'debate_session_id')
            ->where('side', 'pro');
    }

    /**
     * Get CON arguments
     */
    public function conArguments(): HasMany
    {
        return $this->hasMany(DebateArgument::class, 'debate_session_id')
            ->where('side', 'con');
    }

    /**
     * Get kancing logs for this session
     */
    public function kancingLogs(): HasMany
    {
        return $this->hasMany(DebateKancingLog::class, 'debate_session_id');
    }

    /**
     * Start the debate session
     */
    public function start(): void
    {
        $this->status = 'active';
        $this->save();
    }

    /**
     * Finish the debate session
     */
    public function finish(): void
    {
        $this->status = 'finished';
        $this->save();
    }

    /**
     * Set debate groups
     */
    public function setGroups(?DebateGroup $proGroup, ?DebateGroup $conGroup, ?DebateGroup $thirdGroup = null): void
    {
        $this->pro_group_id = $proGroup?->id;
        $this->con_group_id = $conGroup?->id;
        $this->third_group_id = $thirdGroup?->id;
        $this->save();
    }

    /**
     * Check if session is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get current kancing status (supports 3 groups)
     */
    public function getKancingStatus(): array
    {
        $groups = [];

        // Add PRO group
        if ($this->proGroup) {
            $groups['pro'] = [
                'group' => [
                    'id' => $this->proGroup->id,
                    'name' => $this->proGroup->name,
                    'icon' => $this->proGroup->icon,
                    'kancing_count' => $this->proGroup->kancing_count,
                    'members' => $this->proGroup->members->map(fn($m) => [
                        'id' => $m->id,
                        'name' => $m->name
                    ])
                ],
                'kancing_count' => $this->proGroup->kancing_count
            ];
        }

        // Add CON group
        if ($this->conGroup) {
            $groups['con'] = [
                'group' => [
                    'id' => $this->conGroup->id,
                    'name' => $this->conGroup->name,
                    'icon' => $this->conGroup->icon,
                    'kancing_count' => $this->conGroup->kancing_count,
                    'members' => $this->conGroup->members->map(fn($m) => [
                        'id' => $m->id,
                        'name' => $m->name
                    ])
                ],
                'kancing_count' => $this->conGroup->kancing_count
            ];
        }

        // Add THIRD group
        if ($this->thirdGroup) {
            $groups['netral'] = [
                'group' => [
                    'id' => $this->thirdGroup->id,
                    'name' => $this->thirdGroup->name,
                    'icon' => $this->thirdGroup->icon,
                    'kancing_count' => $this->thirdGroup->kancing_count,
                    'members' => $this->thirdGroup->members->map(fn($m) => [
                        'id' => $m->id,
                        'name' => $m->name
                    ])
                ],
                'kancing_count' => $this->thirdGroup->kancing_count
            ];
        }

        return $groups;
    }
}
