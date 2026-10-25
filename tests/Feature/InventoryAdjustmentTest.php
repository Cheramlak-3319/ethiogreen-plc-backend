<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryAdjustmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_adjust_stock(): void
    {
        $staff = User::factory()->staff()->create();
        $product = Product::factory()->create(['stock_quantity' => 10]);

        $response = $this->actingAs($staff)->post('/erp/inventory/adjust', [
            'product_id' => $product->getKey(),
            'quantity' => 5,
            'note' => 'Received from supplier.',
        ]);

        $response->assertRedirect();

        $this->assertSame(15, $product->fresh()->stock_quantity);
        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $product->getKey(),
            'user_id' => $staff->getKey(),
            'type' => 'adjustment',
            'quantity' => 5,
            'balance_after' => 15,
            'note' => 'Received from supplier.',
        ]);
    }

    public function test_stock_cannot_be_adjusted_below_zero(): void
    {
        $staff = User::factory()->staff()->create();
        $product = Product::factory()->create(['stock_quantity' => 10]);

        $response = $this->actingAs($staff)->post('/erp/inventory/adjust', [
            'product_id' => $product->getKey(),
            'quantity' => -20,
        ]);

        $response->assertSessionHasErrors('quantity');

        $this->assertSame(10, $product->fresh()->stock_quantity);
        $this->assertDatabaseCount('inventory_movements', 0);
    }
}
