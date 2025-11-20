<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Allocation extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'allocations';

    protected $fillable = ['id', 'gift_id', 'player_id', 'allocated_at', 'status', 'redeemed_at'];

    protected $casts = ['allocated_at' => 'datetime', 'redeemed_at' => 'datetime', 'created_at' => 'datetime', 'updated_at' => 'datetime'];

    public function gift()
    {
        return $this->belongsTo(Gift::class, 'gift_id');
    }

    public function player()
    {
        return $this->belongsTo(Player::class, 'player_id');
    }
}
