import ProductCard from '@/Components/Storefront/ProductCard';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { formatNumber } from '@/lib/format';
import { Head, Link } from '@inertiajs/react';

export default function Home({ featuredProducts, categories, stats }) {
    return (
        <StorefrontLayout>
            <Head title="Fresh groceries for Ethiopian homes & businesses" />

            <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-600 text-white">
                <div className="grid gap-8 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:items-center lg:py-16">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-50">
                            SunRipe by EthioGreen
                        </span>
                        <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                            Good food, grown here.
                            <br />
                            Delivered to your door.
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-emerald-50/90 sm:text-base">
                            Shop fresh produce, grains, coffee and pantry essentials.
                            Pay securely with HellOOpass and pay from anywhere in Ethiopia.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={route('shop.index')}
                                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                            >
                                Start shopping
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                            <Link
                                href={route('track.index')}
                                className="inline-flex items-center rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Track an order
                            </Link>
                        </div>

                        <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/20 pt-6">
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-emerald-100/80">
                                    Products
                                </dt>
                                <dd className="mt-1 text-2xl font-semibold">{formatNumber(stats.products)}</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-emerald-100/80">
                                    Orders served
                                </dt>
                                <dd className="mt-1 text-2xl font-semibold">{formatNumber(stats.orders)}</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-emerald-100/80">
                                    Delivery
                                </dt>
                                <dd className="mt-1 text-2xl font-semibold">24h</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="relative hidden lg:block">
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-2 backdrop-blur">
                            <img
                                src="/images/brand/sunripe-harvest.jpg"
                                alt="SunRipe by EthioGreen — sun-dried produce"
                                className="h-72 w-full rounded-2xl object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-4 -left-4 w-44 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
                            <img
                                src="/images/brand/sunripe-solar-drying.jpg"
                                alt="SunRipe solar drying facility"
                                className="h-28 w-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-12">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                            Shop by category
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Everything you need, organised the way you cook.
                        </p>
                    </div>
                    <Link
                        href={route('shop.index')}
                        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                        Browse all →
                    </Link>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={route('shop.index', { category: category.slug })}
                            className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-lg text-emerald-700">
                                {category.name.charAt(0)}
                            </span>
                            <p className="mt-3 text-sm font-semibold text-gray-900 group-hover:text-emerald-700">
                                {category.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                {formatNumber(category.products_count)} products
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="mt-12">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                            Featured this week
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Hand-picked staples our customers reorder the most.
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {featuredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} featured />
                    ))}
                </div>

                {featuredProducts.length === 0 && (
                    <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                        Featured products will appear here once the catalogue is stocked.
                    </div>
                )}
            </section>

            <section className="mt-12 grid gap-4 sm:grid-cols-3">
                {[
                    {
                        title: 'Pay with HellOOpass',
                        body: 'Approve your bill in the HellOOpass app and we prepare your order instantly.',
                        icon: '📱',
                    },
                    {
                        title: 'Freshness guaranteed',
                        body: 'Produce is sourced weekly from vetted cooperatives and cold-stored on arrival.',
                        icon: '🌱',
                    },
                    {
                        title: 'Delivery in Addis',
                        body: 'Same-day dispatch for orders placed before 2pm, next-day delivery elsewhere.',
                        icon: '🚚',
                    },
                ].map((feature) => (
                    <div key={feature.title} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <span className="text-2xl">{feature.icon}</span>
                        <h3 className="mt-3 text-sm font-semibold text-gray-900">{feature.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-gray-500">{feature.body}</p>
                    </div>
                ))}
            </section>
        </StorefrontLayout>
    );
}
