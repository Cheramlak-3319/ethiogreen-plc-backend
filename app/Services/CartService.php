<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Validation\ValidationException;

class CartService
{
    private const SESSION_KEY = 'cart';

    /**
     * @return array<int, int>
     */
    public function raw(): array
    {
        $cart = session()->get(self::SESSION_KEY, []);

        if (! is_array($cart)) {
            return [];
        }

        return collect($cart)
            ->mapWithKeys(fn ($quantity, $productId): array => [(int) $productId => (int) $quantity])
            ->filter(fn (int $quantity, int $productId): bool => $productId > 0 && $quantity > 0)
            ->all();
    }

    /**
     * @return array<int, array{product: Product, quantity: int, line_total: float}>
     */
    public function items(): array
    {
        $cart = $this->raw();

        if ($cart === []) {
            return [];
        }

        $products = Product::query()
            ->active()
            ->whereIn('id', array_keys($cart))
            ->get()
            ->keyBy('id');

        $items = [];

        foreach ($cart as $productId => $quantity) {
            $product = $products->get($productId);

            if ($product === null) {
                continue;
            }

            $items[] = [
                'product' => $product,
                'quantity' => $quantity,
                'line_total' => round((float) $product->price * $quantity, 2),
            ];
        }

        return $items;
    }

    public function add(Product $product, int $quantity = 1): void
    {
        $this->ensureAvailable($product, $quantity);

        $cart = $this->raw();
        $cart[$product->getKey()] = min(
            ($cart[$product->getKey()] ?? 0) + $quantity,
            $product->stock_quantity,
        );

        $this->save($cart);
    }

    public function update(Product $product, int $quantity): void
    {
        if ($quantity <= 0) {
            $this->remove($product);

            return;
        }

        $this->ensureAvailable($product, $quantity);

        $cart = $this->raw();
        $cart[$product->getKey()] = $quantity;

        $this->save($cart);
    }

    public function remove(Product $product): void
    {
        $cart = $this->raw();
        unset($cart[$product->getKey()]);

        $this->save($cart);
    }

    public function clear(): void
    {
        session()->forget(self::SESSION_KEY);
    }

    public function count(): int
    {
        return array_sum($this->raw());
    }

    public function subtotal(): float
    {
        return collect($this->items())->sum('line_total');
    }

    /**
     * @param  array<int, int>  $cart
     */
    private function save(array $cart): void
    {
        session()->put(self::SESSION_KEY, $cart);
    }

    private function ensureAvailable(Product $product, int $quantity): void
    {
        if ($quantity < 1) {
            throw ValidationException::withMessages([
                'quantity' => 'Quantity must be at least one.',
            ]);
        }

        if (! $product->is_active || $product->stock_quantity < $quantity) {
            throw ValidationException::withMessages([
                'quantity' => "Only {$product->stock_quantity} of {$product->name} are available.",
            ]);
        }
    }
}
