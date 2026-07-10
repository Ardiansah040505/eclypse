<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PreparationQuestion extends Model
{
    protected $fillable = ['question_text', 'order', 'role'];

    // Role values: 'peneliti', 'aktivis', 'pedagang', 'all'
    public function scopeForRole($query, $role)
    {
        return $query->where(function($q) use ($role) {
            $q->where('role', $role)
              ->orWhere('role', 'all');
        });
    }
}
