<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CampaignRecipientLog extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'campaign_recipient_logs';

    protected $fillable = ['id', 'campaign_id', 'template_id', 'recipient_id', 'provider_message_id', 'status', 'error', 'sent_at'];

    protected $casts = ['sent_at' => 'datetime', 'created_at' => 'datetime', 'updated_at' => 'datetime'];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class, 'campaign_id');
    }

    public function template()
    {
        return $this->belongsTo(EmailTemplate::class, 'template_id');
    }

    public function recipient()
    {
        return $this->belongsTo(Recipient::class, 'recipient_id');
    }
}
