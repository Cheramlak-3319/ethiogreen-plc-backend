<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
    ) {}

    public function store(CheckoutRequest $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cart = collect($validated['items'])
            ->mapWithKeys(fn (array $item): array => [(int) $item['product_id'] => (int) $item['quantity']])
            ->all();

        $order = $this->orders->checkout($request->validated(), $cart, $request->user());

        return response()->json([
            'message' => 'Order created.',
            'order' => $order,
        ], 201);
    }
}
