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
        'con_group_id'
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
    public function setGroups(?DebateGroup $proGroup, ?DebateGroup $conGroup): void
    {
        $this->pro_group_id = $proGroup?->id;
        $this->con_group_id = $conGroup?->id;
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
     * Get current kancing status
     */
    public function getKancingStatus(): array
    {
        return [
            'pro' => [
                'group' => $this->proGroup ? [
                    'id' => $this->proGroup->id,
                    'name' => $this->proGroup->name,
                    'icon' => $this->proGroup->icon,
                    'kancing_count' => $this->proGroup->kancing_count,
                    'members' => $this->proGroup->members->map(fn($m) => [
                        'id' => $m->id,
                        'name' => $m->name
                    ])
                ] : null,
                'kancing_count' => $this->proGroup?->kancing_count ?? 5
            ],
            'con' => [
                'group' => $this->conGroup ? [
                    'id' => $this->conGroup->id,
                    'name' => $this->conGroup->name,
                    'icon' => $this->conGroup->icon,
                    'kancing_count' => $this->conGroup->kancing_count,
                    'members' => $this->conGroup->members->map(fn($m) => [
                        'id' => $m->id,
                        'name' => $m->name
                    ])
                ] : null,
                'kancing_count' => $this->conGroup?->kancing_count ?? 5
            ]
        ];
    }
}
