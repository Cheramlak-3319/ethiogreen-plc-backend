<?php

namespace App\Http\Controllers\Erp;

use App\Enums\InventoryMovementType;
use App\Http\Controllers\Controller;
use App\Http\Requests\AdjustStockRequest;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Services\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventory,
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'product' => ['nullable', 'integer'],
            'type' => ['nullable', 'in:purchase,sale,adjustment,return'],
        ]);

        return Inertia::render('Erp/Inventory/Index', [
            'movements' => InventoryMovement::query()
                ->with(['product:id,name,sku', 'user:id,name'])
                ->when($filters['product'] ?? null, fn ($query, $productId) => $query->where('product_id', $productId))
                ->when($filters['type'] ?? null, fn ($query, string $type) => $query->where('type', $type))
                ->latest()
                ->paginate(25)
                ->withQueryString(),
            'products' => Product::query()
                ->with('category:id,name')
                ->orderBy('name')
                ->get(['id', 'category_id', 'name', 'sku', 'stock_quantity', 'reorder_level', 'unit']),
            'filters' => [
                'product' => $filters['product'] ?? '',
                'type' => $filters['type'] ?? '',
            ],
        ]);
    }

    public function adjust(AdjustStockRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $product = Product::query()->findOrFail($validated['product_id']);

        $this->inventory->adjust(
            $product,
            (int) $validated['quantity'],
            InventoryMovementType::Adjustment,
            null,
            $request->user(),
            $validated['note'] ?? 'Manual inventory adjustment.',
        );

        return back()->with('success', "Stock for {$product->name} updated.");
    }
}
