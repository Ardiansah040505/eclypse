<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupChat extends Model
{
    protected $fillable = ['debate_group_id', 'student_id', 'message'];

    public function group()
    {
        return $this->belongsTo(DebateGroup::class, 'debate_group_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
