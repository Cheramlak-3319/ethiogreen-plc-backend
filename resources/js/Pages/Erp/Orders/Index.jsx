import EmptyState from '@/Components/Ui/EmptyState';
import PageHeader from '@/Components/Ui/PageHeader';
import Pagination from '@/Components/Ui/Pagination';
import StatCard from '@/Components/Ui/StatCard';
import StatusBadge from '@/Components/Ui/StatusBadge';
import ErpLayout from '@/Layouts/ErpLayout';
import { formatDate, formatMoney, paymentLabel } from '@/lib/format';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function OrdersIndex({ orders, filters, summary }) {
    const [search, setSearch] = useState(filters.q ?? '');

    const applyFilters = (overrides = {}) => {
        router.get(
            route('erp.orders.index'),
            {
                q: search || undefined,
                status: filters.status || undefined,
                payment: filters.payment || undefined,
                ...overrides,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <ErpLayout>
            <Head title="Orders" />

            <PageHeader
                title="Orders"
                description="Monitor fulfilment and HellOOpass payment status for every order."
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    label="Open orders"
                    value={summary.open}
                    hint="Pending or processing"
                    tone="blue"
                    icon={<span className="text-lg">📦</span>}
                />
                <StatCard
                    label="Awaiting payment"
                    value={summary.awaiting_payment}
                    hint="Unpaid or pending bills"
                    tone="amber"
                    icon={<span className="text-lg">⏳</span>}
                />
                <StatCard
                    label="Paid revenue"
                    value={formatMoney(summary.revenue)}
                    hint="All time"
                    icon={<span className="text-lg">💰</span>}
                />
            </div>

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
                            placeholder="Order number, customer or phone"
                            className="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500 sm:max-w-xs"
                        />

                        <select
                            value={filters.status}
                            onChange={(event) => applyFilters({ status: event.target.value || undefined })}
                            className="rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                        >
                            <option value="">All fulfilment</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                            value={filters.payment}
                            onChange={(event) => applyFilters({ payment: event.target.value || undefined })}
                            className="rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                        >
                            <option value="">All payments</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="pending">Awaiting payment</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>

                        <button
                            type="submit"
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                        >
                            Filter
                        </button>
                    </form>

                    <p className="text-xs text-gray-500">{orders.total} orders</p>
                </div>

                {orders.data.length === 0 ? (
                    <EmptyState
                        title="No orders matched"
                        description="Try clearing the filters or wait for new storefront orders."
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">Order</th>
                                        <th className="px-5 py-3">Customer</th>
                                        <th className="px-5 py-3">Placed</th>
                                        <th className="px-5 py-3">Fulfilment</th>
                                        <th className="px-5 py-3">Payment</th>
                                        <th className="px-5 py-3 text-right">Total</th>
                                        <th className="px-5 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3">
                                                <p className="font-medium text-gray-900">{order.order_number}</p>
                                                <p className="text-xs text-gray-500">
                                                    {order.items_count} items
                                                </p>
                                            </td>
                                            <td className="px-5 py-3">
                                                <p className="text-gray-900">{order.customer?.name ?? '—'}</p>
                                                <p className="text-xs text-gray-500">
                                                    {order.customer?.phone ?? ''}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3 text-gray-500">
                                                {formatDate(order.placed_at ?? order.created_at)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge
                                                    status={order.payment_status}
                                                    label={paymentLabel(order.payment_status)}
                                                />
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold text-gray-900">
                                                {formatMoney(order.total, order.currency)}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <Link
                                                    href={route('erp.orders.show', order.id)}
                                                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                                                >
                                                    Open
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination paginator={orders} />
                    </>
                )}
            </div>
        </ErpLayout>
    );
}
