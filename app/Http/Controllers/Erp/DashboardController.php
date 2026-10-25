<?php

namespace App\Http\Controllers\Erp;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $paidRevenue = (float) Order::query()->paid()->sum('total');
        $monthRevenue = (float) Order::query()
            ->paid()
            ->where('paid_at', '>=', now()->startOfMonth())
            ->sum('total');

        $salesTrend = Order::query()
            ->paid()
            ->where('paid_at', '>=', now()->subDays(6)->startOfDay())
            ->get(['total', 'paid_at'])
            ->groupBy(fn (Order $order): string => $order->paid_at->toDateString())
            ->map(fn ($orders): float => (float) $orders->sum('total'));

        $trend = collect(range(6, 0))
            ->map(function (int $daysAgo) use ($salesTrend): array {
                $date = now()->subDays($daysAgo)->toDateString();

                return [
                    'date' => $date,
                    'label' => Carbon::parse($date)->format('D'),
                    'total' => $salesTrend->get($date, 0),
                ];
            })
            ->values();

        $topProducts = OrderItem::query()
            ->selectRaw('product_name, SUM(quantity) as sold, SUM(line_total) as revenue')
            ->whereHas('order', fn ($query) => $query->paid())
            ->groupBy('product_name')
            ->orderByDesc('sold')
            ->take(5)
            ->get();

        return Inertia::render('Erp/Dashboard', [
            'stats' => [
                'revenue' => $paidRevenue,
                'month_revenue' => $monthRevenue,
                'orders_today' => Order::query()->whereDate('created_at', today())->count(),
                'open_orders' => Order::query()->open()->count(),
                'pending_payments' => (float) Order::query()
                    ->whereIn('payment_status', [PaymentStatus::Unpaid, PaymentStatus::Pending])
                    ->where('status', '!=', OrderStatus::Cancelled)
                    ->sum('total'),
                'low_stock' => Product::query()->active()->lowStock()->count(),
                'customers' => Customer::query()->count(),
                'products' => Product::query()->active()->count(),
            ],
            'trend' => $trend,
            'recentOrders' => Order::query()
                ->with('customer')
                ->latest()
                ->take(8)
                ->get(),
            'lowStockProducts' => Product::query()
                ->active()
                ->lowStock()
                ->orderBy('stock_quantity')
                ->take(6)
                ->get(['id', 'name', 'sku', 'stock_quantity', 'reorder_level', 'unit']),
            'topProducts' => $topProducts,
        ]);
    }
}
