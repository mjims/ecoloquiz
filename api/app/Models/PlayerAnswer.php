<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PlayerAnswer extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'player_answers';

    protected $fillable = [
        'id',
        'player_id',
        'question_id',
        'answer_id',      // Single answer (for backward compatibility)
        'answer_ids',     // Multiple answers (JSON array)
        'is_correct',
        'points_earned',
        'answered_at',
    ];

    protected $casts = [
        'answer_ids' => 'array',  // Automatically cast JSON to/from array
        'is_correct' => 'boolean',
        'points_earned' => 'integer',
        'answered_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function player()
    {
        return $this->belongsTo(Player::class, 'player_id');
    }

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }

    public function answer()
    {
        return $this->belongsTo(AnswerOption::class, 'answer_id');
    }
}
