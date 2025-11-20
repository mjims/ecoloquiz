<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmailWebhookEvent extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'email_webhook_events';

    protected $fillable = ['id', 'provider', 'event_type', 'payload', 'received_at'];

    protected $casts = ['payload' => 'array', 'received_at' => 'datetime', 'created_at' => 'datetime', 'updated_at' => 'datetime'];

    public function process()
    {
        // Implémentation : mapping events -> update CampaignRecipientLog and Recipient status
        // exemple: if event_type == 'hard_bounce' => set recipient.status = 'BOUNCED'
    }
}
