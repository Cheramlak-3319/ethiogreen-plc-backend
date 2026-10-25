import PageHeader from '@/Components/Ui/PageHeader';
import StatusBadge from '@/Components/Ui/StatusBadge';
import ErpLayout from '@/Layouts/ErpLayout';
import { formatDateTime } from '@/lib/format';
import { Head, router, useForm } from '@inertiajs/react';

export default function InventoryIndex({ movements, products, filters }) {
    const { data, setData, post, processing } = useForm({
        product_id: '',
        quantity: '',
        note: '',
    });

    const applyFilter = (overrides = {}) => {
        router.get(
            route('erp.inventory.index'),
            {
                product: filters.product || undefined,
                type: filters.type || undefined,
                ...overrides,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const adjust = (event) => {
        event.preventDefault();
        post(route('erp.inventory.adjust'), {
            preserveScroll: true,
            onSuccess: () => setData({ product_id: '', quantity: '', note: '' }),
        });
    };

    return (
        <ErpLayout>
            <Head title="Inventory" />

            <PageHeader
                title="Inventory"
                description="Stock levels, movement history and manual adjustments."
            />

            <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
                <section className="h-fit rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900">Quick stock adjustment</h2>
                    <p className="mt-1 text-xs text-gray-500">
                        Use positive numbers to add stock, negative to remove.
                    </p>

                    <form onSubmit={adjust} className="mt-4 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700">Product</label>
                            <select
                                value={data.product_id}
                                onChange={(event) => setData('product_id', event.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                required
                            >
                                <option value="">Select product</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} · {product.stock_quantity} {product.unit}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700">
                                Quantity change
                            </label>
                            <input
                                type="number"
                                value={data.quantity}
                                onChange={(event) => setData('quantity', event.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                placeholder="e.g. 10 or -5"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700">Note</label>
                            <input
                                type="text"
                                value={data.note}
                                onChange={(event) => setData('note', event.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                placeholder="Reason for adjustment"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
                        >
                            {processing ? 'Updating…' : 'Apply adjustment'}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-gray-100 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Stock summary
                        </p>
                        <ul className="mt-3 max-h-72 space-y-2 overflow-auto">
                            {products.slice(0, 25).map((product) => (
                                <li key={product.id} className="flex items-center justify-between gap-2 text-sm">
                                    <span className="truncate text-gray-700">{product.name}</span>
                                    <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                            product.stock_quantity <= product.reorder_level
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'bg-emerald-50 text-emerald-700'
                                        }`}
                                    >
                                        {product.stock_quantity} {product.unit}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Movement history</h2>
                            <p className="mt-0.5 text-xs text-gray-500">
                                Purchases, sales, returns and adjustments
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filters.product}
                                onChange={(event) =>
                                    applyFilter({ product: event.target.value || undefined })
                                }
                                className="rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                <option value="">All products</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.type}
                                onChange={(event) =>
                                    applyFilter({ type: event.target.value || undefined })
                                }
                                className="rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                <option value="">All types</option>
                                <option value="purchase">Purchase</option>
                                <option value="sale">Sale</option>
                                <option value="adjustment">Adjustment</option>
                                <option value="return">Return</option>
                            </select>
                        </div>
                    </div>

                    {movements.data.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-gray-500">
                            No inventory movements yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-5 py-3">Product</th>
                                        <th className="px-5 py-3">Type</th>
                                        <th className="px-5 py-3 text-right">Change</th>
                                        <th className="px-5 py-3 text-right">Balance</th>
                                        <th className="px-5 py-3">User</th>
                                        <th className="px-5 py-3">Note</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {movements.data.map((movement) => (
                                        <tr key={movement.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3 text-gray-500">
                                                {formatDateTime(movement.created_at)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <p className="font-medium text-gray-900">
                                                    {movement.product?.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {movement.product?.sku}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge status={movement.type} />
                                            </td>
                                            <td
                                                className={`px-5 py-3 text-right font-semibold ${
                                                    movement.quantity > 0 ? 'text-emerald-700' : 'text-rose-700'
                                                }`}
                                            >
                                                {movement.quantity > 0 ? '+' : ''}
                                                {movement.quantity}
                                            </td>
                                            <td className="px-5 py-3 text-right font-medium text-gray-900">
                                                {movement.balance_after}
                                            </td>
                                            <td className="px-5 py-3 text-gray-600">
                                                {movement.user?.name ?? 'System'}
                                            </td>
                                            <td className="max-w-xs truncate px-5 py-3 text-gray-500">
                                                {movement.note ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </ErpLayout>
    );
}
