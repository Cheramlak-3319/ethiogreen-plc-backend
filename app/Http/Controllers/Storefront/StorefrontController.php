<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('Storefront/Home', [
            'featuredProducts' => Product::query()
                ->active()
                ->featured()
                ->with('category')
                ->latest()
                ->take(8)
                ->get(),
            'categories' => Category::query()
                ->where('is_active', true)
                ->withCount(['products' => fn ($query) => $query->where('is_active', true)])
                ->orderBy('name')
                ->get(),
            'stats' => [
                'products' => Product::query()->active()->count(),
                'orders' => Order::query()->count(),
            ],
        ]);
    }

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:255'],
            'sort' => ['nullable', 'in:newest,price_asc,price_desc,name'],
        ]);

        $products = Product::query()
            ->active()
            ->with('category')
            ->when($filters['q'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($filters['category'] ?? null, function ($query, string $slug): void {
                $query->whereHas('category', fn ($query) => $query->where('slug', $slug));
            })
            ->when(($filters['sort'] ?? 'newest') === 'price_asc', fn ($query) => $query->orderBy('price'))
            ->when(($filters['sort'] ?? 'newest') === 'price_desc', fn ($query) => $query->orderByDesc('price'))
            ->when(($filters['sort'] ?? 'newest') === 'name', fn ($query) => $query->orderBy('name'))
            ->when(($filters['sort'] ?? 'newest') === 'newest', fn ($query) => $query->latest())
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Product $product): array => [
                ...$product->toArray(),
                'category' => $product->category?->only(['id', 'name', 'slug']),
            ]);

        return Inertia::render('Storefront/Catalog', [
            'products' => $products,
            'categories' => Category::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']),
            'filters' => [
                'q' => $filters['q'] ?? '',
                'category' => $filters['category'] ?? '',
                'sort' => $filters['sort'] ?? 'newest',
            ],
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->is_active, 404);

        $product->load('category');

        return Inertia::render('Storefront/Product', [
            'product' => $product,
            'related' => Product::query()
                ->active()
                ->whereKeyNot($product->getKey())
                ->when($product->category_id, fn ($query) => $query->where('category_id', $product->category_id))
                ->take(4)
                ->get(),
        ]);
    }
}
