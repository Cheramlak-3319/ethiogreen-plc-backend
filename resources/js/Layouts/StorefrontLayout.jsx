import Brand from '@/Components/Brand';
import FlashMessages from '@/Components/Ui/FlashMessages';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const iconClass = 'h-5 w-5';

function CartIcon() {
    return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
        </svg>
    );
}

function NavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
            {children}
        </Link>
    );
}

export default function StorefrontLayout({ children }) {
    const { auth, cartCount, appName } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const user = auth?.user;

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-8">
                        <Brand />
                        <nav className="hidden items-center gap-1 md:flex">
                            <NavLink href={route('home')} active={route().current('home')}>
                                Home
                            </NavLink>
                            <NavLink href={route('shop.index')} active={route().current('shop.*')}>
                                Shop
                            </NavLink>
                            <NavLink href={route('track.index')} active={route().current('track.*')}>
                                Track order
                            </NavLink>
                            {user?.is_staff && (
                                <NavLink href={route('erp.dashboard')} active={false}>
                                    ERP
                                </NavLink>
                            )}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('cart.index')}
                            className="relative inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                        >
                            <CartIcon />
                            <span className="hidden sm:inline">Cart</span>
                            {cartCount > 0 && (
                                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[11px] font-semibold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="hidden items-center gap-2 sm:flex">
                                <Link
                                    href={route('account.orders')}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                                >
                                    My orders
                                </Link>
                                <Link
                                    href={route('account.hellopass')}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                                >
                                    My wallet
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                                >
                                    Log out
                                </Link>
                            </div>
                        ) : (
                            <div className="hidden items-center gap-2 sm:flex">
                                <Link
                                    href={route('login')}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                                >
                                    Create account
                                </Link>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setMobileOpen((open) => !open)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 md:hidden"
                            aria-label="Toggle navigation"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                {mobileOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
                        <div className="flex flex-col gap-1">
                            <NavLink href={route('home')} active={route().current('home')}>
                                Home
                            </NavLink>
                            <NavLink href={route('shop.index')} active={route().current('shop.*')}>
                                Shop
                            </NavLink>
                            <NavLink href={route('track.index')} active={route().current('track.*')}>
                                Track order
                            </NavLink>
                            {user ? (
                                <>
                                    <NavLink href={route('account.orders')} active={route().current('account.orders')}>
                                        My orders
                                    </NavLink>
                                    <NavLink href={route('account.hellopass')} active={route().current('account.hellopass')}>
                                        My wallet
                                    </NavLink>
                                    {user.is_staff && (
                                        <NavLink href={route('erp.dashboard')} active={false}>
                                            ERP dashboard
                                        </NavLink>
                                    )}
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="rounded-md px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                                    >
                                        Log out
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <NavLink href={route('login')} active={false}>
                                        Log in
                                    </NavLink>
                                    <NavLink href={route('register')} active={false}>
                                        Create account
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
                <FlashMessages />
                <div className="mt-4">{children}</div>
            </main>

            <footer className="border-t border-gray-100 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <div className="space-y-1">
                        <p className="font-semibold text-gray-900">{appName}</p>
                        <p>Fresh produce, pantry staples and coffee delivered across Addis Ababa.</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <span>Bole, Addis Ababa</span>
                        <span>+251 911 000 000</span>
                        <span>hello@ethiogreen.test</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
