<?php

namespace Database\Factories;

use App\Enums\PurchaseOrderStatus;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    public function definition(): array
    {
        $total = fake()->randomFloat(2, 1000, 20000);

        return [
            'po_number' => 'PO-'.now()->format('ymd').'-'.Str::upper(Str::random(5)),
            'supplier_id' => Supplier::factory(),
            'status' => PurchaseOrderStatus::Ordered,
            'total' => $total,
            'ordered_at' => now(),
        ];
    }
}
