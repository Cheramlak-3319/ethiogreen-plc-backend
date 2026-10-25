import EmptyState from '@/Components/Ui/EmptyState';
import PageHeader from '@/Components/Ui/PageHeader';
import Pagination from '@/Components/Ui/Pagination';
import StatusBadge from '@/Components/Ui/StatusBadge';
import ErpLayout from '@/Layouts/ErpLayout';
import { formatDate, formatMoney } from '@/lib/format';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function PurchaseOrdersIndex({ purchaseOrders, filters }) {
    const [search, setSearch] = useState(filters.q ?? '');

    const applyFilters = (overrides = {}) => {
        router.get(
            route('erp.purchase-orders.index'),
            {
                q: search || undefined,
                status: filters.status || undefined,
                ...overrides,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <ErpLayout>
            <Head title="Purchase orders" />

            <PageHeader
                title="Purchase orders"
                description="Track restocking from suppliers and automatically update inventory on receipt."
                actions={
                    <Link
                        href={route('erp.purchase-orders.create')}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                        Create PO
                    </Link>
                }
            />

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
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
                            placeholder="PO number"
                            className="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500 sm:max-w-xs"
                        />

                        <select
                            value={filters.status}
                            onChange={(event) => applyFilters({ status: event.target.value || undefined })}
                            className="rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                        >
                            <option value="">All statuses</option>
                            <option value="draft">Draft</option>
                            <option value="ordered">Ordered</option>
                            <option value="received">Received</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                            type="submit"
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                        >
                            Filter
                        </button>
                    </form>

                    <p className="text-xs text-gray-500">{purchaseOrders.total} purchase orders</p>
                </div>

                {purchaseOrders.data.length === 0 ? (
                    <EmptyState
                        title="No purchase orders yet"
                        description="Create your first PO to start restocking from suppliers."
                        action={
                            <Link
                                href={route('erp.purchase-orders.create')}
                                className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                Create PO
                            </Link>
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">PO</th>
                                        <th className="px-5 py-3">Supplier</th>
                                        <th className="px-5 py-3">Ordered</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">Items</th>
                                        <th className="px-5 py-3 text-right">Total</th>
                                        <th className="px-5 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {purchaseOrders.data.map((po) => (
                                        <tr key={po.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3 font-medium text-gray-900">
                                                {po.po_number}
                                            </td>
                                            <td className="px-5 py-3 text-gray-600">
                                                {po.supplier?.name ?? '—'}
                                            </td>
                                            <td className="px-5 py-3 text-gray-500">
                                                {formatDate(po.ordered_at ?? po.created_at)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge status={po.status} />
                                            </td>
                                            <td className="px-5 py-3 text-right text-gray-600">
                                                {po.items_count}
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold text-gray-900">
                                                {formatMoney(po.total)}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <Link
                                                    href={route('erp.purchase-orders.show', po.id)}
                                                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination paginator={purchaseOrders} />
                    </>
                )}
            </div>
        </ErpLayout>
    );
}
