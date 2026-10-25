import EmptyState from '@/Components/Ui/EmptyState';
import PageHeader from '@/Components/Ui/PageHeader';
import StatCard from '@/Components/Ui/StatCard';
import StatusBadge from '@/Components/Ui/StatusBadge';
import ErpLayout from '@/Layouts/ErpLayout';
import { formatDate, formatMoney, formatNumber, paymentLabel } from '@/lib/format';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ stats, trend, recentOrders, lowStockProducts, topProducts }) {
    const maxTrend = Math.max(...trend.map((point) => Number(point.total)), 1);

    return (
        <ErpLayout>
            <Head title="ERP dashboard" />

            <PageHeader
                title="Business overview"
                description="Live sales, payment and inventory signals across the EthioGreen storefront."
                actions={
                    <>
                        <Link
                            href={route('erp.orders.index')}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                        >
                            View orders
                        </Link>
                        <Link
                            href={route('erp.products.create')}
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Add product
                        </Link>
                    </>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Paid revenue"
                    value={formatMoney(stats.revenue)}
                    hint={`${formatMoney(stats.month_revenue)} this month`}
                    icon={<span className="text-lg">💰</span>}
                />
                <StatCard
                    label="Orders today"
                    value={formatNumber(stats.orders_today)}
                    hint={`${formatNumber(stats.open_orders)} open orders`}
                    tone="blue"
                    icon={<span className="text-lg">📦</span>}
                />
                <StatCard
                    label="Awaiting payment"
                    value={formatMoney(stats.pending_payments)}
                    hint="Unpaid or pending HellOOpass bills"
                    tone="amber"
                    icon={<span className="text-lg">⏳</span>}
                />
                <StatCard
                    label="Low stock"
                    value={formatNumber(stats.low_stock)}
                    hint={`${formatNumber(stats.products)} active products`}
                    tone="rose"
                    icon={<span className="text-lg">⚠️</span>}
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Paid sales, last 7 days</h2>
                            <p className="mt-1 text-xs text-gray-500">
                                Revenue from orders confirmed as paid.
                            </p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            {formatMoney(trend.reduce((sum, point) => sum + Number(point.total), 0))}
                        </span>
                    </div>

                    <div className="mt-6 flex h-48 items-end gap-3">
                        {trend.map((point) => (
                            <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                                <div className="flex w-full flex-1 items-end">
                                    <div
                                        className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all"
                                        style={{
                                            height: `${Math.max((Number(point.total) / maxTrend) * 100, 4)}%`,
                                        }}
                                        title={formatMoney(point.total)}
                                    />
                                </div>
                                <span className="text-[11px] font-medium text-gray-500">{point.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900">Customers</h2>
                    <p className="mt-1 text-xs text-gray-500">Registered buyers across all channels.</p>
                    <p className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">
                        {formatNumber(stats.customers)}
                    </p>
                    <Link
                        href={route('erp.customers.index')}
                        className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                        Manage customers →
                    </Link>
                </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm xl:col-span-2">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">Recent orders</h2>
                        <Link
                            href={route('erp.orders.index')}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                            View all
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <EmptyState title="No orders yet" description="New storefront orders will appear here." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">Order</th>
                                        <th className="px-5 py-3">Customer</th>
                                        <th className="px-5 py-3">Placed</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3 font-medium text-gray-900">
                                                <Link
                                                    href={route('erp.orders.show', order.id)}
                                                    className="hover:text-emerald-700"
                                                >
                                                    {order.order_number}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3 text-gray-600">
                                                {order.customer?.name ?? '—'}
                                            </td>
                                            <td className="px-5 py-3 text-gray-500">
                                                {formatDate(order.placed_at ?? order.created_at)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    <StatusBadge status={order.status} />
                                                    <StatusBadge
                                                        status={order.payment_status}
                                                        label={paymentLabel(order.payment_status)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold text-gray-900">
                                                {formatMoney(order.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="space-y-6">
                    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-gray-900">Low stock</h2>
                            <Link
                                href={route('erp.inventory.index')}
                                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                            >
                                Inventory
                            </Link>
                        </div>

                        {lowStockProducts.length === 0 ? (
                            <p className="px-5 py-6 text-sm text-gray-500">Everything is above reorder level.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {lowStockProducts.map((product) => (
                                    <li key={product.id} className="flex items-center justify-between gap-3 px-5 py-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-gray-900">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-gray-500">{product.sku}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                                            {product.stock_quantity} / {product.reorder_level}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-gray-900">Top products</h2>
                        </div>

                        {topProducts.length === 0 ? (
                            <p className="px-5 py-6 text-sm text-gray-500">No paid sales yet.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {topProducts.map((product) => (
                                    <li key={product.product_name} className="flex items-center justify-between gap-3 px-5 py-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-gray-900">
                                                {product.product_name}
                                            </p>
                                            <p className="text-xs text-gray-500">{product.sold} sold</p>
                                        </div>
                                        <span className="shrink-0 text-sm font-semibold text-gray-900">
                                            {formatMoney(product.revenue)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </div>
        </ErpLayout>
    );
}
