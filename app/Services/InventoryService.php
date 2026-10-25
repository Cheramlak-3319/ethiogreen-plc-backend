<?php

namespace App\Services;

use App\Enums\InventoryMovementType;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    public function adjust(
        Product $product,
        int $quantityDelta,
        InventoryMovementType $type,
        ?Model $reference = null,
        ?User $user = null,
        ?string $note = null,
    ): InventoryMovement {
        return DB::transaction(function () use ($product, $quantityDelta, $type, $reference, $user, $note): InventoryMovement {
            $lockedProduct = Product::query()
                ->whereKey($product->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $newBalance = $lockedProduct->stock_quantity + $quantityDelta;

            if ($newBalance < 0) {
                throw ValidationException::withMessages([
                    'quantity' => "Not enough stock for {$lockedProduct->name}.",
                ]);
            }

            $lockedProduct->update(['stock_quantity' => $newBalance]);

            $movement = $lockedProduct->inventoryMovements()->create([
                'user_id' => $user?->getKey(),
                'type' => $type,
                'quantity' => $quantityDelta,
                'balance_after' => $newBalance,
                'reference_type' => $reference?->getMorphClass(),
                'reference_id' => $reference?->getKey(),
                'note' => $note,
            ]);

            $product->setRawAttributes($lockedProduct->getAttributes(), true);

            return $movement;
        });
    }

    public function restoreOrder(Order $order, ?User $user = null): void
    {
        $alreadyRestored = InventoryMovement::query()
            ->where('reference_type', $order->getMorphClass())
            ->where('reference_id', $order->getKey())
            ->where('type', InventoryMovementType::Return)
            ->exists();

        if ($alreadyRestored) {
            return;
        }

        $order->loadMissing('items.product');

        foreach ($order->items as $item) {
            if ($item->product === null) {
                continue;
            }

            $this->adjust(
                $item->product,
                $item->quantity,
                InventoryMovementType::Return,
                $order,
                $user,
                "Stock restored for {$order->order_number}.",
            );
        }
    }
}
