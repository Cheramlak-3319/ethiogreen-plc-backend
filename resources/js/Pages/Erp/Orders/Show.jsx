import PageHeader from '@/Components/Ui/PageHeader';
import StatusBadge from '@/Components/Ui/StatusBadge';
import ErpLayout from '@/Layouts/ErpLayout';
import { formatDateTime, formatMoney, paymentLabel } from '@/lib/format';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function OrdersShow({ order, webhookEvents }) {
    const [verifying, setVerifying] = useState(false);

    const updateStatus = (action) => {
        if (
            action === 'cancelled' &&
            !window.confirm('Cancel this order and restore stock?')
        ) {
            return;
        }

        router.patch(
            route('erp.orders.update', order.id),
            { action },
            { preserveScroll: true },
        );
    };

    const verifyPayment = () => {
        setVerifying(true);
        router.post(
            route('erp.orders.verify', order.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setVerifying(false),
            },
        );
    };

    return (
        <ErpLayout>
            <Head title={`Order ${order.order_number}`} />

            <PageHeader
                title={order.order_number}
                description={`Placed ${formatDateTime(order.placed_at ?? order.created_at)} · Channel: ${order.channel}`}
                actions={
                    <Link
                        href={route('erp.orders.index')}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                    >
                        Back to orders
                    </Link>
                }
            />

            <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={order.status} />
                <StatusBadge status={order.payment_status} label={paymentLabel(order.payment_status)} />
                {order.payment_method && (
                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        {order.payment_method === 'hellopass' ? 'HellOOpass' : order.payment_method}
                    </span>
                )}
            </div>

            {order.payment_error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
                    <span className="font-semibold">Payment error:</span> {order.payment_error}
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-gray-900">Order items</h2>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {order.items.map((item) => (
                                <li key={item.id} className="flex items-start justify-between gap-4 px-5 py-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {item.product_name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-500">
                                            {item.sku} · {item.quantity} × {formatMoney(item.unit_price)}
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatMoney(item.line_total)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <dl className="space-y-2 border-t border-gray-100 bg-gray-50 px-5 py-4 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Subtotal</dt>
                                <dd className="font-medium text-gray-900">{formatMoney(order.subtotal)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Shipping</dt>
                                <dd className="font-medium text-gray-900">{formatMoney(order.shipping)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Tax</dt>
                                <dd className="font-medium text-gray-900">{formatMoney(order.tax)}</dd>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2 text-base">
                                <dt className="font-semibold text-gray-900">Total</dt>
                                <dd className="font-semibold text-gray-900">
                                    {formatMoney(order.total, order.currency)}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-900">Fulfilment actions</h2>
                            <p className="text-xs text-gray-500">Update order status manually</p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {order.status !== 'processing' && order.status !== 'completed' && (
                                <button
                                    type="button"
                                    onClick={() => updateStatus('processing')}
                                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Mark processing
                                </button>
                            )}
                            {order.status !== 'completed' && order.status !== 'cancelled' && (
                                <button
                                    type="button"
                                    onClick={() => updateStatus('completed')}
                                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    Mark completed
                                </button>
                            )}
                            {order.payment_status !== 'paid' && (
                                <button
                                    type="button"
                                    onClick={() => updateStatus('paid')}
                                    className="rounded-lg bg-emerald-600/90 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    Mark as paid
                                </button>
                            )}
                            {['pending', 'processing'].includes(order.status) && (
                                <button
                                    type="button"
                                    onClick={() => updateStatus('cancelled')}
                                    className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                                >
                                    Cancel order &amp; restore stock
                                </button>
                            )}
                            {order.hellopass_bill_id && (
                                <button
                                    type="button"
                                    onClick={verifyPayment}
                                    disabled={verifying}
                                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
                                >
                                    {verifying ? 'Syncing…' : 'Sync from HellOOpass'}
                                </button>
                            )}
                        </div>
                    </section>

                    {webhookEvents.length > 0 && (
                        <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-5 py-4">
                                <h2 className="text-sm font-semibold text-gray-900">
                                    HellOOpass webhooks
                                </h2>
                            </div>
                            <ul className="divide-y divide-gray-100">
                                {webhookEvents.map((event) => (
                                    <li key={event.id} className="flex items-center justify-between gap-3 px-5 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {event.type}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDateTime(event.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={event.type} />
                                            {event.processed_at && (
                                                <span className="text-xs text-gray-400">Processed</span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <aside className="space-y-6">
                    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Customer</h2>
                        <dl className="mt-3 space-y-2 text-sm">
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">Name</dt>
                                <dd className="font-medium text-gray-900">
                                    {order.customer ? (
                                        <Link
                                            href={route('erp.customers.show', order.customer.id)}
                                            className="hover:text-emerald-700"
                                        >
                                            {order.customer.name}
                                        </Link>
                                    ) : (
                                        '—'
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">Phone</dt>
                                <dd className="text-gray-700">{order.customer?.phone ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">Email</dt>
                                <dd className="text-gray-700">{order.customer?.email ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">Address</dt>
                                <dd className="text-gray-700">{order.customer?.address ?? '—'}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Payment details</h2>
                        <dl className="mt-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Method</dt>
                                <dd className="font-medium text-gray-900">
                                    {order.payment_method === 'hellopass' ? 'HellOOpass' : order.payment_method ?? '—'}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Status</dt>
                                <dd>
                                    <StatusBadge
                                        status={order.payment_status}
                                        label={paymentLabel(order.payment_status)}
                                    />
                                </dd>
                            </div>
                            {order.hellopass_bill_id && (
                                <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500">Bill ID</dt>
                                    <dd className="truncate font-mono text-xs text-gray-700">
                                        {order.hellopass_bill_id}
                                    </dd>
                                </div>
                            )}
                            {order.hellopass_reference && (
                                <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500">Reference</dt>
                                    <dd className="text-gray-700">{order.hellopass_reference}</dd>
                                </div>
                            )}
                            {order.paid_at && (
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Paid</dt>
                                    <dd className="text-gray-700">{formatDateTime(order.paid_at)}</dd>
                                </div>
                            )}
                        </dl>
                    </section>

                    {order.notes && (
                        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                            <h2 className="text-sm font-semibold text-gray-900">Notes</h2>
                            <p className="mt-2 text-sm leading-relaxed text-gray-600">{order.notes}</p>
                        </section>
                    )}
                </aside>
            </div>
        </ErpLayout>
    );
}
