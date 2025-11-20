<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quiz extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'quizzes';

    protected $fillable = ['id', 'title', 'theme_id', 'level_id', 'max_score'];

    protected $casts = ['max_score' => 'integer', 'created_at' => 'datetime', 'updated_at' => 'datetime'];

    public function theme()
    {
        return $this->belongsTo(Theme::class, 'theme_id');
    }

    public function level()
    {
        return $this->belongsTo(Level::class, 'level_id');
    }

    public function questions()
    {
        return $this->hasMany(Question::class, 'quiz_id');
    }
}
