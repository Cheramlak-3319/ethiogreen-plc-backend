import EmptyState from '@/Components/Ui/EmptyState';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { formatDateTime, formatMoney, titleCase } from '@/lib/format';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

function WalletCard({ title, name, balance, currency = 'ETB' }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{title}</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{name || '—'}</p>
            <p className="mt-3 text-2xl font-bold text-emerald-600">
                {formatMoney(balance ?? 0, currency)}
            </p>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function JsonBlock({ data }) {
    if (!data) return <p className="text-sm text-gray-500">No data.</p>;
    if (data.error) {
        return <p className="text-sm text-rose-600">{String(data.error)}</p>;
    }
    return (
        <pre className="max-h-72 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
            {JSON.stringify(data, null, 2)}
        </pre>
    );
}

function BillRow({ bill, userId, onConfirm, onCancel, busy }) {
    const id =
        bill.bill_id || bill.billId || bill.id || bill.invoice_id || bill.invoiceId || bill.transactionId || '—';
    const status = bill.status || bill.payment_status || bill.state || 'unknown';
    const amount = bill.amount ?? bill.total ?? '—';
    const currency = bill.currency || 'ETB';
    const reference = bill.reference || bill.transactionId || bill.transaction_id || '';

    return (
        <li className="flex flex-col gap-3 border-b border-gray-100 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{id}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                    {reference && `${reference} · `}
                    {titleCase(status)}
                    {amount !== '—' && ` · ${formatMoney(amount, currency)}`}
                </p>
            </div>
            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => onConfirm(id)}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                    Confirm
                </button>
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => onCancel(id, userId)}
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                >
                    Cancel
                </button>
            </div>
        </li>
    );
}

