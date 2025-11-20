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

    protected $fillable = ['id', 'name', 'company_name', 'siret', 'image_url', 'description', 'quantity', 'expiration_date', 'metadata'];

    protected $casts = [
        'quantity' => 'integer',
        'expiration_date' => 'date',
        'metadata' => 'array',
        'created_at' => 'datetime', 'updated_at' => 'datetime',
    ];

    public function allocations()
    {
        return $this->hasMany(Allocation::class, 'gift_id');
    }
}
