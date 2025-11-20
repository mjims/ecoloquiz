<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmailTemplateRevision extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'email_template_revisions';

    protected $fillable = ['id', 'template_id', 'version', 'subject', 'body_html', 'body_text', 'editor_id', 'note'];

    protected $casts = ['created_at' => 'datetime'];

    public function template()
    {
        return $this->belongsTo(EmailTemplate::class, 'template_id');
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'editor_id');
    }
}
