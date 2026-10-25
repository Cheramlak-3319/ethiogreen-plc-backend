import PageHeader from '@/Components/Ui/PageHeader';
import StatusBadge from '@/Components/Ui/StatusBadge';
import ErpLayout from '@/Layouts/ErpLayout';
import { formatDateTime } from '@/lib/format';
import { Head, router, useForm } from '@inertiajs/react';

export default function Integration({
    integration,
    invoices,
    events,
    paymentIssues,
    merchants,
    customers,
    suppliers,
    openInvoices,
    invoiceTotals,
    internationalTotals,
    basicTotals,
    cashInAndOutTotals,
    receipts,
    repaymentHistory,
}) {
    const invoicePreview = Array.isArray(invoices) ? invoices : [];

    function extractArray(data) {
        if (!data || data.error) return [];
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.message)) return data.message;
        if (Array.isArray(data.data)) return data.data;
        return [];
    }

    const merchantList = extractArray(merchants);
    const customerList = extractArray(customers);
    const supplierList = extractArray(suppliers);
    const openInvoiceList = extractArray(openInvoices);
    const receiptList = extractArray(receipts);
    const repaymentList = extractArray(repaymentHistory);
    const register = useForm();
    const sync = useForm();
    const test = useForm();

    const submitRegister = (event) => {
        event.preventDefault();
        register.post(route('erp.integration.webhook'), { preserveScroll: true });
    };

    const submitSync = (event) => {
        event.preventDefault();
        sync.post(route('erp.integration.sync'), { preserveScroll: true });
    };

    const submitTest = (event) => {
        event.preventDefault();
        test.post(route('erp.integration.test'), { preserveScroll: true });
    };

    return (
        <ErpLayout>
            <Head title="HellOOpass integration" />

            <PageHeader
                title="HellOOpass integration"
                description="Configure bills, webhooks and keep an eye on payment exceptions."
            />

            <div className="grid gap-6 xl:grid-cols-3">
                <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
                    <h2 className="text-sm font-semibold text-gray-900">Connection status</h2>

                    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-gray-100 p-3">
                            <dt className="text-xs uppercase tracking-wide text-gray-400">Enabled</dt>
                            <dd className="mt-1 text-sm font-semibold text-gray-900">
                                {integration.enabled ? 'Yes' : 'No'}
                            </dd>
                        </div>
                        <div className="rounded-lg border border-gray-100 p-3">
                            <dt className="text-xs uppercase tracking-wide text-gray-400">Configured</dt>
                            <dd className="mt-1 text-sm font-semibold text-gray-900">
                                {integration.configured ? 'Yes' : 'No'}
                            </dd>
                        </div>
                        <div className="rounded-lg border border-gray-100 p-3">
                            <dt className="text-xs uppercase tracking-wide text-gray-400">Base URL</dt>
                            <dd className="mt-1 text-sm text-gray-700">{integration.base_url}</dd>
                        </div>
                        <div className="rounded-lg border border-gray-100 p-3">
                            <dt className="text-xs uppercase tracking-wide text-gray-400">Project</dt>
                            <dd className="mt-1 text-sm text-gray-700">
                                {integration.project || 'Not set'}
                            </dd>
                        </div>
                        <div className="rounded-lg border border-gray-100 p-3">
                            <dt className="text-xs uppercase tracking-wide text-gray-400">
                                Webhook secret
                            </dt>
                            <dd className="mt-1 text-sm text-gray-700">
                                {integration.webhook_secret_set ? 'Set' : 'Missing'}
                            </dd>
                        </div>
                        <div className="rounded-lg border border-gray-100 p-3">
                            <dt className="text-xs uppercase tracking-wide text-gray-400">Currency</dt>
                            <dd className="mt-1 text-sm text-gray-700">{integration.currency}</dd>
                        </div>
                    </dl>

                    <div className="mt-5 flex flex-wrap gap-2">
                        <form onSubmit={submitTest}>
                            <button
                                type="submit"
                                disabled={test.processing}
                                className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
                            >
                                {test.processing ? 'Testing…' : 'Test connection'}
                            </button>
                        </form>
                        <form onSubmit={submitRegister}>
                            <button
                                type="submit"
                                disabled={register.processing}
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
                            >
                                {register.processing ? 'Registering…' : 'Register webhook'}
                            </button>
                        </form>
                        <form onSubmit={submitSync}>
                            <button
                                type="submit"
                                disabled={sync.processing}
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
                            >
                                {sync.processing ? 'Pulling…' : 'Pull invoices'}
                            </button>
                        </form>
                    </div>

                    <p className="mt-3 text-xs text-gray-500">
                        Webhook endpoint: <span className="font-mono">{integration.webhook_url}</span>
                    </p>
                </section>

                <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900">Environment notes</h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                        Set <span className="font-mono">HELLOPASS_ENABLED</span>,{' '}
                        <span className="font-mono">HELLOPASS_PROJECT</span> and{' '}
                        <span className="font-mono">HELLOPASS_WEBHOOK_SECRET</span> in your{' '}
                        <span className="font-mono">.env</span> file. Webhooks are signed with HMAC
                        SHA256 and idempotently processed.
                    </p>
                </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm xl:col-span-2">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">Recent webhook events</h2>
                    </div>
                    {events.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-gray-500">No events yet.</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {events.map((event) => (
                                <li key={event.id} className="flex items-center justify-between gap-3 px-5 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {event.type}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Bill {event.bill_id ?? '—'} · Ref {event.reference ?? '—'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={event.type} />
                                        <span className="text-xs text-gray-400">
                                            {formatDateTime(event.created_at)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">Orders with payment errors</h2>
                    </div>
                    {paymentIssues.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-gray-500">
                            No payment issues right now.
                        </p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {paymentIssues.map((order) => (
                                <li key={order.id} className="px-5 py-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <button
                                            type="button"
                                            onClick={() => router.visit(route('erp.orders.show', order.id))}
                                            className="text-sm font-medium text-gray-900 hover:text-emerald-700"
                                        >
                                            {order.order_number}
                                        </button>
                                        <StatusBadge status={order.payment_status} />
                                    </div>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {order.customer?.name} · {order.customer?.phone}
                                    </p>
                                    <p className="mt-1 text-xs text-rose-600">{order.payment_error}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            {invoicePreview.length > 0 && (
                <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">Pulled invoices</h2>
                        <p className="mt-0.5 text-xs text-gray-500">Last sync preview</p>
                    </div>
                    <pre className="max-h-80 overflow-auto px-5 py-4 text-xs text-gray-600">
                        {JSON.stringify(invoicePreview, null, 2)}
                    </pre>
                </section>
            )}

            <div className="grid gap-6 xl:grid-cols-3">
                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">Merchants ({merchantList.length})</h2>
                    </div>
                    {merchantList.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-gray-500">
                            {merchants?.error || 'No merchants returned.'}
                        </p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {merchantList.slice(0, 10).map((m, idx) => (
                                <li key={idx} className="px-5 py-3">
                                    <p className="text-sm font-medium text-gray-900">
                                        {m.businessName || m.fullname || m.name || '—'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {m.mobile || '—'} · {m.city || ''} {m.region || ''}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">Customers ({customerList.length})</h2>
                    </div>
                    {customerList.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-gray-500">
                            {customers?.error || 'No customers returned.'}
                        </p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {customerList.slice(0, 10).map((c, idx) => (
                                <li key={idx} className="px-5 py-3">
                                    <p className="text-sm font-medium text-gray-900">
                                        {c.fullname || c.name || '—'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {c.mobile || '—'} · {c.project || ''}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">Suppliers ({supplierList.length})</h2>
                    </div>
                    {supplierList.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-gray-500">
                            {suppliers?.error || 'No suppliers returned.'}
                        </p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {supplierList.slice(0, 10).map((s, idx) => (
                                <li key={idx} className="px-5 py-3">
                                    <p className="text-sm font-medium text-gray-900">
                                        {s.fullname || s.name || s.businessName || '—'}
                                    </p>
                                    <p className="text-xs text-gray-500">{s.mobile || '—'}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900">Settlement totals</h2>
                    <div className="mt-3 space-y-2 text-xs">
                        <div>
                            <p className="font-medium text-gray-700">International</p>
                            <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-50 p-2 text-gray-600">
                                {JSON.stringify(internationalTotals, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Basic</p>
                            <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-50 p-2 text-gray-600">
                                {JSON.stringify(basicTotals, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Cash in / out</p>
                            <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-50 p-2 text-gray-600">
                                {JSON.stringify(cashInAndOutTotals, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Invoice &amp; repayments</p>
                            <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-50 p-2 text-gray-600">
                                {JSON.stringify(invoiceTotals, null, 2)}
                            </pre>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">Open invoices ({openInvoiceList.length})</h2>
                    </div>
                    {openInvoiceList.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-gray-500">
                            {openInvoices?.error || 'No open invoices.'}
                        </p>
                    ) : (
                        <pre className="max-h-60 overflow-auto px-5 py-4 text-xs text-gray-600">
                            {JSON.stringify(openInvoiceList.slice(0, 20), null, 2)}
                        </pre>
                    )}
                </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">Receipts ({receiptList.length})</h2>
                    </div>
                    {receiptList.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-gray-500">
                            {receipts?.error || 'No receipts.'}
                        </p>
                    ) : (
                        <pre className="max-h-60 overflow-auto px-5 py-4 text-xs text-gray-600">
                            {JSON.stringify(receiptList.slice(0, 20), null, 2)}
                        </pre>
                    )}
                </section>

                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">Repayment history ({repaymentList.length})</h2>
                    </div>
                    {repaymentList.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-gray-500">
                            {repaymentHistory?.error || 'No repayments.'}
                        </p>
                    ) : (
                        <pre className="max-h-60 overflow-auto px-5 py-4 text-xs text-gray-600">
                            {JSON.stringify(repaymentList.slice(0, 20), null, 2)}
                        </pre>
                    )}
                </section>
            </div>
        </ErpLayout>
    );
}
