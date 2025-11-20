<?php

namespace App\Models\Traits;

use Illuminate\Support\Str;

trait UsesUuid
{
    /**
     * Boot function from Laravel.
     */
    protected static function bootUsesUuid()
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    /**
     * Tell Eloquent the primary key is not incrementing.
     */
    public function getIncrementing()
    {
        return false;
    }

    /**
     * Primary key type is string.
     */
    public function getKeyType()
    {
        return 'string';
    }
}
