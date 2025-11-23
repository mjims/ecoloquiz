<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Gift extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'gifts';

    protected $fillable = [
        'id',
        'code',
        'name',
        'company_name',
        'siret',
        'contact_name',
        'contact_phone',
        'contact_email',
        'start_date',
        'end_date',
        'level_id',
        'image_url',
        'description',
        'total_quantity',
        'metadata'
    ];

    protected $casts = [
        'total_quantity' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function allocations()
    {
        return $this->hasMany(Allocation::class, 'gift_id');
    }

    public function level()
    {
        return $this->belongsTo(Level::class);
    }

    // Helper pour récupérer les zones depuis metadata
    public function getZonesAttribute()
    {
        return $this->metadata['zones'] ?? [];
    }

    // Helper pour récupérer le nombre de cadeaux gagnés (alloués)
    public function getWonCountAttribute()
    {
        return $this->allocations()->count();
    }

    // Helper pour récupérer le nombre de cadeaux restants
    public function getRemainingCountAttribute()
    {
        return $this->total_quantity - $this->won_count;
    }
}
