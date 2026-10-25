<?php

namespace App\Models;

use Database\Factories\HellopassWebhookEventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HellopassWebhookEvent extends Model
{
    /** @use HasFactory<HellopassWebhookEventFactory> */
    use HasFactory;

    protected $fillable = [
        'event_id',
        'type',
        'bill_id',
        'reference',
        'status',
        'payload',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'processed_at' => 'datetime',
        ];
    }
}
