<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlayerThemeProgress extends Model
{
    use HasFactory, UsesUuid;

    protected $table = 'player_theme_progress';

    protected $fillable = [
        'player_id',
        'theme_id',
        'current_level_id',
        'last_played_at',
    ];

    protected $casts = [
        'last_played_at' => 'datetime',
    ];

    /**
     * Get the player that owns this progress
     */
    public function player()
    {
        return $this->belongsTo(Player::class);
    }

    /**
     * Get the theme for this progress
     */
    public function theme()
    {
        return $this->belongsTo(Theme::class);
    }

    /**
     * Get the current level for this progress
     */
    public function currentLevel()
    {
        return $this->belongsTo(Level::class, 'current_level_id');
    }
}
