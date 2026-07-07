<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Event extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    const UPDATED_AT = null;

    public function eo()
    {
        return $this->belongsTo(Profile::class, 'eo_id', 'id');
    }

    protected $fillable = [
        'title',
        'category',
        'date',
        'time',
        'location',
        'address_detail',
        'price',
        'image_url',
        'description',
        'status',
        'remaining_quota',
        'total_quota',
        'eo_id',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
