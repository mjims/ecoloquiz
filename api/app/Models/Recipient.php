<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Recipient extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'recipients';

    protected $fillable = ['id', 'email', 'first_name', 'last_name', 'status', 'meta'];

    protected $casts = [
        'meta' => 'array',
        'created_at' => 'datetime', 'updated_at' => 'datetime',
    ];

    public function logs()
    {
        return $this->hasMany(CampaignRecipientLog::class, 'recipient_id');
    }
}
