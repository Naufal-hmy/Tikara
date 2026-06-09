<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

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
    ];
}
