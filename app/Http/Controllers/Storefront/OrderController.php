<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
    ) {}

    public function show(Request $request, Order $order): Response
    {
        $this->authorizeOrder($request, $order);

        $order->load(['items', 'customer']);

        return Inertia::render('Storefront/Order', [
            'order' => $order,
        ]);
    }

    public function verify(Request $request, Order $order): RedirectResponse
    {
        $this->authorizeOrder($request, $order);

        $result = $this->orders->verifyPayment($order);

        $message = match ($result['status']) {
            'paid' => 'Payment confirmed. Thank you!',
            'failed' => 'HellOOpass reported that this payment failed.',
            'not_found' => 'We could not find this bill at HellOOpass yet. Try again shortly.',
            'not_configured' => 'HellOOpass is not configured for this environment.',
            'conflict' => 'The bill did not match this order. Please contact support.',
            default => "Payment status is {$result['status']}.",
        };

        return back()->with(
            $result['status'] === 'paid' ? 'success' : 'error',
            $message,
        );
    }

    public function track(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'order_number' => ['required', 'string', 'max:64'],
            'phone' => ['required', 'string', 'max:32'],
        ]);

        $order = Order::query()
            ->where('order_number', $validated['order_number'])
            ->whereHas('customer', fn ($query) => $query->where('phone', $validated['phone']))
            ->first();

        if ($order === null) {
            return back()->with('error', 'No order matched that reference and phone number.');
        }

        $request->session()->put('recent_order_id', $order->getKey());

        return redirect()->route('orders.show', $order);
    }

    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->where(function ($query) use ($request): void {
                $query->where('user_id', $request->user()->getKey())
                    ->orWhereHas('customer', fn ($query) => $query->where('user_id', $request->user()->getKey()));
            })
            ->withCount('items')
            ->latest()
            ->paginate(10);

        return Inertia::render('Account/Orders', [
            'orders' => $orders,
        ]);
    }

    private function authorizeOrder(Request $request, Order $order): void
    {
        $user = $request->user();

        if ($user?->isStaff()) {
            return;
        }

        if ($user !== null && ($order->user_id === $user->getKey() || $order->customer?->user_id === $user->getKey())) {
            return;
        }

        if ((int) $request->session()->get('recent_order_id') === $order->getKey()) {
            return;
        }

        abort(403, 'You are not allowed to view this order.');
    }
}
