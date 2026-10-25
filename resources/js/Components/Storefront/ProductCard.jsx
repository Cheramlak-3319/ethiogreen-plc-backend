import { formatMoney } from '@/lib/format';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ProductCard({ product, featured = false }) {
    const [adding, setAdding] = useState(false);

    const addToCart = () => {
        setAdding(true);
        router.post(
            route('cart.store', product.id),
            { quantity: 1 },
            {
                preserveScroll: true,
                onFinish: () => setAdding(false),
            },
        );
    };

    return (
        <article className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <Link
                href={route('shop.show', product.slug)}
                className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-emerald-50 via-lime-50 to-amber-50"
            >
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <span className="flex h-full w-full items-center justify-center text-4xl font-semibold text-emerald-600/40">
                        {product.name?.charAt(0)}
                    </span>
                )}

                {product.stock_quantity === 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-gray-900/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                        Sold out
                    </span>
                )}

                {featured && product.stock_quantity > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-950">
                        Featured
                    </span>
                )}
            </Link>

            <div className="flex flex-1 flex-col p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                    {product.category?.name ?? 'EthioGreen'}
                </p>
                <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-gray-900">
                    <Link href={route('shop.show', product.slug)}>{product.name}</Link>
                </h3>
                <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-gray-500">
                    {product.short_description ?? product.description}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">
                            {formatMoney(product.price)}
                        </p>
                        <p className="text-[11px] text-gray-400">per {product.unit}</p>
                    </div>

                    <button
                        type="button"
                        onClick={addToCart}
                        disabled={adding || product.stock_quantity === 0}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        {adding ? 'Adding…' : 'Add'}
                    </button>
                </div>
            </div>
        </article>
    );
}
