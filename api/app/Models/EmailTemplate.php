<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmailTemplate extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'email_templates';

    protected $fillable = [
        'id', 'name', 'code', 'type', 'target_types', 'subject', 'sender_name', 'sender_email',
        'to', 'cc', 'bcc', 'body_html', 'body_text', 'variables_schema', 'is_active', 'created_by', 'email_type_id',
    ];

    protected $casts = [
        'variables_schema' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime', 'updated_at' => 'datetime',
    ];

    public function revisions()
    {
        return $this->hasMany(EmailTemplateRevision::class, 'template_id');
    }

    public function campaigns()
    {
        return $this->hasMany(Campaign::class, 'template_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function emailType()
    {
        return $this->belongsTo(EmailType::class, 'email_type_id');
    }

    /**
     * Render the template with a context (array) - simple implementation example.
     * You can swap for Blade, Mustache, Handlebars, etc.
     */
    public function render(array $context = []): array
    {
        $subject = $this->subject;
        $bodyHtml = $this->body_html;
        $bodyText = $this->body_text;

        foreach ($context as $k => $v) {
            $placeholder = "{{{$k}}}";
            $subject = str_replace($placeholder, $v, $subject);
            $bodyHtml = str_replace($placeholder, $v, $bodyHtml);
            $bodyText = str_replace($placeholder, $v, $bodyText);
        }

        return [
            'subject' => $subject,
            'html' => $bodyHtml,
            'text' => $bodyText,
        ];
    }
}
