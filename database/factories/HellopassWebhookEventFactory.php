<?php

namespace Database\Factories;

use App\Models\HellopassWebhookEvent;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<HellopassWebhookEvent>
 */
class HellopassWebhookEventFactory extends Factory
{
    public function definition(): array
    {
        return [
            'event_id' => 'evt_'.Str::random(20),
            'type' => 'success',
            'bill_id' => 'BILL'.fake()->numerify('########'),
            'reference' => 'ORD-'.fake()->numerify('########'),
            'status' => 'success',
            'payload' => [],
            'processed_at' => now(),
        ];
    }
}
