import EmptyState from '@/Components/Ui/EmptyState';
import PageHeader from '@/Components/Ui/PageHeader';
import Pagination from '@/Components/Ui/Pagination';
import ErpLayout from '@/Layouts/ErpLayout';
import { formatMoney, formatNumber } from '@/lib/format';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ProductsIndex({ products, categories, filters }) {
    const [search, setSearch] = useState(filters.q ?? '');

    const applyFilters = (overrides = {}) => {
        router.get(
            route('erp.products.index'),
            {
                q: search || undefined,
                category: filters.category || undefined,
                stock: filters.stock || undefined,
                ...overrides,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const destroy = (product) => {
        if (window.confirm(`Archive ${product.name}? It will be removed from the storefront.`)) {
            router.delete(route('erp.products.destroy', product.id), { preserveScroll: true });
        }
    };

    return (
        <ErpLayout>
            <Head title="Products" />

            <PageHeader
                title="Products"
                description="Manage the catalogue, pricing and stock levels shown in the storefront."
                actions={
                    <Link
                        href={route('erp.products.create')}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                        Add product
                    </Link>
                }
            />

            <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            applyFilters();
                        }}
                        className="flex flex-1 flex-col gap-2 sm:flex-row"
                    >
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by name or SKU"
                            className="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500 sm:max-w-xs"
                        />

                        <select
                            value={filters.category}
                            onChange={(event) => applyFilters({ category: event.target.value || undefined })}
                            className="rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                        >
                            <option value="">All categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.stock}
                            onChange={(event) => applyFilters({ stock: event.target.value || undefined })}
                            className="rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                        >
                            <option value="">All stock</option>
                            <option value="low">Low stock</option>
                            <option value="out">Out of stock</option>
                        </select>

                        <button
                            type="submit"
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                        >
                            Filter
                        </button>
                    </form>

                    <p className="text-xs text-gray-500">
                        {formatNumber(products.total)} products
                    </p>
                </div>

                {products.data.length === 0 ? (
                    <EmptyState
                        title="No products found"
                        description="Adjust the filters or add a new product to the catalogue."
                        action={
                            <Link
                                href={route('erp.products.create')}
                                className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                Add product
                            </Link>
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">Product</th>
                                        <th className="px-5 py-3">Category</th>
                                        <th className="px-5 py-3 text-right">Price</th>
                                        <th className="px-5 py-3 text-right">Stock</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.data.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-emerald-50 to-lime-50 text-sm font-semibold text-emerald-600">
                                                        {product.image_url ? (
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            product.name.charAt(0)
                                                        )}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-gray-900">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {product.sku} · per {product.unit}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-gray-600">
                                                {product.category?.name ?? '—'}
                                            </td>
                                            <td className="px-5 py-3 text-right font-medium text-gray-900">
                                                {formatMoney(product.price)}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        product.stock_quantity === 0
                                                            ? 'bg-rose-50 text-rose-700'
                                                            : product.stock_quantity <= product.reorder_level
                                                              ? 'bg-amber-50 text-amber-700'
                                                              : 'bg-emerald-50 text-emerald-700'
                                                    }`}
                                                >
                                                    {product.stock_quantity} {product.unit}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                            product.is_active
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        {product.is_active ? 'Active' : 'Hidden'}
                                                    </span>
                                                    {product.is_featured && (
                                                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        href={route('shop.show', product.slug)}
                                                        className="text-xs font-semibold text-gray-500 hover:text-gray-900"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={route('erp.products.edit', product.id)}
                                                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => destroy(product)}
                                                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                                                    >
                                                        Archive
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination paginator={products} />
                    </>
                )}
            </div>
        </ErpLayout>
    );
}
