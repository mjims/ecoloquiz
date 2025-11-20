<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Question extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'questions';

    protected $fillable = ['id', 'quiz_id', 'text', 'type', 'explanation', 'image_url', 'success_rate'];

    protected $casts = ['success_rate' => 'integer', 'created_at' => 'datetime', 'updated_at' => 'datetime'];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }

    public function options()
    {
        return $this->hasMany(AnswerOption::class, 'question_id');
    }
}
