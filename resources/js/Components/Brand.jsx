import { Link } from '@inertiajs/react';

export default function Brand({ compact = false, light = false }) {
    return (
        <Link href={route('home')} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21c0-6.5 3.5-11 9-12-1 6.5-4.5 10.5-9 12z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21C7.5 19.5 4 15.5 4 9c5.5 1 8 5 8 12z"
                    />
                </svg>
            </span>
            {!compact && (
                <span className="leading-tight">
                    <span
                        className={`block text-sm font-semibold ${light ? 'text-white' : 'text-gray-900'}`}
                    >
                        EthioGreen
                    </span>
                    <span
                        className={`block text-[11px] font-medium uppercase tracking-wider ${light ? 'text-emerald-200' : 'text-emerald-600'}`}
                    >
                        ERP &amp; Shop
                    </span>
                </span>
            )}
        </Link>
    );
}
