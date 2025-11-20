<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Theme extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'themes';

    protected $fillable = ['id', 'title', 'description'];

    protected $casts = ['created_at' => 'datetime', 'updated_at' => 'datetime'];

    public function quizzes()
    {
        return $this->hasMany(Quiz::class, 'theme_id');
    }
}
