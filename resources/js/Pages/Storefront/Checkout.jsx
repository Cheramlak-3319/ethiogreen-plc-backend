import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { formatMoney } from '@/lib/format';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Checkout({ items, subtotal, customer, hellopassEnabled, wallets, merchantWallet }) {
    const { data, setData, post, processing, errors } = useForm({
        name: customer?.name ?? '',
        phone: customer?.phone ?? '',
        email: customer?.email ?? '',
        address: '',
        notes: '',
        payment_wallet: '',
    });

    const availableWallets = wallets
        ? [
              {
                  key: wallets.purchasewallet || wallets.purchaseWallet,
                  label: 'Purchase wallet',
                  balance: wallets.purchasebalance ?? wallets.purchaseBalance ?? 0,
              },
              {
                  key: wallets.creditwallet || wallets.creditWallet,
                  label: 'Regular (credit) wallet',
                  balance: wallets.creditbalance ?? wallets.creditBalance ?? 0,
              },
              ...(Array.isArray(wallets.gifts)
                  ? wallets.gifts.map((g) => ({
                        key: g.giftWallet,
                        label: g.label || 'Gift wallet',
                        balance: g.giftBalance ?? 0,
                    }))
                  : []),
          ].filter((w) => w.key)
        : [];

    const submit = (event) => {
        event.preventDefault();
        post(route('checkout.store'));
    };

    return (
        <StorefrontLayout>
            <Head title="Checkout" />

            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">Checkout</h1>
                <p className="text-sm text-gray-500">
                    Tell us where to deliver. Payment is confirmed through HellOOpass.
                </p>
            </div>

            <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="text-sm font-semibold text-gray-900">Delivery details</h2>

                        {Object.keys(errors).length > 0 && (
                            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                Please check the highlighted fields below.
                            </div>
                        )}

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="name" value="Full name" />
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    autoComplete="name"
                                    required
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone" value="Phone number" />
                                <input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(event) => setData('phone', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    placeholder="+251911000000"
                                    autoComplete="tel"
                                    required
                                />
                                <InputError message={errors.phone} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email (optional)" />
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(event) => setData('email', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    autoComplete="email"
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="address" value="Delivery address" />
                                <input
                                    id="address"
                                    type="text"
                                    value={data.address}
                                    onChange={(event) => setData('address', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    placeholder="Sub-city, woreda, landmark"
                                    autoComplete="street-address"
                                />
                                <InputError message={errors.address} className="mt-1" />
                            </div>

                            <div className="sm:col-span-2">
                                <InputLabel htmlFor="notes" value="Order notes (optional)" />
                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(event) => setData('notes', event.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    placeholder="Delivery instructions or anything we should know."
                                />
                                <InputError message={errors.notes} className="mt-1" />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-lg">
                                📱
                            </span>
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Payment with HellOOpass
                                </h2>
                                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                                    {hellopassEnabled
                                        ? 'After placing the order, we send a bill to your HellOOpass account. Approve it in the app and your order moves to processing automatically.'
                                        : 'HellOOpass payments are not configured for this environment yet. Your order will be recorded and our team will follow up with payment instructions.'}
                                </p>
                                {hellopassEnabled && wallets && (
                                    <div className="mt-3 space-y-3">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Choose the wallet to pay from
                                            </p>
                                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                                {availableWallets.map((wallet) => {
                                                    const selected =
                                                        data.payment_wallet === wallet.key ||
                                                        (data.payment_wallet === '' && wallet.label === 'Purchase wallet');
                                                    return (
                                                        <button
                                                            key={wallet.key}
                                                            type="button"
                                                            onClick={() => setData('payment_wallet', wallet.key)}
                                                            className={`rounded-lg border px-3 py-2 text-left transition ${
                                                                selected
                                                                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                                                                    : 'border-gray-200 bg-white hover:border-emerald-300'
                                                            }`}
                                                        >
                                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                                {wallet.label}
                                                            </p>
                                                            <p className="mt-0.5 font-mono text-sm font-semibold text-gray-900">
                                                                {wallet.key}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Balance: {formatMoney(wallet.balance)}
                                                            </p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Merchant wallet (receives payment)
                                            </p>
                                            <p className="mt-0.5 font-mono text-sm font-semibold text-gray-900">
                                                {merchantWallet || '—'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900">Your order</h2>

                    <ul className="mt-4 space-y-3 border-b border-gray-100 pb-4">
                        {items.map((item) => (
                            <li key={item.product.id} className="flex items-start justify-between gap-3 text-sm">
                                <div className="min-w-0">
                                    <p className="line-clamp-1 font-medium text-gray-900">
                                        {item.product.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {item.quantity} × {formatMoney(item.product.price)}
                                    </p>
                                </div>
                                <span className="shrink-0 font-medium text-gray-900">
                                    {formatMoney(item.line_total)}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <dl className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Subtotal</dt>
                            <dd className="font-medium text-gray-900">{formatMoney(subtotal)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Delivery</dt>
                            <dd className="font-medium text-emerald-700">Free</dd>
                        </div>
                        <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
                            <dt className="font-semibold text-gray-900">Total</dt>
                            <dd className="font-semibold text-gray-900">{formatMoney(subtotal)}</dd>
                        </div>
                    </dl>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-5 flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                    >
                        {processing ? 'Placing order…' : 'Place order'}
                    </button>

                    <Link
                        href={route('cart.index')}
                        className="mt-3 block text-center text-xs font-medium text-gray-500 hover:text-gray-900"
                    >
                        Back to cart
                    </Link>
                </aside>
            </form>
        </StorefrontLayout>
    );
}
