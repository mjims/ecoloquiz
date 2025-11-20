<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AnswerOption extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'answer_options';

    protected $fillable = ['id', 'question_id', 'text', 'is_correct', 'extra'];

    protected $casts = ['is_correct' => 'boolean', 'created_at' => 'datetime', 'updated_at' => 'datetime'];

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }
}
