<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->where(function ($query) use ($request): void {
                $query->where('user_id', $request->user()->getKey())
                    ->orWhereHas('customer', fn ($query) => $query->where('user_id', $request->user()->getKey()));
            })
            ->withCount('items')
            ->latest()
            ->paginate(20);

        return response()->json($orders);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();

        abort_unless(
            $user->isStaff()
            || $order->user_id === $user->getKey()
            || $order->customer?->user_id === $user->getKey(),
            403,
        );

        return response()->json($order->load(['items', 'customer']));
    }
}
