<?php

namespace App\Http\Controllers\Erp;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\HellopassWebhookEvent;
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

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:pending,processing,completed,cancelled'],
            'payment' => ['nullable', 'in:unpaid,pending,paid,failed,refunded'],
        ]);

        $orders = Order::query()
            ->with('customer')
            ->withCount('items')
            ->when($filters['q'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('order_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($query) use ($search): void {
                            $query->where('name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['payment'] ?? null, fn ($query, string $payment) => $query->where('payment_status', $payment))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Erp/Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'q' => $filters['q'] ?? '',
                'status' => $filters['status'] ?? '',
                'payment' => $filters['payment'] ?? '',
            ],
            'summary' => [
                'open' => Order::query()->open()->count(),
                'awaiting_payment' => Order::query()
                    ->whereIn('payment_status', [PaymentStatus::Unpaid, PaymentStatus::Pending])
                    ->count(),
                'revenue' => (float) Order::query()->paid()->sum('total'),
            ],
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['items.product', 'customer', 'user']);

        return Inertia::render('Erp/Orders/Show', [
            'order' => $order,
            'webhookEvents' => $order->hellopass_bill_id === null
                ? []
                : HellopassWebhookEvent::query()
                    ->where('bill_id', $order->hellopass_bill_id)
                    ->orWhere('reference', $order->hellopass_reference)
                    ->latest()
                    ->take(10)
                    ->get(),
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'in:processing,completed,cancelled,paid'],
        ]);

        match ($validated['action']) {
            'paid' => $this->orders->markPaid($order),
            'processing' => $order->update(['status' => OrderStatus::Processing]),
            'completed' => $this->orders->markCompleted($order),
            'cancelled' => $this->orders->cancel($order, $request->user()),
        };

        return back()->with('success', 'Order updated.');
    }

    public function verify(Order $order): RedirectResponse
    {
        $result = $this->orders->verifyPayment($order);

        return back()->with(
            $result['status'] === 'paid' ? 'success' : 'error',
            match ($result['status']) {
                'paid' => 'HellOOpass confirmed the payment.',
                'failed' => 'HellOOpass reported the bill as failed.',
                'not_found' => 'The bill was not found in the HellOOpass invoice list.',
                'not_configured' => 'HellOOpass is not configured.',
                'conflict' => 'The invoice did not match this order. Check the payment error for details.',
                default => "HellOOpass status: {$result['status']}.",
            },
        );
    }
}
