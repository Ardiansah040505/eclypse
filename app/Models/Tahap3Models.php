<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PreparationQuestion extends Model
{
    protected $fillable = ['question_text', 'order'];
}

class PreparationAnswer extends Model
{
    protected $fillable = ['student_id', 'question_id', 'answer'];

    public function student() { return $this->belongsTo(User::class, 'student_id'); }
    public function question() { return $this->belongsTo(PreparationQuestion::class, 'question_id'); }
}

class DebateGroup extends Model
{
    protected $fillable = ['name', 'side', 'icon'];
}

class GroupMember extends Model
{
    protected $fillable = ['student_id', 'debate_group_id'];

    public function student() { return $this->belongsTo(User::class, 'student_id'); }
    public function group() { return $this->belongsTo(DebateGroup::class, 'debate_group_id'); }
}
