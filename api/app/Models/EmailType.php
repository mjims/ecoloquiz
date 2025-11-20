<?php

namespace App\Models;

use App\Models\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmailType extends Model
{
    use HasFactory, SoftDeletes, UsesUuid;

    protected $table = 'email_types';

    protected $fillable = [
        'id', 'code', 'name', 'description', 'is_system', 'is_active',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function emailTemplates()
    {
        return $this->hasMany(EmailTemplate::class, 'email_type_id');
    }

    // Pour les types système, il ne peut y avoir qu'un seul template
    public function emailTemplate()
    {
        return $this->hasOne(EmailTemplate::class, 'email_type_id');
    }

    /**
     * Types système prédéfinis
     */
    public static function getSystemTypes()
    {
        return [
            [
                'code' => 'REGISTRATION',
                'name' => 'Confirmation d\'inscription',
                'description' => 'Email envoyé automatiquement lors de l\'inscription d\'un nouvel utilisateur',
                'is_system' => true,
            ],
            [
                'code' => 'PASSWORD_RESET',
                'name' => 'Réinitialisation de mot de passe',
                'description' => 'Email envoyé lors de la demande de réinitialisation de mot de passe',
                'is_system' => true,
            ],
            [
                'code' => 'LEVEL_UP',
                'name' => 'Passage de niveau',
                'description' => 'Email envoyé lorsqu\'un joueur passe au niveau supérieur',
                'is_system' => true,
            ],
            [
                'code' => 'GIFT_WON',
                'name' => 'Cadeau gagné',
                'description' => 'Email envoyé lorsqu\'un joueur gagne un cadeau',
                'is_system' => true,
            ],
            [
                'code' => 'WELCOME',
                'name' => 'Bienvenue',
                'description' => 'Email de bienvenue envoyé après validation de l\'inscription',
                'is_system' => true,
            ],
        ];
    }
}
