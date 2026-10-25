import EmptyState from '@/Components/Ui/EmptyState';
import Pagination from '@/Components/Ui/Pagination';
import StatusBadge from '@/Components/Ui/StatusBadge';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { formatDate, formatMoney, paymentLabel } from '@/lib/format';
import { Head, Link } from '@inertiajs/react';

export default function Orders({ orders }) {
    return (
        <StorefrontLayout>
            <Head title="My orders" />

            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">My orders</h1>
                <p className="text-sm text-gray-500">
                    Track payments and delivery progress for every order you placed.
                </p>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                {orders.data.length === 0 ? (
                    <EmptyState
                        title="No orders yet"
                        description="When you place your first order it will appear here with live payment status."
                        action={
                            <Link
                                href={route('shop.index')}
                                className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                Start shopping
                            </Link>
                        }
                    />
                ) : (
                    <>
                        <ul className="divide-y divide-gray-100">
                            {orders.data.map((order) => (
                                <li key={order.id}>
                                    <Link
                                        href={route('orders.show', order.order_number)}
                                        className="flex flex-col gap-3 px-5 py-4 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {order.order_number}
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                {formatDate(order.placed_at ?? order.created_at)} ·{' '}
                                                {order.items_count} item
                                                {order.items_count === 1 ? '' : 's'}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                            <StatusBadge status={order.status} />
                                            <StatusBadge
                                                status={order.payment_status}
                                                label={paymentLabel(order.payment_status)}
                                            />
                                            <span className="text-sm font-semibold text-gray-900 sm:ml-3">
                                                {formatMoney(order.total, order.currency)}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <Pagination paginator={orders} />
                    </>
                )}
            </div>
        </StorefrontLayout>
    );
}
