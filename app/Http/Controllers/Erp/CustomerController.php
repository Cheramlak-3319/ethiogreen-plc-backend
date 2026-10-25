<?php

namespace App\Http\Controllers\Erp;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        return Inertia::render('Erp/Customers/Index', [
            'customers' => Customer::query()
                ->withCount('orders')
                ->withSum('orders as lifetime_value', 'total')
                ->when($filters['q'] ?? null, function ($query, string $search): void {
                    $query->where(function ($query) use ($search): void {
                        $query->where('name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'filters' => ['q' => $filters['q'] ?? ''],
        ]);
    }

    public function show(Customer $customer): Response
    {
        $customer->load(['orders' => fn ($query) => $query->latest()->take(20)]);

        return Inertia::render('Erp/Customers/Show', [
            'customer' => $customer,
            'stats' => [
                'orders' => $customer->orders()->count(),
                'lifetime_value' => (float) $customer->orders()->paid()->sum('total'),
            ],
        ]);
    }
}
