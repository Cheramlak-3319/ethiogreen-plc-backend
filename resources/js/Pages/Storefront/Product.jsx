import ProductCard from '@/Components/Storefront/ProductCard';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { formatMoney } from '@/lib/format';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Product({ product, related }) {
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    const maxQuantity = Math.max(product.stock_quantity, 1);

    const addToCart = () => {
        setAdding(true);
        router.post(
            route('cart.store', product.id),
            { quantity },
            {
                preserveScroll: true,
                onFinish: () => setAdding(false),
            },
        );
    };

    return (
        <StorefrontLayout>
            <Head title={product.name} />

            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
                <Link href={route('home')} className="hover:text-emerald-700">
                    Home
                </Link>
                <span>/</span>
                <Link href={route('shop.index')} className="hover:text-emerald-700">
                    Shop
                </Link>
                {product.category && (
                    <>
                        <span>/</span>
                        <Link
                            href={route('shop.index', { category: product.category.slug })}
                            className="hover:text-emerald-700"
                        >
                            {product.category.name}
                        </Link>
                    </>
                )}
                <span>/</span>
                <span className="font-medium text-gray-900">{product.name}</span>
            </nav>

            <div className="mt-5 grid gap-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:grid-cols-2 lg:p-8">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-lime-50 to-amber-50">
                    <div className="flex aspect-square items-center justify-center">
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-8xl font-semibold text-emerald-600/30">
                                {product.name.charAt(0)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                        {product.category?.name ?? 'EthioGreen'}
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                        {product.name}
                    </h1>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="text-2xl font-semibold text-gray-900">
                            {formatMoney(product.price)}
                        </span>
                        <span className="text-sm text-gray-500">per {product.unit}</span>
                        {product.stock_quantity > 0 ? (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                In stock · {product.stock_quantity} {product.unit}
                            </span>
                        ) : (
                            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                                Sold out
                            </span>
                        )}
                    </div>

                    <p className="mt-5 text-sm leading-relaxed text-gray-600">
                        {product.short_description ?? product.description}
                    </p>

                    <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center rounded-lg border border-gray-300">
                                <button
                                    type="button"
                                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                                    className="px-3 py-2 text-gray-500 transition hover:text-gray-900"
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max={maxQuantity}
                                    value={quantity}
                                    onChange={(event) =>
                                        setQuantity(
                                            Math.min(
                                                maxQuantity,
                                                Math.max(1, Number(event.target.value) || 1),
                                            ),
                                        )
                                    }
                                    className="w-14 border-0 p-0 text-center text-sm focus:ring-0"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setQuantity((value) => Math.min(maxQuantity, value + 1))
                                    }
                                    className="px-3 py-2 text-gray-500 transition hover:text-gray-900"
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={addToCart}
                                disabled={adding || product.stock_quantity === 0}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:flex-none"
                            >
                                {adding ? 'Adding…' : 'Add to cart'}
                            </button>

                            <Link
                                href={route('cart.index')}
                                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                            >
                                View cart
                            </Link>
                        </div>

                        <dl className="grid gap-2 text-sm sm:grid-cols-2">
                            <div className="flex justify-between gap-2 border-b border-gray-50 py-1.5">
                                <dt className="text-gray-500">SKU</dt>
                                <dd className="font-medium text-gray-900">{product.sku}</dd>
                            </div>
                            <div className="flex justify-between gap-2 border-b border-gray-50 py-1.5">
                                <dt className="text-gray-500">Unit</dt>
                                <dd className="font-medium text-gray-900">{product.unit}</dd>
                            </div>
                            <div className="flex justify-between gap-2 border-b border-gray-50 py-1.5">
                                <dt className="text-gray-500">Reorder level</dt>
                                <dd className="font-medium text-gray-900">{product.reorder_level}</dd>
                            </div>
                            <div className="flex justify-between gap-2 border-b border-gray-50 py-1.5">
                                <dt className="text-gray-500">Delivery</dt>
                                <dd className="font-medium text-gray-900">Addis Ababa · 24h</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            {product.description && (
                <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
                    <h2 className="text-base font-semibold text-gray-900">Product details</h2>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                        {product.description}
                    </p>
                </section>
            )}

            {related.length > 0 && (
                <section className="mt-10">
                    <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                        You may also like
                    </h2>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {related.map((item) => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </div>
                </section>
            )}
        </StorefrontLayout>
    );
}
