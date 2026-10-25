<?php

namespace App\Http\Controllers\Erp;

use App\Enums\InventoryMovementType;
use App\Enums\PurchaseOrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\PurchaseOrderRequest;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Services\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventory,
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:draft,ordered,received,cancelled'],
        ]);

        return Inertia::render('Erp/PurchaseOrders/Index', [
            'purchaseOrders' => PurchaseOrder::query()
                ->with('supplier')
                ->withCount('items')
                ->when($filters['q'] ?? null, fn ($query, string $search) => $query->where('po_number', 'like', "%{$search}%"))
                ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'filters' => [
                'q' => $filters['q'] ?? '',
                'status' => $filters['status'] ?? '',
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Erp/PurchaseOrders/Create', [
            'suppliers' => Supplier::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'products' => Product::query()->active()->orderBy('name')->get(['id', 'name', 'sku', 'cost_price']),
        ]);
    }

    public function store(PurchaseOrderRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $purchaseOrder = DB::transaction(function () use ($validated, $request): PurchaseOrder {
            $purchaseOrder = PurchaseOrder::create([
                'po_number' => 'PO-'.now()->format('ymd').'-'.Str::upper(Str::random(5)),
                'supplier_id' => $validated['supplier_id'],
                'user_id' => $request->user()->getKey(),
                'status' => PurchaseOrderStatus::Ordered,
                'notes' => $validated['notes'] ?? null,
                'ordered_at' => now(),
                'total' => 0,
            ]);

            $total = 0.0;

            foreach ($validated['items'] as $item) {
                $product = Product::query()->findOrFail($item['product_id']);
                $lineTotal = round((float) $item['unit_cost'] * (int) $item['quantity'], 2);
                $total += $lineTotal;

                $purchaseOrder->items()->create([
                    'product_id' => $product->getKey(),
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'line_total' => $lineTotal,
                ]);
            }

            $purchaseOrder->update(['total' => $total]);

            return $purchaseOrder;
        });

        return redirect()
            ->route('erp.purchase-orders.show', $purchaseOrder)
            ->with('success', 'Purchase order created.');
    }

    public function show(PurchaseOrder $purchaseOrder): Response
    {
        $purchaseOrder->load(['items.product', 'supplier', 'user']);

        return Inertia::render('Erp/PurchaseOrders/Show', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    public function receive(Request $request, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        if ($purchaseOrder->status === PurchaseOrderStatus::Received) {
            return back()->with('error', 'This purchase order was already received.');
        }

        DB::transaction(function () use ($purchaseOrder, $request): void {
            $purchaseOrder->load('items.product');

            foreach ($purchaseOrder->items as $item) {
                $remaining = $item->quantity - $item->received_quantity;

                if ($remaining <= 0 || $item->product === null) {
                    continue;
                }

                $this->inventory->adjust(
                    $item->product,
                    $remaining,
                    InventoryMovementType::Purchase,
                    $purchaseOrder,
                    $request->user(),
                    "Received on {$purchaseOrder->po_number}.",
                );

                $item->update(['received_quantity' => $item->quantity]);
            }

            $purchaseOrder->update([
                'status' => PurchaseOrderStatus::Received,
                'received_at' => now(),
            ]);
        });

        return back()->with('success', 'Stock received and inventory updated.');
    }
}
