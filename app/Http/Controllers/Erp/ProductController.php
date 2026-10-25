<?php

namespace App\Http\Controllers\Erp;

use App\Enums\InventoryMovementType;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Services\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventory,
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'integer'],
            'stock' => ['nullable', 'in:low,out'],
        ]);

        $products = Product::query()
            ->with('category')
            ->when($filters['q'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($filters['category'] ?? null, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->when(($filters['stock'] ?? null) === 'low', fn ($query) => $query->lowStock())
            ->when(($filters['stock'] ?? null) === 'out', fn ($query) => $query->where('stock_quantity', 0))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Erp/Products/Index', [
            'products' => $products,
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'filters' => [
                'q' => $filters['q'] ?? '',
                'category' => $filters['category'] ?? '',
                'stock' => $filters['stock'] ?? '',
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Erp/Products/Form', [
            'product' => null,
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $data = $this->prepareData($request);
        $initialStock = (int) ($request->validated('stock_quantity') ?? 0);
        $data['stock_quantity'] = 0;

        $product = Product::create($data);

        if ($initialStock > 0) {
            $this->inventory->adjust(
                $product,
                $initialStock,
                InventoryMovementType::Adjustment,
                null,
                $request->user(),
                'Initial stock on product creation.',
            );
        }

        return redirect()
            ->route('erp.products.index')
            ->with('success', "{$product->name} created.");
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('Erp/Products/Form', [
            'product' => $product,
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $data = $this->prepareData($request);
        $newStock = $request->validated('stock_quantity');
        unset($data['stock_quantity']);

        $product->update($data);

        if ($newStock !== null) {
            $difference = (int) $newStock - $product->stock_quantity;

            if ($difference !== 0) {
                $this->inventory->adjust(
                    $product,
                    $difference,
                    InventoryMovementType::Adjustment,
                    null,
                    $request->user(),
                    'Stock adjusted while editing the product.',
                );
            }
        }

        return redirect()
            ->route('erp.products.index')
            ->with('success', "{$product->name} updated.");
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return redirect()
            ->route('erp.products.index')
            ->with('success', "{$product->name} archived.");
    }

    /**
     * @return array<string, mixed>
     */
    private function prepareData(ProductRequest|UpdateProductRequest $request): array
    {
        $data = $request->validated();

        $data['slug'] = filled($data['slug'] ?? null)
            ? Str::slug($data['slug'])
            : $this->uniqueSlug($data['name'], $request->route('product'));
        $data['sku'] = filled($data['sku'] ?? null)
            ? Str::upper($data['sku'])
            : $this->uniqueSku();
        $data['unit'] = $data['unit'] ?? 'pcs';
        $data['cost_price'] = $data['cost_price'] ?? 0;
        $data['reorder_level'] = $data['reorder_level'] ?? 5;
        $data['is_active'] = $request->boolean('is_active', true);
        $data['is_featured'] = $request->boolean('is_featured');

        if ($request->hasFile('image')) {
            $oldImage = $request->route('product')?->image;
            $data['image'] = $request->file('image')->store('products', 'public');

            if ($oldImage) {
                Storage::disk('public')->delete($oldImage);
            }
        } else {
            unset($data['image']);
        }

        return $data;
    }

    private function uniqueSlug(string $name, ?Product $ignore = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 2;

        while (Product::withTrashed()->where('slug', $slug)->when($ignore, fn ($query) => $query->whereKeyNot($ignore->getKey()))->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    private function uniqueSku(): string
    {
        do {
            $sku = 'SKU-'.Str::upper(Str::random(8));
        } while (Product::withTrashed()->where('sku', $sku)->exists());

        return $sku;
    }
}
