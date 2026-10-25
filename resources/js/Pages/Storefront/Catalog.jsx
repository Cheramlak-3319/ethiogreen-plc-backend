import ProductCard from '@/Components/Storefront/ProductCard';
import EmptyState from '@/Components/Ui/EmptyState';
import Pagination from '@/Components/Ui/Pagination';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { formatNumber } from '@/lib/format';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Catalog({ products, categories, filters }) {
    const [search, setSearch] = useState(filters.q ?? '');

    const applyFilters = (overrides = {}) => {
        const params = {
            q: search || undefined,
            category: filters.category || undefined,
            sort: filters.sort || undefined,
            ...overrides,
        };

        router.get(route('shop.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <StorefrontLayout>
            <Head title="Shop fresh groceries" />

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                            Shop the catalogue
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {formatNumber(products.total)} products available for delivery.
                        </p>
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            applyFilters();
                        }}
                        className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto"
                    >
                        <div className="relative flex-1 sm:w-72">
                            <svg
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.8"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search products or SKU"
                                className="w-full rounded-lg border-gray-300 pl-9 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>

                        <select
                            value={filters.sort}
                            onChange={(event) => applyFilters({ sort: event.target.value })}
                            className="rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                        >
                            <option value="newest">Newest first</option>
                            <option value="price_asc">Price: low to high</option>
                            <option value="price_desc">Price: high to low</option>
                            <option value="name">Name A–Z</option>
                        </select>

                        <button
                            type="submit"
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => applyFilters({ category: undefined })}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            !filters.category
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        All categories
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => applyFilters({ category: category.slug })}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                filters.category === category.slug
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {products.data.length > 0 ? (
                <>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {products.data.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white">
                        <Pagination paginator={products} />
                    </div>
                </>
            ) : (
                <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white">
                    <EmptyState
                        title="No products matched your search"
                        description="Try a different keyword or clear the filters to see the full catalogue."
                    />
                </div>
            )}
        </StorefrontLayout>
    );
}
