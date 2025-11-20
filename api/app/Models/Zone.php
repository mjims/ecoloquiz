<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Zone extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'zones';

    protected $fillable = [
        'id', 'type', 'name', 'code_postal', 'parent_zone_id', 'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function parent()
    {
        return $this->belongsTo(Zone::class, 'parent_zone_id');
    }

    public function children()
    {
        return $this->hasMany(Zone::class, 'parent_zone_id');
    }

    public function players()
    {
        return $this->hasMany(Player::class, 'zone_id');
    }

    public function companies()
    {
        return $this->hasMany(Company::class); // optional mapping via foreign in companies if needed
    }
}
