<?php

namespace Database\Factories;

use App\Enums\InventoryMovementType;
use App\Models\InventoryMovement;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryMovement>
 */
class InventoryMovementFactory extends Factory
{
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 25);

        return [
            'product_id' => Product::factory(),
            'type' => InventoryMovementType::Adjustment,
            'quantity' => $quantity,
            'balance_after' => $quantity,
            'note' => fake()->sentence(),
        ];
    }
}
