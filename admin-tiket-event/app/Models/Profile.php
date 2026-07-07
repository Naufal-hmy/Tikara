<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Profile extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $keyType = 'string';
    public $incrementing = false;
    const CREATED_AT = null;

    protected $fillable = [
        'id',
        'full_name',
        'balance',
        'role',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
