<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LiterasiMaterial extends Model
{
    protected $fillable = [
        'title',
        'subtitle',
        'content',
        'order',
        'icon',
        'border_color',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function questions(): HasMany
    {
        return $this->hasMany(MateriQuestion::class, 'material_id');
    }
}
