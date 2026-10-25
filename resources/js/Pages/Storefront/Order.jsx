import StatusBadge from '@/Components/Ui/StatusBadge';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { formatDateTime, formatMoney, paymentLabel } from '@/lib/format';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Order({ order }) {
    const [verifying, setVerifying] = useState(false);

    const verifyPayment = () => {
        setVerifying(true);
        router.post(
            route('orders.verify', order.order_number),
            {},
            {
                preserveScroll: true,
                onFinish: () => setVerifying(false),
            },
        );
    };

    const steps = [
        { label: 'Order placed', done: true, hint: formatDateTime(order.placed_at ?? order.created_at) },
        {
            label: 'Payment approved',
            done: order.payment_status === 'paid',
            hint: order.paid_at ? formatDateTime(order.paid_at) : 'Waiting for HellOOpass',
        },
        {
            label: 'Processing',
            done: ['processing', 'completed'].includes(order.status),
            hint: 'We pack your order',
        },
        {
            label: 'Completed',
            done: order.status === 'completed',
            hint: order.status === 'cancelled' ? 'Order cancelled' : 'Delivered to you',
        },
    ];

    return (
        <StorefrontLayout>
            <Head title={`Order ${order.order_number}`} />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                        Order confirmation
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                        {order.order_number}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Placed {formatDateTime(order.placed_at ?? order.created_at)}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={order.status} />
                    <StatusBadge status={order.payment_status} label={paymentLabel(order.payment_status)} />
                </div>
            </div>

            {order.status === 'cancelled' ? (
                <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
                    This order was cancelled. If you were charged, contact our team and we will
                    arrange a refund.
                </div>
            ) : order.payment_status === 'paid' ? (
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                    Payment received. Thank you! We are preparing your order for delivery.
                </div>
            ) : (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                    <p className="text-sm font-semibold text-amber-900">
                        {order.hellopass_bill_id
                            ? 'Approve your bill in the HellOOpass app'
                            : 'Payment is being arranged'}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-amber-800">
                        {order.hellopass_bill_id
                            ? 'We sent a payment request to your HellOOpass account. Open the app, review the bill and approve it to release your order.'
                            : 'We could not reach HellOOpass automatically. Our team will contact you with payment instructions.'}
                    </p>
                    {order.hellopass_bill_id && (
                        <button
                            type="button"
                            onClick={verifyPayment}
                            disabled={verifying}
                            className="mt-3 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
                        >
                            {verifying ? 'Checking…' : "I've paid — check status"}
                        </button>
                    )}
                </div>
            )}

            {order.payment_error && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
                    <span className="font-semibold">Payment note:</span> {order.payment_error}
                </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
                <div className="space-y-6">
                    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-gray-900">Items</h2>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {order.items.map((item) => (
                                <li key={item.id} className="flex items-start justify-between gap-4 px-5 py-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
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
                                <dt className="text-gray-500">Delivery</dt>
                                <dd className="font-medium text-gray-900">{formatMoney(order.shipping)}</dd>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2 text-base">
                                <dt className="font-semibold text-gray-900">Total</dt>
                                <dd className="font-semibold text-gray-900">
                                    {formatMoney(order.total, order.currency)}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Order progress</h2>
                        <ol className="mt-4 space-y-4">
                            {steps.map((step, index) => (
                                <li key={step.label} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <span
                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                                                step.done
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-gray-100 text-gray-400'
                                            }`}
                                        >
                                            {step.done ? '✓' : index + 1}
                                        </span>
                                        {index < steps.length - 1 && (
                                            <span
                                                className={`mt-1 h-6 w-px ${
                                                    step.done ? 'bg-emerald-200' : 'bg-gray-200'
                                                }`}
                                            />
                                        )}
                                    </div>
                                    <div className="pb-1">
                                        <p
                                            className={`text-sm font-medium ${
                                                step.done ? 'text-gray-900' : 'text-gray-500'
                                            }`}
                                        >
                                            {step.label}
                                        </p>
                                        <p className="text-xs text-gray-400">{step.hint}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>

                <aside className="space-y-6">
                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Delivery</h2>
                        <dl className="mt-3 space-y-2 text-sm">
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">Customer</dt>
                                <dd className="font-medium text-gray-900">{order.customer?.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">Phone</dt>
                                <dd className="font-medium text-gray-900">{order.customer?.phone ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">Address</dt>
                                <dd className="text-gray-700">{order.customer?.address ?? 'To be confirmed'}</dd>
                            </div>
                            {order.notes && (
                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-gray-400">Notes</dt>
                                    <dd className="text-gray-700">{order.notes}</dd>
                                </div>
                            )}
                        </dl>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Payment</h2>
                        <dl className="mt-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Method</dt>
                                <dd className="font-medium text-gray-900">
                                    {order.payment_method === 'hellopass' ? 'HellOOpass' : 'Manual / offline'}
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
                                <div className="flex justify-between gap-3">
                                    <dt className="text-gray-500">Bill</dt>
                                    <dd className="truncate font-mono text-xs text-gray-700">
                                        {order.hellopass_bill_id}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </section>

                    <div className="flex flex-col gap-2">
                        <Link
                            href={route('shop.index')}
                            className="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Continue shopping
                        </Link>
                        <Link
                            href={route('account.orders')}
                            className="flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                        >
                            All my orders
                        </Link>
                    </div>
                </aside>
            </div>
        </StorefrontLayout>
    );
}
