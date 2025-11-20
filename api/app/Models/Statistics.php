<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Statistics extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'statistics';

    protected $fillable = ['id', 'scope_type', 'scope_id', 'period_start', 'period_end', 'metrics', 'computed_at'];

    protected $casts = ['metrics' => 'array', 'period_start' => 'datetime', 'period_end' => 'datetime', 'computed_at' => 'datetime', 'created_at' => 'datetime', 'updated_at' => 'datetime'];
}
