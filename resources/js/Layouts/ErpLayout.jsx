import Brand from '@/Components/Brand';
import FlashMessages from '@/Components/Ui/FlashMessages';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

function Icon({ path }) {
    return (
        <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.6"
            stroke="currentColor"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );
}

const icons = {
    dashboard:
        'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
    products:
        'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
    categories:
        'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z',
    inventory:
        'M20.25 7.5l-8.25 4.5-8.25-4.5m16.5 0L12 3 3.75 7.5m16.5 0v9L12 21l-8.25-4.5v-9M12 12v9',
    orders:
        'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
    customers:
        'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    suppliers:
        'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
    purchase:
        'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z',
    integration:
        'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
    storefront:
        'M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z',
};

const navigation = [
    {
        label: 'Overview',
        items: [{ name: 'Dashboard', route: 'erp.dashboard', icon: icons.dashboard, pattern: 'erp.dashboard' }],
    },
    {
        label: 'Catalogue',
        items: [
            { name: 'Products', route: 'erp.products.index', icon: icons.products, pattern: 'erp.products.*' },
            { name: 'Categories', route: 'erp.categories.index', icon: icons.categories, pattern: 'erp.categories.*' },
            { name: 'Inventory', route: 'erp.inventory.index', icon: icons.inventory, pattern: 'erp.inventory.*' },
        ],
    },
    {
        label: 'Sales',
        items: [
            { name: 'Orders', route: 'erp.orders.index', icon: icons.orders, pattern: 'erp.orders.*' },
            { name: 'Customers', route: 'erp.customers.index', icon: icons.customers, pattern: 'erp.customers.*' },
        ],
    },
    {
        label: 'Purchasing',
        items: [
            { name: 'Suppliers', route: 'erp.suppliers.index', icon: icons.suppliers, pattern: 'erp.suppliers.*' },
            { name: 'Purchase orders', route: 'erp.purchase-orders.index', icon: icons.purchase, pattern: 'erp.purchase-orders.*' },
        ],
    },
    {
        label: 'Settings',
        items: [{ name: 'HellOOpass', route: 'erp.integration.index', icon: icons.integration, pattern: 'erp.integration.*' }],
    },
];

function SidebarContent({ onNavigate }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b border-gray-100 px-5">
                <Brand />
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
                {navigation.map((group) => (
                    <div key={group.label}>
                        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            {group.label}
                        </p>
                        <div className="mt-2 space-y-1">
                            {group.items.map((item) => {
                                const active = route().current(item.pattern);
                                return (
                                    <Link
                                        key={item.name}
                                        href={route(item.route)}
                                        onClick={onNavigate}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                            active
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <Icon path={item.icon} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="px-3 pt-2">
                    <Link
                        href={route('home')}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-emerald-300 hover:text-emerald-700"
                    >
                        <Icon path={icons.storefront} />
                        View storefront
                    </Link>
                </div>
            </nav>

            <div className="border-t border-gray-100 p-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                        {user.name?.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="truncate text-xs text-gray-500">{user.role_label}</p>
                    </div>
                </div>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                >
                    Log out
                </Link>
            </div>
        </div>
    );
}

export default function ErpLayout({ children }) {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-100 bg-white lg:block">
                <SidebarContent />
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        aria-label="Close navigation"
                        className="absolute inset-0 bg-gray-900/40"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
                        <SidebarContent onNavigate={() => setMobileOpen(false)} />
                    </aside>
                </div>
            )}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-gray-100 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 lg:hidden"
                            aria-label="Open navigation"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                        <div className="lg:hidden">
                            <Brand compact />
                        </div>
                        <p className="hidden text-sm text-gray-500 sm:block">
                            Signed in as{' '}
                            <span className="font-medium text-gray-900">{auth.user.name}</span> ·{' '}
                            {auth.user.role_label}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('home')}
                            className="hidden rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-emerald-300 hover:text-emerald-700 sm:inline-flex"
                        >
                            Storefront
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
                </header>

                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <FlashMessages />
                    <div className="mt-4 space-y-6">{children}</div>
                </main>
            </div>
        </div>
    );
}
