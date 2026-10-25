import EmptyState from '@/Components/Ui/EmptyState';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { formatMoney } from '@/lib/format';
import { Head, Link, router } from '@inertiajs/react';

export default function Cart({ items, subtotal }) {
    const updateQuantity = (item, quantity) => {
        router.patch(
            route('cart.update', item.product.id),
            { quantity },
            { preserveScroll: true },
        );
    };

    const removeItem = (item) => {
        router.delete(route('cart.destroy', item.product.id), { preserveScroll: true });
    };

    return (
        <StorefrontLayout>
            <Head title="Your cart" />

            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">Your cart</h1>
                <p className="text-sm text-gray-500">
                    Review your basket before checking out with HellOOpass.
                </p>
            </div>

            {items.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <EmptyState
                        title="Your cart is empty"
                        description="Browse the catalogue and add fresh produce, grains or coffee to get started."
                        action={
                            <Link
                                href={route('shop.index')}
                                className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                Browse products
                            </Link>
                        }
                    />
                </div>
            ) : (
                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <ul className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <li key={item.product.id} className="flex gap-4 p-4 sm:p-5">
                                    <Link
                                        href={route('shop.show', item.product.slug)}
                                        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-emerald-50 to-lime-50"
                                    >
                                        {item.product.image_url ? (
                                            <img
                                                src={item.product.image_url}
                                                alt={item.product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl font-semibold text-emerald-600/40">
                                                {item.product.name.charAt(0)}
                                            </span>
                                        )}
                                    </Link>

                                    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0">
                                            <Link
                                                href={route('shop.show', item.product.slug)}
                                                className="line-clamp-1 text-sm font-semibold text-gray-900 hover:text-emerald-700"
                                            >
                                                {item.product.name}
                                            </Link>
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                {formatMoney(item.product.price)} per {item.product.unit}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {item.product.sku} · {item.product.stock_quantity} in stock
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                                            <div className="inline-flex items-center rounded-lg border border-gray-300">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(item, Math.max(1, item.quantity - 1))
                                                    }
                                                    className="px-2.5 py-1.5 text-gray-500 hover:text-gray-900"
                                                    aria-label="Decrease quantity"
                                                >
                                                    −
                                                </button>
                                                <span className="w-9 text-center text-sm font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item,
                                                            Math.min(item.product.stock_quantity, item.quantity + 1),
                                                        )
                                                    }
                                                    className="px-2.5 py-1.5 text-gray-500 hover:text-gray-900"
                                                    aria-label="Increase quantity"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="w-24 text-right">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {formatMoney(item.line_total)}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item)}
                                                    className="mt-1 text-xs font-medium text-rose-600 hover:text-rose-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-4 py-3 sm:px-5">
                            <Link
                                href={route('shop.index')}
                                className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                            >
                                ← Continue shopping
                            </Link>
                            <button
                                type="button"
                                onClick={() => router.delete(route('cart.clear'), { preserveScroll: true })}
                                className="text-sm font-medium text-gray-500 hover:text-rose-600"
                            >
                                Clear cart
                            </button>
                        </div>
                    </div>

                    <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Order summary</h2>
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

                        <Link
                            href={route('checkout.index')}
                            className="mt-5 flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Proceed to checkout
                        </Link>

                        <p className="mt-3 text-center text-xs leading-relaxed text-gray-500">
                            Pay securely in the HellOOpass app. Your order is prepared once the
                            payment is approved.
                        </p>
                    </aside>
                </div>
            )}
        </StorefrontLayout>
    );
}
