import PageHeader from '@/Components/Ui/PageHeader';
import StatusBadge from '@/Components/Ui/StatusBadge';
import ErpLayout from '@/Layouts/ErpLayout';
import { formatDateTime, formatMoney } from '@/lib/format';
import { Head, Link, router } from '@inertiajs/react';

export default function PurchaseOrdersShow({ purchaseOrder }) {
    const receive = () => {
        if (window.confirm('Receive all remaining items and add to inventory?')) {
            router.post(route('erp.purchase-orders.receive', purchaseOrder.id), {}, { preserveScroll: true });
        }
    };

    return (
        <ErpLayout>
            <Head title={purchaseOrder.po_number} />

            <PageHeader
                title={purchaseOrder.po_number}
                description={`Ordered ${formatDateTime(purchaseOrder.ordered_at ?? purchaseOrder.created_at)} · ${purchaseOrder.supplier?.name ?? 'Supplier'}`}
                actions={
                    <>
                        {purchaseOrder.status !== 'received' && (
                            <button
                                type="button"
                                onClick={receive}
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                Receive stock
                            </button>
                        )}
                        <Link
                            href={route('erp.purchase-orders.index')}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                        >
                            Back to purchase orders
                        </Link>
                    </>
                }
            />

            <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={purchaseOrder.status} />
                {purchaseOrder.received_at && (
                    <span className="text-xs text-gray-500">
                        Received {formatDateTime(purchaseOrder.received_at)}
                    </span>
                )}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">Line items</h2>
                    </div>
                    <ul className="divide-y divide-gray-100">
                        {purchaseOrder.items.map((item) => (
                            <li key={item.id} className="flex items-start justify-between gap-4 px-5 py-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {item.product?.name ?? 'Product'}
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {item.product?.sku} · {item.received_quantity}/{item.quantity} received
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {formatMoney(item.line_total)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatMoney(item.unit_cost)} each
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-between border-t border-gray-100 bg-gray-50 px-5 py-4">
                        <span className="text-sm font-semibold text-gray-900">Total</span>
                        <span className="text-sm font-semibold text-gray-900">
                            {formatMoney(purchaseOrder.total)}
                        </span>
                    </div>
                </section>

                <aside className="space-y-6">
                    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Supplier</h2>
                        <dl className="mt-3 space-y-2 text-sm">
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">Company</dt>
                                <dd className="font-medium text-gray-900">{purchaseOrder.supplier?.name}</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">Contact</dt>
                                <dd className="text-gray-700">{purchaseOrder.supplier?.contact_name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">Phone</dt>
                                <dd className="text-gray-700">{purchaseOrder.supplier?.phone ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">Email</dt>
                                <dd className="text-gray-700">{purchaseOrder.supplier?.email ?? '—'}</dd>
                            </div>
                        </dl>
                    </section>

                    {purchaseOrder.notes && (
                        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                            <h2 className="text-sm font-semibold text-gray-900">Notes</h2>
                            <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                {purchaseOrder.notes}
                            </p>
                        </section>
                    )}
                </aside>
            </div>
        </ErpLayout>
    );
}
