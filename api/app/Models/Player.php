<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Player extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'players';

    protected $fillable = ['id', 'user_id', 'points', 'last_milestone', 'current_level', 'last_played', 'zone_id'];

    protected $casts = [
        'points' => 'integer',
        'last_milestone' => 'integer',
        'last_played' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function zone()
    {
        return $this->belongsTo(Zone::class, 'zone_id');
    }

    public function allocations()
    {
        return $this->hasMany(Allocation::class, 'player_id');
    }


    public function answers()
    {
        return $this->hasMany(PlayerAnswer::class, 'player_id');
    }

    public function theme_progress()
    {
        return $this->hasMany(PlayerThemeProgress::class, 'player_id');
    }
}
