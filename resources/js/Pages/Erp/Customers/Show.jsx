import PageHeader from '@/Components/Ui/PageHeader';
import StatCard from '@/Components/Ui/StatCard';
import StatusBadge from '@/Components/Ui/StatusBadge';
import ErpLayout from '@/Layouts/ErpLayout';
import { formatDate, formatMoney, paymentLabel } from '@/lib/format';
import { Head, Link } from '@inertiajs/react';

export default function CustomersShow({ customer, stats }) {
    return (
        <ErpLayout>
            <Head title={customer.name} />

            <PageHeader
                title={customer.name}
                description={`Customer since ${formatDate(customer.created_at)}`}
                actions={
                    <Link
                        href={route('erp.customers.index')}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                    >
                        Back to customers
                    </Link>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <StatCard
                    label="Orders"
                    value={stats.orders}
                    hint="All channels"
                    tone="blue"
                    icon={<span className="text-lg">📦</span>}
                />
                <StatCard
                    label="Lifetime value"
                    value={formatMoney(stats.lifetime_value)}
                    hint="Paid orders only"
                    icon={<span className="text-lg">💰</span>}
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
                <section className="h-fit rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900">Contact details</h2>
                    <dl className="mt-4 space-y-3 text-sm">
                        <div>
                            <dt className="text-xs uppercase tracking-wide text-gray-400">Phone</dt>
                            <dd className="font-medium text-gray-900">{customer.phone}</dd>
                        </div>
                        <div>
                            <dt className="text-xs uppercase tracking-wide text-gray-400">Email</dt>
                            <dd className="text-gray-700">{customer.email ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs uppercase tracking-wide text-gray-400">Address</dt>
                            <dd className="text-gray-700">{customer.address ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs uppercase tracking-wide text-gray-400">
                                HellOOpass ID
                            </dt>
                            <dd className="font-mono text-xs text-gray-700">
                                {customer.hellopass_user_id ?? 'Not linked yet'}
                            </dd>
                        </div>
                    </dl>
                </section>

                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">Recent orders</h2>
                        <p className="mt-0.5 text-xs text-gray-500">Latest 20 orders</p>
                    </div>

                    {customer.orders.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-gray-500">No orders yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">Order</th>
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Payment</th>
                                        <th className="px-5 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customer.orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3 font-medium text-gray-900">
                                                <Link
                                                    href={route('erp.orders.show', order.id)}
                                                    className="hover:text-emerald-700"
                                                >
                                                    {order.order_number}
                                                </Link>
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
                                                {formatMoney(order.total)}
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
