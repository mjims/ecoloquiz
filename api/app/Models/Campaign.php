<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Campaign extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'campaigns';

    protected $fillable = [
        'id', 'name', 'template_id', 'target_query', 'status', 'scheduled_at', 'sent_at', 'created_by', 'total_recipients', 'sent_count',
    ];

    protected $casts = [
        'target_query' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'created_at' => 'datetime', 'updated_at' => 'datetime',
    ];

    public function template()
    {
        return $this->belongsTo(EmailTemplate::class, 'template_id');
    }

    public function logs()
    {
        return $this->hasMany(CampaignRecipientLog::class, 'campaign_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Resolve recipients according to target_query.
     * Example: target_query = ['zone_ids'=>[], 'level' => 'EXPERT']
     */
    public function resolveRecipients()
    {
        $query = Recipient::query();

        $q = $this->target_query ?? [];

        if (! empty($q['zone_ids']) && is_array($q['zone_ids'])) {
            // if recipients reference players or zones, adapt join accordingly
            $zoneIds = $q['zone_ids'];
            $playerIds = Player::whereIn('zone_id', $zoneIds)->pluck('id')->toArray();
            // If recipients are users emails - implement mapping. Here naive approach:
            $query->whereIn('id', function ($sub) {
                $sub->select('id')->from('recipients');
            });
        }

        // Add more filters (level, tags...) as needed

        return $query->get();
    }
}