export default function Hellopass() {
    const { customer, wallets, invoices, paymentHistory, topUpHistory, cashOutHistory, webhookEvents, phone, error, hellopassEnabled, merchantWallet } =
        usePage().props;
    const [busy, setBusy] = useState(false);
    const [sendForm, setSendForm] = useState({
        user_id: '',
        amount: '',
        title: 'Payment request',
        body: 'Please confirm this payment in HellOOpass.',
        customer_wallet: '',
    });

    const userId =
        customer?.userid || customer?.user_id || customer?.userId || customer?.id || null;

    const availableWallets = [
        customer?.purchasewallet || customer?.purchaseWallet,
        customer?.creditwallet || customer?.creditWallet,
        ...(Array.isArray(customer?.gifts) ? customer.gifts.map((g) => g.giftWallet) : []),
        ...(Array.isArray(customer?.wallets) ? customer.wallets.map((w) => w.name) : []),
    ].filter(Boolean);

    function handleSendBill(event) {
        event.preventDefault();
        setBusy(true);
        router.post(
            route('account.hellopass.send'),
            sendForm,
            { onFinish: () => setBusy(false), preserveScroll: true },
        );
    }

    const invoicesList = Array.isArray(invoices?.message)
        ? invoices.message
        : Array.isArray(invoices?.data)
        ? invoices.data
        : Array.isArray(invoices)
        ? invoices
        : [];

    const paymentList = Array.isArray(paymentHistory?.message)
        ? paymentHistory.message
        : Array.isArray(paymentHistory?.data)
        ? paymentHistory.data
        : [];

    const topUpList = Array.isArray(topUpHistory?.message)
        ? topUpHistory.message
        : Array.isArray(topUpHistory?.data)
        ? topUpHistory.data
        : Array.isArray(topUpHistory)
        ? topUpHistory
        : [];

    const cashOutList = Array.isArray(cashOutHistory?.message)
        ? cashOutHistory.message
        : Array.isArray(cashOutHistory?.data)
        ? cashOutHistory.data
        : Array.isArray(cashOutHistory)
        ? cashOutHistory
        : [];

    function handleConfirm(billId) {
        if (!billId || billId === '—') return;
        setBusy(true);
        router.post(
            route('account.hellopass.confirm', billId),
            {},
            { onFinish: () => setBusy(false), preserveScroll: true },
        );
    }

    function handleCancel(billId, uid) {
        if (!billId || billId === '—') return;
        setBusy(true);
        router.post(
            route('account.hellopass.cancel', billId),
            { user_id: uid },
            { onFinish: () => setBusy(false), preserveScroll: true },
        );
    }

    return (
        <StorefrontLayout>
            <Head title="HellOOpass account" />

            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                    HellOOpass account
                </h1>
                <p className="text-sm text-gray-500">
                    Your regular and purchase wallets, bills, and payment history from HellOOpass.
                </p>
            </div>

            {!hellopassEnabled && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    HellOOpass is not enabled in this environment.
                </div>
            )}

            {error && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {/* Wallets */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <WalletCard
                    title="Regular (credit) wallet"
                    name={customer?.fullname || customer?.name || '—'}
                    balance={customer?.creditbalance ?? customer?.creditBalance ?? customer?.balance}
                />
                <WalletCard
                    title="Purchase wallet"
                    name={customer?.purchasewallet || customer?.purchaseWallet || '—'}
                    balance={customer?.purchasebalance ?? customer?.purchaseBalance}
                />
                <WalletCard
                    title="Merchant available"
                    name={customer?.businessName || '—'}
                    balance={
                        customer?.wallets?.find((w) => w.wallettype === 'MERCHANT_AVAILABLE')?.balance
                    }
                />
            </div>

            {/* Customer details */}
            {customer && (
                <Section title="Account details">
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-gray-500">User ID</dt>
                            <dd className="font-medium text-gray-900">{userId || '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Mobile</dt>
                            <dd className="font-medium text-gray-900">{customer.mobile || phone || '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Project</dt>
                            <dd className="font-medium text-gray-900">{customer.project || '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Active</dt>
                            <dd className="font-medium text-gray-900">{customer.active === '1' ? 'Yes' : 'No'}</dd>
                        </div>
                    </dl>
                </Section>
            )}

            {/* Send a payment request */}
            <div className="mt-6">
                <Section title="Send a payment request">
                    <form onSubmit={handleSendBill} className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="text-xs font-medium text-gray-500">Member's HellOOpass ID</label>
                            <input
                                type="text"
                                value={sendForm.user_id}
                                onChange={(e) => setSendForm({ ...sendForm, user_id: e.target.value })}
                                placeholder="e.g. 251-00048-00007"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Amount (ETB)</label>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={sendForm.amount}
                                onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Title</label>
                            <input
                                type="text"
                                value={sendForm.title}
                                onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Pay into wallet (customer)</label>
                            <select
                                value={sendForm.customer_wallet}
                                onChange={(e) => setSendForm({ ...sendForm, customer_wallet: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                <option value="">Auto (purchase wallet)</option>
                                {availableWallets.map((w) => (
                                    <option key={w} value={w}>
                                        {w}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-gray-500">Note (optional)</label>
                            <textarea
                                value={sendForm.body}
                                onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })}
                                rows={2}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="sm:col-span-2 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                Merchant wallet: <span className="font-mono">{merchantWallet || '—'}</span>
                            </p>
                            <button
                                type="submit"
                                disabled={busy}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {busy ? 'Sending…' : 'Send payment request'}
                            </button>
                        </div>
                    </form>
                </Section>
            </div>

            {/* Invoices / Bills */}
            <div className="mt-6">
                <Section title="Bills & invoices">
                    {invoices?.error ? (
                        <p className="text-sm text-rose-600">{invoices.error}</p>
                    ) : invoicesList.length === 0 ? (
                        <EmptyState title="No bills" description="Bills from HellOOpass will appear here." />
                    ) : (
                        <ul>
                            {invoicesList.map((bill, idx) => (
                                <BillRow
                                    key={idx}
                                    bill={bill}
                                    userId={userId}
                                    onConfirm={handleConfirm}
                                    onCancel={handleCancel}
                                    busy={busy}
                                />
                            ))}
                        </ul>
                    )}
                </Section>
            </div>

            {/* Payment history */}
            <div className="mt-6">
                <Section title="Payment history">
                    {paymentHistory?.error ? (
                        <p className="text-sm text-rose-600">{paymentHistory.error}</p>
                    ) : paymentList.length === 0 ? (
                        <EmptyState title="No payments" description="Payment records will appear here." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="text-left text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="py-2 pr-4">Reference</th>
                                        <th className="py-2 pr-4">Amount</th>
                                        <th className="py-2 pr-4">Status</th>
                                        <th className="py-2 pr-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paymentList.map((p, idx) => (
                                        <tr key={idx}>
                                            <td className="py-2 pr-4 font-medium text-gray-900">
                                                {p.reference || p.transactionId || p.id || '—'}
                                            </td>
                                            <td className="py-2 pr-4">{formatMoney(p.amount, p.currency)}</td>
                                            <td className="py-2 pr-4">{titleCase(p.status || p.payment_status)}</td>
                                            <td className="py-2 pr-4 text-gray-500">
                                                {formatDateTime(p.createdon || p.created_at || p.date)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Section>
            </div>

            {/* Top-up history */}
            <div className="mt-6">
                <Section title="Top-up history">
                    {topUpHistory?.error ? (
                        <p className="text-sm text-rose-600">{topUpHistory.error}</p>
                    ) : topUpList.length === 0 ? (
                        <EmptyState title="No top-ups" description="Top-up records will appear here." />
                    ) : (
                        <JsonBlock data={topUpList} />
                    )}
                </Section>
            </div>

            {/* Cash-out history */}
            <div className="mt-6">
                <Section title="Cash-out history">
                    {cashOutHistory?.error ? (
                        <p className="text-sm text-rose-600">{cashOutHistory.error}</p>
                    ) : cashOutList.length === 0 ? (
                        <EmptyState title="No cash-outs" description="Cash-out records will appear here." />
                    ) : (
                        <JsonBlock data={cashOutList} />
                    )}
                </Section>
            </div>

            {/* Webhook events */}
            <div className="mt-6">
                <Section title="Recent webhook events">
                    {webhookEvents.length === 0 ? (
                        <EmptyState title="No events" description="Signed webhook deliveries will appear here." />
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {webhookEvents.map((e) => (
                                <li key={e.id} className="py-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-medium text-gray-900">{e.event_id}</span>
                                        <span className="text-xs text-gray-500">{formatDateTime(e.created_at)}</span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {e.type || e.event_type} · bill {e.bill_id || '—'} ·{' '}
                                        {e.processed_at ? 'processed' : 'pending'}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Section>
            </div>

            <div className="mt-6">
                <Link
                    href={route('account.orders')}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                    ← Back to my orders
                </Link>
            </div>
        </StorefrontLayout>
    );
}
