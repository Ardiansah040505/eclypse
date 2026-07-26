<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MateriQuestion extends Model
{
    protected $fillable = [
        'material_id',
        'question_text',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function material(): BelongsTo
    {
        return $this->belongsTo(LiterasiMaterial::class, 'material_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(MateriAnswer::class, 'question_id');
    }
}
